import type { Construct } from 'constructs';
import { Stack, StackProps } from 'aws-cdk-lib';
import { AccountRecovery, UserPool, UserPoolClient, CfnUserPoolGroup, VerificationEmailStyle } from 'aws-cdk-lib/aws-cognito';

type AuthStackProps = StackProps;

export class AuthStack extends Stack {
  userPool: UserPool;
  userPoolClient: UserPoolClient;

  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);

    // cognito user pool

    this.userPool = new UserPool(this, 'user-pool', {
      userPoolName: 'user-pool',
      selfSignUpEnabled: true,
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      userVerification: {
        emailStyle: VerificationEmailStyle.CODE
      },
      signInAliases: {
        email: true
      },
      autoVerify: {
        email: true
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true
        }
      }
    });
    this.userPoolClient = new UserPoolClient(this, 'user-pool-client', {
      userPoolClientName: 'user-pool-client',
      userPool: this.userPool
    });

    // user groups

    new CfnUserPoolGroup(this, 'admin-group', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'admin',
      precedence: 0
    });
    new CfnUserPoolGroup(this, 'student-group', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'student',
      precedence: 5
    });
  }
}
