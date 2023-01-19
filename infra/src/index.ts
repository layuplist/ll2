#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

import { InfraStack } from './lib/InfraStack';
import { ClientStack } from './lib/ClientStack';
import { ApiStack } from './lib/ApiStack';

const ACCOUNT = '435094978882';
const REGION = 'us-east-1';

// this secret must be created manually in aws console under the above acct
const GITHUB_OAUTH_TOKEN_NAME = 'gh-oauth-token';

const CLIENT_REPO_OWNER = 'layuplist'
const CLIENT_REPO_NAME = 'll2';

const env = { account: ACCOUNT, region: REGION };

// create app
const app = new cdk.App();

// create stacks
const infra = new InfraStack(app, 'infra-stack', { env });
const client = new ClientStack(app, 'client-stack', {
  env,
  owner: CLIENT_REPO_OWNER,
  repository: CLIENT_REPO_NAME,
  githubOauthTokenName: GITHUB_OAUTH_TOKEN_NAME
});
const data = new ApiStack(app, 'api-stack', {
  env,
  tables: infra.tables
});
