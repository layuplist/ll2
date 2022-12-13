#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

import { InfraStack } from '../lib/InfraStack';
import { ClientStack } from '../lib/ClientStack';
import { author, repository } from '../../package.json';

const ACCOUNT = '435094978882';
const REGION = 'us-east-1';

// this secret must be created manually in aws console under the above acct
const GITHUB_OAUTH_TOKEN_NAME = 'gh-oauth-token';

const env = { account: ACCOUNT, region: REGION };

// create app
const app = new cdk.App();

// create stacks
new InfraStack(app, 'infra-stack', { env });
new ClientStack(app, 'client-stack', {
  env,
  owner: author,
  repository,
  githubOauthTokenName: GITHUB_OAUTH_TOKEN_NAME
});
