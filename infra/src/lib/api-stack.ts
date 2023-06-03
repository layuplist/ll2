import { Effect, Group, IGrantable, PolicyStatement, User } from 'aws-cdk-lib/aws-iam';
import type { Construct } from 'constructs';
import {
  AuthorizationType,
  FieldLogLevel,
  GraphqlApi,
  SchemaFile
} from '@aws-cdk/aws-appsync-alpha';
import {
  Expiration,
  Stack,
  StackProps,
  Duration,
  CfnOutput,
  CfnParameter,
} from 'aws-cdk-lib';
import { Architecture, Code, Function, FunctionUrlAuthType, Runtime, StartingPosition } from 'aws-cdk-lib/aws-lambda';
import { ITable, Table } from 'aws-cdk-lib/aws-dynamodb';
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { IdentityPool, UserPoolAuthenticationProvider } from '@aws-cdk/aws-cognito-identitypool-alpha';

import createCourseResolvers from '../utils/resolvers/course-resolvers';
import createOfferingResolvers from '../utils/resolvers/offering-resolvers';
import createReviewResolvers from '../utils/resolvers/review-resolvers';
import { DEFAULT_LOG_RETENTION_DURATION } from '../utils/constants';

type ApiStackProps = StackProps & {
  auth: {
    userPool: UserPool,
    userPoolClient: UserPoolClient
  },
  tables: {
    courses: Table,
    offerings: Table,
    reviews: Table,
    professors: Table
  }
}

export class ApiStack extends Stack {
  api: GraphqlApi;
  adminGroup: Group;
  serviceUser: User;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // gql api

