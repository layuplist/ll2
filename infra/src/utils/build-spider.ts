import * as fs from 'fs';
import { clone } from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import { spawn, SpawnOptionsWithoutStdio } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const SPIDER_REPOSITORY_URL = process.env.SPIDER_REPOSITORY_URL!;
console.assert(!!SPIDER_REPOSITORY_URL, 'repository url is not set in the environment');
const LOCAL_STAGING_DIR = `/tmp/spider`;

export default async (): Promise<string> => {
  console.info('Building spider... 🔨');

  // prepare empty staging dir
  if (fs.existsSync(LOCAL_STAGING_DIR)) {
    console.info('Clearing previous build 🧹')
    fs.rmdirSync(LOCAL_STAGING_DIR, { recursive: true });
  }
  fs.mkdirSync(LOCAL_STAGING_DIR);

  // clone source
  console.info(`Cloning repo: ${SPIDER_REPOSITORY_URL}`);
  await clone({
    fs,
    http,
    dir: LOCAL_STAGING_DIR,
    url: SPIDER_REPOSITORY_URL,
    singleBranch: true,
    depth: 1
  });

  // build
  const spawnAndAwaitProcess = (
    command: string,
    args: string[],
    options?: SpawnOptionsWithoutStdio | undefined
  ) => new Promise((resolve, reject) => {
    console.info(`Running ${command} ${args}`);
    const proc = spawn(command, args, options);
    proc.stdout.pipe(process.stdout);
    proc.on('exit', (code) => {
      console.info(`process ${command} ${args.join(' ')} exited with code: ${code}`);
      resolve(code)
    });
    proc.on('error', reject);
  });

  await spawnAndAwaitProcess('yarn', [], { cwd: LOCAL_STAGING_DIR });
  await spawnAndAwaitProcess('yarn', ['build'], { cwd: LOCAL_STAGING_DIR });

  const assetDir = LOCAL_STAGING_DIR + '/dist';
  console.info(`Build complete, assets in ${assetDir} 🚀`);
  return assetDir;
};
