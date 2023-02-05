import {
  BatchGetCommandInput,
  BatchGetCommandOutput,
  DeleteCommand,
  DeleteCommandInput,
  GetCommandInput,
  GetCommandOutput,
  PutCommand,
  PutCommandInput,
  ScanCommand,
  ScanCommandInput,
  ScanCommandOutput,
  UpdateCommand,
  UpdateCommandInput
} from '@aws-sdk/lib-dynamodb'
import {
  BatchGetCommand,
  GetCommand
} from '@aws-sdk/lib-dynamodb';

import type { ValueOf } from 'utils/types';
import { docClient, generateDdbExpressionParams } from 'utils/ddb';
import { EmptyUpdateError, ItemAlreadyExistsError, ItemNotFoundError } from 'utils/errors';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';

// * generic queries

export const getItem = async (
  tableName: string,
  key: NonNullable<GetCommandInput['Key']>
): Promise<NonNullable<GetCommandOutput['Item']>> => {
  const params: GetCommandInput = {
    TableName: tableName,
    Key: key
  };

  const { Item } = await docClient.send(new GetCommand(params));
  if (Item == null) throw new ItemNotFoundError(key, tableName);

  return Item;
};

export const getItems = async (
  tableName: string,
  keys: NonNullable<GetCommandInput['Key']>[]
): Promise<ValueOf<NonNullable<BatchGetCommandOutput['Responses']>>> => {
  const params: BatchGetCommandInput = {
    RequestItems: {
      [tableName]: {
        Keys: keys
      }
    }
  };

  const { Responses } = await docClient.send(new BatchGetCommand(params));
  const items =  Responses ? Object.values(Responses!).flat() : [];
  if (items.length != keys.length) throw new ItemNotFoundError(keys, tableName);

  return items;
};

export const listItems = async (
  tableName: string,
  filter: Record<string, unknown>,
  comparator?: (key: string) => string
): Promise<NonNullable<ScanCommandOutput['Items']>> => {
  const { values, names, expression } = generateDdbExpressionParams(filter, comparator ?? '=');

  const params: ScanCommandInput = {
    TableName: tableName,
    ExpressionAttributeValues: values,
    ExpressionAttributeNames: names,
    FilterExpression: expression?.join(' and ') || undefined
  };

  const { Items } = await docClient.send(new ScanCommand(params));
  return Items ?? [];
};

// * generic mutations

export const addItem = async (
  tableName: string,
  item: PutCommandInput['Item'],
) => {
  const { values, names, expression } =
    generateDdbExpressionParams(item ? { id: item.id } : {}, '<>');

  const params: PutCommandInput = {
    TableName: tableName,
    Item: item,
    ExpressionAttributeValues: values,
    ExpressionAttributeNames: names,
    ConditionExpression: expression!.join(' and ')
  };

  try {
    await docClient.send(new PutCommand(params));
  } catch (err) {
    if (err instanceof ConditionalCheckFailedException) {
      throw new ItemAlreadyExistsError({ id: item?.id }, tableName);
    } else {
      throw err;
    }
  }
};

export const updateItem = async (
  tableName: string,
  key: Record<string, string | number>,
  update: Record<string, unknown>
) => {
  const { values, names, expression } = generateDdbExpressionParams(update, '=');
  if (!expression) throw new EmptyUpdateError();

  const params: UpdateCommandInput = {
    TableName: tableName,
    Key: key,
    ExpressionAttributeValues: values,
    ExpressionAttributeNames: names,
    UpdateExpression: `set ${expression.join(', ')}`
  };

  await docClient.send(new UpdateCommand(params));
};

export const deleteItem = async (
  tableName: string,
  key: Record<string, string | number>
) => {
  const params: DeleteCommandInput = {
    TableName: tableName,
    Key: key
  };

  await docClient.send(new DeleteCommand(params));
};
