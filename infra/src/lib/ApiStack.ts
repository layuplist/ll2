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
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Table } from 'aws-cdk-lib/aws-dynamodb';

import { typeDefs } from '@layuplist/schema';

import createCourseResolvers from '../utils/resolvers/courseResolvers';

const SchemaString = (definition: string): ISchema => ({
  bind: (api: IGraphqlApi) => ({
    apiId: api.apiId,
    definition
  })
});

type ApiStackProps = StackProps & {
  tables: {
    courses: Table,
    reviews: Table
  }
}

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

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

    const coursesLambda = new Function(this, 'appsync-courses-handler', {
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: Code.fromAsset('../backend/dist/resolvers/courses'),
      memorySize: 256,
      environment: {
        COURSES_TABLE: props.tables.courses.tableName
      }
    });
    props.tables.courses.grantFullAccess(coursesLambda);
    const coursesDataSource = api.addLambdaDataSource(
      'CoursesDataSource',
      coursesLambda
    );

    // resolvers

    createCourseResolvers(coursesDataSource);

    // outputs

    new CfnOutput(this, 'graphql-api-url', {
      value: api.graphqlUrl
    });
    new CfnOutput(this, 'graphql-api-key', {
      value: api.apiKey as string
    });
  }
}
