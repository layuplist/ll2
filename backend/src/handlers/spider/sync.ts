import { clone, log, checkout, writeRef, fetch } from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import * as fs from 'fs';
import { config } from 'aws-sdk';
import { AWSAppSyncClient } from 'aws-appsync';
import gql from 'graphql-tag';
import 'cross-fetch/polyfill';

import type { AddOfferingInput } from '@layuplist/schema';
import type { ORCCourse, TimetableOffering, Version, Versions } from 'utils/types';
import { getCurrentVersion, setCurrentVersion } from "utils/ssm";
import { Source } from 'utils/types';

// const { GRAPHQL_ENDPOINT } = process.env;
const GRAPHQL_ENDPOINT = 'https://cac4dlebpjf7dbhnceuncy53ia.appsync-api.us-east-1.amazonaws.com/graphql';

const DATA_REPOSITORY_URL = 'https://github.com/D-Planner/data.git';
const LOCAL_DIR = '/tmp/data';
const MIN_DEPTH = 25;

config.update({ region: 'us-east-1' });
const client = new AWSAppSyncClient({
  url: GRAPHQL_ENDPOINT!,
  region: 'us-east-1',
  auth: {
    credentials: config.credentials!,
    type: 'AWS_IAM'
  },
  disableOffline: true
});

const loadVersionsFile = (): Versions => {
  const versionsData = fs.readFileSync(LOCAL_DIR + '/versions.json');
  return JSON.parse(versionsData.toString());
};

const loadDataFile = (type: Source) => {
  const dataRaw = fs.readFileSync(LOCAL_DIR + `/current/${type}.json`);
  return JSON.parse(dataRaw.toString());
};

const createVersionRefs = async (refs = new Set()) => {
  const commits = (await log({ fs, dir: LOCAL_DIR })).map(c => c.oid);

  console.log(`Indexing versions in commits ${commits[0]}...${commits[commits.length - 1]} (${commits.length})`);
  for (const oid of commits) {
    await checkout({ fs, dir: LOCAL_DIR, ref: oid });
    let current;
    try {
      current = loadVersionsFile().current;
    } catch (e) {
      console.error(`\tversions file at commit ${oid} does not match expected format`);
      continue;
    }

    const timetableRef = `timetable/${current.timetable?.hash}`;
    if (timetableRef && !refs.has(timetableRef)) {
      await writeRef({ fs, dir: LOCAL_DIR, ref: timetableRef, value: oid });
      refs.add(timetableRef);
    }
    const orcRef = `orc/${current.orc?.hash}`;
    if (orcRef && !refs.has(orcRef)) {
      await writeRef({ fs, dir: LOCAL_DIR, ref: orcRef, value: oid });
      refs.add(orcRef);
    }
  }

  return refs;
};

const processVersionSet = async (versions: Version[], type: Source): Promise<Map<string, unknown>> => {
  const updates = new Map();

  for (const [idx, { hash, changed, timestamp }] of versions.entries()) {
    if (!changed) {
      console.error(`Version ${type}/${hash} has no [changed] field, and cannot be processed. It will be skipped.`);
      continue;
    }

    // checkout commit
    await checkout({ fs, dir: LOCAL_DIR, ref: `${type}/${hash}` });
    // parse changed course ids
    const courseIds = changed!.split(',');
    // load data
    const source = loadDataFile(type);

    console.info(`[${'='.repeat((idx / versions.length) * 20)}>${' '.repeat(20 - (idx / versions.length) * 20)}]`
      + ` Adding ${courseIds.length} updates from version ${type}/${hash}`);
    courseIds.forEach(id => {
      if (Object.keys(source).includes(id)) {
        updates.set(id, source[id]);
      } else {
        updates.set(id, {
          ...updates.get(id),
          [`lastSeenIn${type}`]: timestamp
        });
      }
    });
  }

  return updates;
}

const publishUpdate = async (offering: AddOfferingInput) => {
  // to simplify updates, we use AddOffering with 'overwrite' enabled
  const AddOfferingWithOverwrite = gql`
    mutation AddOfferingWithOverwrite($offering: AddOfferingInput!) {
      addOffering(offering: $offering, overwrite: true) {
        id,
        success
      }
    }
  `;

  return await client.mutate({
    mutation: AddOfferingWithOverwrite,
    fetchPolicy: 'no-cache',
    variables: {
      offering
    }
  });
};

