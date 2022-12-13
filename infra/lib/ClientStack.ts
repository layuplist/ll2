import * as path from 'path';
import { Construct } from 'constructs';
import { SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import { Asset } from 'aws-cdk-lib/aws-s3-assets';
import { App, CodeCommitSourceCodeProvider, GitHubSourceCodeProvider } from '@aws-cdk/aws-amplify-alpha';
import { BuildSpec } from 'aws-cdk-lib/aws-codebuild';
import { CfnApp } from 'aws-cdk-lib/aws-amplify';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';

type ClientStackProps = StackProps & {
  owner: string,
  repository: string,
  githubOauthTokenName: string
};

export class ClientStack extends Stack {
  constructor(scope: Construct, id: string, props: ClientStackProps) {
    super(scope, id, props);

    const role = new Role(this, 'amplify-admin-access-role', {
      assumedBy: new ServicePrincipal('amplify.amazonaws.com')
    });
    role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName(
      'AdministratorAccess-Amplify'
    ));

    const app = new App(this, 'client-app', {
      sourceCodeProvider: new GitHubSourceCodeProvider({
        owner: props.owner,
        repository: props.repository,
        oauthToken: SecretValue.secretsManager(props.githubOauthTokenName)
      }),
      buildSpec: BuildSpec.fromObjectToYaml({
        version: 1,
        frontend: {
          phases: {
            preBuild: {
              commands: ['yarn install --frozen-lockfile']
            },
            build: {
              commands: ['yarn build']
            }
          },
          artifacts: {
            baseDirectory: '.next',
            files: ['**/*']
          },
          cache: {
            paths: ['node_modules/**/*']
          }
        }
      }),
      role
    });

    // set platform (can only be set on l1 construct directly)
    const cfnApp = app.node.defaultChild as CfnApp;
    cfnApp.platform = 'WEB_COMPUTE';

    // set deployment branch
    app.addBranch('main', { stage: 'PRODUCTION' });
  }
}
