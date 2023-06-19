import type { Construct } from 'constructs';
import { Architecture, Code, Function, IFunction, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import dotenv from 'dotenv';

import buildSpider from '../utils/build-spider';
import { Rule, RuleTargetInput, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { DEFAULT_LOG_RETENTION_DURATION } from '../utils/constants';
import { GraphqlApi } from '@aws-cdk/aws-appsync-alpha';

dotenv.config();

type SpiderStackProps = StackProps & {
  api: GraphqlApi
};

export class SpiderStack extends Stack {
  spider: IFunction | null;
  sync: IFunction | null;
  props: SpiderStackProps;

  constructor(scope: Construct, id: string, props: SpiderStackProps) {
    super(scope, id, props);

    this.spider = null;
    this.props = props;
  }

  async initialize() {
    const assetPath = await buildSpider();

    this.spider = new Function(this, 'spider-scrape-handler', {
      functionName: 'spider-scrape-handler',
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.default',
      code: Code.fromAsset(assetPath),
      memorySize: 1024,
      timeout: Duration.minutes(15),
      architecture: Architecture.ARM_64,
      environment: {
        CHANGES_DEFAULT_APPROVAL_THRESHOLD: '0.25',
        CHANGES_ENROLLMENT_APPROVAL_THRESHOLD: '0.50',
        REMOVED_DEFAULT_APPROVAL_THRESHOLD: '0.50',
        ADDED_DEFAULT_APPROVAL_THRESHOLD: '0.75',
        GH_USERNAME: process.env.GH_USERNAME!,
        GH_TOKEN: process.env.GH_TOKEN!
      },
      logRetention: DEFAULT_LOG_RETENTION_DURATION
    });

    // run timetable scrape 4x daily
    new Rule(this, 'spider-schedule-timetable', {
      targets: [new LambdaFunction(this.spider, {
        event: RuleTargetInput.fromObject({
          body: {
            type: 'timetable'
          }
        })
      })],
      schedule: Schedule.cron({
        minute: '0',
        hour: '*/6'
      })
    });

    // run orc scrape 1x daily
    new Rule(this, 'spider-schedule-orc', {
      targets: [new LambdaFunction(this.spider, {
        event: RuleTargetInput.fromObject({
          body: {
            type: 'orc'
          }
        })
      })],
      schedule: Schedule.cron({
        minute: '0',
        hour: '0'
      })
    });
  }
}
