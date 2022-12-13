#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { InfraStack } from '../lib/infra-stack';

const ACCOUNT = '435094978882';
const REGION = 'us-east-1';

const env = { account: ACCOUNT, region: REGION };

// create app
const app = new cdk.App();

// create stacks
new InfraStack(app, 'InfraStack', { env });