    this.api = new GraphqlApi(this, 'graphql-api', {
      name: 'graphql-api',
      schema: new SchemaFile({
        filePath: '../schema/dist/schema.graphql'
      }),
      xrayEnabled: true,
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.IAM,
        },
        additionalAuthorizationModes: [
          {
            authorizationType: AuthorizationType.USER_POOL,
            userPoolConfig: {
              userPool: props.auth.userPool
            }
          },
          {
            authorizationType: AuthorizationType.API_KEY,
            apiKeyConfig: {
              name: 'dev key',
              description: 'temp key for dev use',
              expires: Expiration.after(Duration.days(30))
            }
          }
        ]
      },
      logConfig: {
        fieldLogLevel: FieldLogLevel.ALL,
        retention: DEFAULT_LOG_RETENTION_DURATION
      }
    });

    // allow public (unauthenticated) access to several queries
    // create identity pool for unauthenticated role
    const identityPool = new IdentityPool(this, 'identity-pool', {
      identityPoolName: 'identity-pool',
      allowUnauthenticatedIdentities: true,
      authenticationProviders: {
        userPools: [
          new UserPoolAuthenticationProvider({
            userPool: props.auth.userPool,
            userPoolClient: props.auth.userPoolClient
          })
        ]
      }
    });
    // grant unauthed role access to public queries
    this.api.grantQuery(identityPool.unauthenticatedRole, ...[
      'getCourse',
      'listCourses',
      'getOffering',
      'listOfferings',
      'getReview',
      'listReviews'
    ]);

    // create iam admin group + service user
    this.adminGroup = new Group(this, 'admin-iam-group', {
      groupName: 'admin-iam-group'
    });
    this.serviceUser = new User(this, 'admin-service-user', {
      userName: 'admin-service-user',
      groups: [this.adminGroup]
    });
    this.api.grantQuery(this.adminGroup, '*');
    this.api.grantMutation(this.adminGroup, '*');

    // data sources

    // some resolvers require access to tables other than their primary targets
    // in order to execute necessary followup operations after mutations
    const lambdaResolverEnvironment = {
      COURSES_TABLE: props.tables.courses.tableName,
      OFFERINGS_TABLE: props.tables.offerings.tableName,
      REVIEWS_TABLE: props.tables.reviews.tableName,
      PROFESSORS_TABLE: props.tables.professors.tableName
    };
    const grantFullAccessToAllTables = (lambda: IGrantable, tables: ITable[]) => {
      tables.forEach(table => table.grantFullAccess(lambda));
    };

    const coursesLambda = new Function(this, 'appsync-courses-resolver', {
      functionName: 'appsync-courses-resolver',
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.default',
      code: Code.fromAsset('../backend/dist/handlers/resolvers/courses'),
      memorySize: 256,
      architecture: Architecture.ARM_64,
      environment: lambdaResolverEnvironment,
      logRetention: DEFAULT_LOG_RETENTION_DURATION
    });
    grantFullAccessToAllTables(coursesLambda, Object.values(props.tables));
    const coursesDataSource = this.api.addLambdaDataSource(
      // appsync requires this to be in UpperCamel, so it is intentionally 
      // inconsistent with the rest of our resource naming
      'CoursesDataSource',
      coursesLambda
    );

    const offeringsLambda = new Function(this, 'appsync-offerings-resolver', {
      functionName: 'appsync-offerings-resolver',
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.default',
      code: Code.fromAsset('../backend/dist/handlers/resolvers/offerings'),
      memorySize: 256,
      architecture: Architecture.ARM_64,
      environment: lambdaResolverEnvironment,
      logRetention: DEFAULT_LOG_RETENTION_DURATION
    });
    grantFullAccessToAllTables(offeringsLambda, Object.values(props.tables));
    const offeringsDataSource = this.api.addLambdaDataSource(
      'OfferingsDataSource',
      offeringsLambda
    );

    const reviewsLambda = new Function(this, 'appsync-reviews-resolver', {
      functionName: 'appsync-reviews-resolver',
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.default',
      code: Code.fromAsset('../backend/dist/handlers/resolvers/reviews'),
      memorySize: 256,
      architecture: Architecture.ARM_64,
      environment: lambdaResolverEnvironment,
      logRetention: DEFAULT_LOG_RETENTION_DURATION
    });
    grantFullAccessToAllTables(reviewsLambda, Object.values(props.tables));
    const reviewsDataSource = this.api.addLambdaDataSource(
      'ReviewsDataSource',
      reviewsLambda
    );

    // resolvers

    createCourseResolvers(coursesDataSource);
    createOfferingResolvers(offeringsDataSource);
    createReviewResolvers(reviewsDataSource);

    // stream handlers

    const reviewStreamLambda = new Function(this, 'review-stream-handler', {
      functionName: 'review-stream-handler',
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.default',
      code: Code.fromAsset('../backend/dist/handlers/streams/reviews'),
      memorySize: 256,
      architecture: Architecture.ARM_64,
      environment: {
        COURSES_TABLE: props.tables.courses.tableName
      },
      logRetention: DEFAULT_LOG_RETENTION_DURATION
    });
    props.tables.courses.grantFullAccess(reviewStreamLambda);
    reviewStreamLambda.addEventSource(new DynamoEventSource(props.tables.reviews, {
      startingPosition: StartingPosition.LATEST
    }));

    // sync spider updates

    // this is passed as a parameter to allow for local dev overrides
    const spiderSyncLambdaTimeoutParameter = new CfnParameter(this, 'spider-sync-handler-timeout-parameter', {
      type: 'Number',
      default: 900
    });
    const spiderSyncLambda = new Function(this, 'spider-sync-handler', {
      functionName: 'spider-sync-handler',
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.default',
      code: Code.fromAsset('../backend/dist/handlers/spider/sync'),
      memorySize: 1536,
      timeout: Duration.seconds(spiderSyncLambdaTimeoutParameter.valueAsNumber),
      architecture: Architecture.ARM_64,
      environment: {
        GRAPHQL_ENDPOINT: this.api.graphqlUrl
      },
      logRetention: DEFAULT_LOG_RETENTION_DURATION
    });
    this.api.grantMutation(spiderSyncLambda, 'addOffering');
    spiderSyncLambda.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ['https://github.com']
      }
    });
    spiderSyncLambda.addToRolePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'ssm:GetParameter',
        'ssm:PutParameter'
      ],
      resources: ['arn:aws:ssm::*:parameter/DATA_ACTIVE_VERSION_*']
    }));

    // outputs

    new CfnOutput(this, 'graphql-api-url', {
      value: this.api.graphqlUrl
    });
    new CfnOutput(this, 'graphql-api-key', {
      value: this.api.apiKey as string
    });
  }
}
