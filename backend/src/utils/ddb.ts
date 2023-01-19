import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const { REGION } = process.env;

export const ddbClient = new DynamoDBClient({ region: REGION })

const marshallOptions = {
  convertEmptyValues: true,
  removeUndefinedValues: false,
  convertClassInstanceToMap: true
};
const unmarshallOptions = {
  wrapNumbers: false
};
const translateConfig = { marshallOptions, unmarshallOptions };
export const docClient = DynamoDBDocumentClient
  .from(ddbClient, translateConfig);
