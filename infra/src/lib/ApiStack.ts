import { Construct } from 'constructs';
import {
  AuthorizationType,
  FieldLogLevel,
  GraphqlApi,
  IGraphqlApi,
  ISchema
} from '@aws-cdk/aws-appsync-alpha';
import {
  Expiration,
  Stack,
  StackProps,
  Duration,
  CfnOutput,
} from 'aws-cdk-lib';
import { Architecture, Code, Function, Runtime, StartingPosition } from 'aws-cdk-lib/aws-lambda';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

import { typeDefs } from '@layuplist/schema';

import createCourseResolvers from '../utils/resolvers/courseResolvers';
import createReviewResolvers from '../utils/resolvers/reviewResolvers';

const SchemaString = (definition: string): ISchema => ({
  bind: (api: IGraphqlApi) => ({
    apiId: api.apiId,
    definition
  })
});

type ApiStackProps = StackProps & {
  tables: {
    courses: Table,
    offerings: Table,
    reviews: Table,
    professors: Table
  }
}

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // gql api

    const api = new GraphqlApi(this, 'graphql-api', {
      name: 'graphql-api',
      schema: SchemaString(typeDefs),
      xrayEnabled: true,
      authorizationConfig: {
        defaultAuthorization: {
          // TODO - REMOVE BEFORE LAUNCH
          authorizationType: AuthorizationType.API_KEY,
          apiKeyConfig: {
            name: 'dev key',
            description: 'temp key for dev use',
            expires: Expiration.after(Duration.days(30))
          }
        }
      },
      logConfig: {
        fieldLogLevel: FieldLogLevel.ALL
      }
    });

    // data sources

    const coursesLambda = new Function(this, 'appsync-courses-resolver', {
      functionName: 'appsync-courses-resolver',
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.default',
      code: Code.fromAsset('../backend/dist/handlers/resolvers/courses'),
      memorySize: 256,
      architecture: Architecture.ARM_64,
      environment: {
        COURSES_TABLE: props.tables.courses.tableName
      }
    });
    props.tables.courses.grantFullAccess(coursesLambda);
    const coursesDataSource = api.addLambdaDataSource(
      // appsync requires this to be in UpperCamel, so it is intentionally 
      // inconsistent with the rest of our resource naming
      'CoursesDataSource',
      coursesLambda
    );

    const reviewsLambda = new Function(this, 'appsync-reviews-resolver', {
      functionName: 'appsync-reviews-resolver',
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.default',
      code: Code.fromAsset('../backend/dist/handlers/resolvers/reviews'),
      memorySize: 256,
      architecture: Architecture.ARM_64,
      environment: {
        REVIEWS_TABLE: props.tables.reviews.tableName
      }
    });
    props.tables.reviews.grantFullAccess(reviewsLambda);
    const reviewsDataSource = api.addLambdaDataSource(
      'ReviewsDataSource',
      reviewsLambda
    );

    // resolvers

    createCourseResolvers(coursesDataSource);
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
      }
    });
    props.tables.courses.grantFullAccess(reviewStreamLambda);
    reviewStreamLambda.addEventSource(new DynamoEventSource(props.tables.reviews, {
      startingPosition: StartingPosition.LATEST
    }));

    // outputs

    new CfnOutput(this, 'graphql-api-url', {
      value: api.graphqlUrl
    });
    new CfnOutput(this, 'graphql-api-key', {
      value: api.apiKey as string
    });
  }
}
