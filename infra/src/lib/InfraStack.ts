import { Construct } from 'constructs';
import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';

export class InfraStack extends Stack {
  tables: {
    courses: Table,
    reviews: Table
  }

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const coursesTable = new Table(this, 'course-table', {
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING
      },
    });

    const reviewsTable = new Table(this, 'review-table', {
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING
      }
    });

    this.tables = {
      courses: coursesTable,
      reviews: reviewsTable
    };
  }
}
