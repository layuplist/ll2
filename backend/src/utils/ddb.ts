import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

import { isEmpty } from 'utils/misc';

const { REGION } = process.env;

// * setup db

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

// * helpers

export const generateDdbExpressionParams = (
  args: Record<string, unknown>,
  comparator: string | ((key: string) => string)
) => {
  const values: Record<string, NonNullable<unknown>> = {};
  const names: Record<string, NonNullable<string>> = {};
  const expression: string[] = [];

  Object.entries(args).forEach(([key, value]) => {
    if (value == null) return;

    // set value
    if (Array.isArray(value)) {
      values[`:${key}`] = `(${value.join(', ')})`;
    } else {
      values[`:${key}`] = value;
    }

    // avoid reserved keywords
    names[`#${key}`] = key;

    // add to expression
    if (typeof comparator === 'string' || comparator instanceof String) {
      expression.push(`#${key} ${comparator} :${key}`)
    } else {
      expression.push(`#${key} ${comparator(key)} :${key}`)
    }
  });

  return {
    values: isEmpty(values) ? undefined : values,
    names: isEmpty(names) ? undefined : names,
    expression: expression.length > 0 ? expression : undefined
  };
};
