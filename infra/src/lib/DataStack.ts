import { Construct } from 'constructs';
import { Stack, StackProps } from 'aws-cdk-lib';
import { GraphqlApi, IGraphqlApi, ISchema } from '@aws-cdk/aws-appsync-alpha';

import { typeDefs } from '@layuplist/schema';

const SchemaString = (definition: string): ISchema => ({
  bind: (api: IGraphqlApi) => ({
    apiId: api.apiId,
    definition
  })
});

export class DataStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const api = new GraphqlApi(this, 'data-api', {
      name: 'data-api',
      schema: SchemaString(typeDefs),
      xrayEnabled: true
    });
  }
}
