import { Construct } from 'constructs';
import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, BillingMode, StreamViewType, Table } from 'aws-cdk-lib/aws-dynamodb';

const isProd = process.env.NODE_ENV === 'production';

export class InfraStack extends Stack {
  tables: {
    courses: Table,
    offerings: Table,
    reviews: Table,
    professors: Table
  };

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const coursesTable = new Table(this, 'courses-table', {
      tableName: 'courses-table',
      removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING
      }
      // partitionKey: {
      //   name: 'department',
      //   type: AttributeType.STRING
      // },
      // sortKey: {
      //   name: 'number',
      //   type: AttributeType.NUMBER
      // }
    });

    const offeringsTable = new Table(this, 'offerings-table', {
      tableName: 'offerings-table',
      removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING
      }
    });

    const reviewsTable = new Table(this, 'reviews-table', {
      tableName: 'reviews-table',
      removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING
      },
      stream: StreamViewType.NEW_AND_OLD_IMAGES
    });

    const professorsTable = new Table(this, 'professors-table', {
      tableName: 'professors-table',
      removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING
      }
    });

    this.tables = {
      courses: coursesTable,
      offerings: offeringsTable,
      reviews: reviewsTable,
      professors: professorsTable
    };
  }
}