export default async () => {
  // prepare empty staging dir
  if (fs.existsSync(LOCAL_DIR)) {
    fs.rmdirSync(LOCAL_DIR, { recursive: true });
  }
  fs.mkdirSync(LOCAL_DIR);

  // clone data repo
  let depth = MIN_DEPTH;
  await clone({
    fs,
    http,
    dir: LOCAL_DIR,
    url: DATA_REPOSITORY_URL,
    singleBranch: true,
    depth
  });

  // load versions data
  const versions = loadVersionsFile();

  // load active ll data versions
  const llTimetableVersion = await getCurrentVersion(Source.TIMETABLE);
  const llOrcVersion = await getCurrentVersion(Source.ORC);

  // create refs to make repo navigable by content hash
  let refs = await createVersionRefs();
  while (!refs.has(`timetable/${llTimetableVersion}`) || !refs.has(`orc/${llOrcVersion}`)) {
    depth *= 2;
    await fetch({
      fs,
      http,
      dir: LOCAL_DIR,
      url: DATA_REPOSITORY_URL,
      singleBranch: true,
      depth
    });
    const numRefs = refs.size;
    refs = await createVersionRefs(refs);
    // if more refs are not being found, assume all history has been scanned and move on
    if (numRefs == refs.size) {
      break;
    }
  }

  // get all unsynced versions
  const compareVersionTimestamps = (a: Version, b: Version) => {
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  };
  // timetable
  const sortedTimetableVersions = [...versions.archive.timetable, versions.current.timetable].sort(compareVersionTimestamps);
  const lastSyncedTimetableVersionIndex = llTimetableVersion
    ? sortedTimetableVersions.findIndex(({ hash }) => hash === llTimetableVersion)
    : 0;
  const unsyncedTimetableVersions = sortedTimetableVersions.splice(lastSyncedTimetableVersionIndex);
  console.info(`Found ${unsyncedTimetableVersions.length} unsynced timetable versions`);
  // orc
  const sortedOrcVersions = [...versions.archive.orc, versions.current.orc].sort(compareVersionTimestamps);
  const lastSyncedOrcVersionIndex = llOrcVersion
    ? sortedOrcVersions.findIndex(({ hash }) => hash === llOrcVersion)
    : 0;
  const unsyncedOrcVersions = sortedOrcVersions.splice(lastSyncedOrcVersionIndex);
  console.info(`Found ${unsyncedOrcVersions.length} unsynced orc versions`);

  // process + merge updates
  const updates = (await processVersionSet(unsyncedTimetableVersions, Source.TIMETABLE)) as Map<string, TimetableOffering & ORCCourse>;
  Object.entries(await processVersionSet(unsyncedOrcVersions, Source.ORC)).forEach(([id, update]) => {
    updates.set(id, {
      ...update,
      // timetable updates are more trustworthy (more structured dataset)
      // so we favor data from there in the event of a field overlap
      ...(updates.get(id) || {})
    });
  })

  console.info(`Compiled combined updates for ${updates.size} courses.`)
  for (const [, data] of updates) {
    // we assume all required properties are set, gql will validate this for us
    try {
      const res = await publishUpdate({
        crn: parseInt(data.crn!),
        department: data.subject!,
        number: data.number!,
        term: parseInt(data.term!),
        section: parseInt(data.section!),
        professorId: '',
        timeslot: data.periodCode!,
        title: data.title!,
        description: data.description!
      });
      console.info(`Published course: ${JSON.stringify(res.data)}`);
    } catch (e) {
      console.error(`Failed to publish offering update with the following data: ${JSON.stringify(data)}, ${e}`);
    }
  }

  // update complete, set new active version
  if (unsyncedTimetableVersions.length > 0) await setCurrentVersion(Source.TIMETABLE, unsyncedTimetableVersions[unsyncedTimetableVersions.length - 1].hash);
  if (unsyncedOrcVersions.length > 0) await setCurrentVersion(Source.ORC, unsyncedOrcVersions[unsyncedOrcVersions.length - 1].hash);
};
