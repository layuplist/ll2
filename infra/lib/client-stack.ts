import * as cdk from 'aws-cdk-lib';
import { SecretValue } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { App, GitHubSourceCodeProvider } from '@aws-cdk/aws-amplify-alpha';

import { repository } from '../../package.json';

export class ClientStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const app = new App(this, 'amplify-app', {
      sourceCodeProvider: new GitHubSourceCodeProvider({
        owner: 'dplanner-bot',
        repository,
        oauthToken: SecretValue.secretsManager('github-token')
      }),
      buildSpec: 
    })
  }
}
