import {
  BatchGetCommand,
  BatchGetCommandInput,
  GetCommand,
  GetCommandInput,
  ScanCommand,
  ScanCommandInput,
  PutCommandInput,
  PutCommand
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

import type {
  MutationAddCourseArgs,
  QueryGetCourseByIdArgs,
  QueryGetCoursesArgs,
  QueryListCoursesArgs
} from '@layuplist/schema';

import type { AppSyncEvent } from 'utils/types';
import { isEmpty } from 'utils/misc';
import { docClient } from 'utils/ddb';

const COURSES_TABLE = process.env.COURSES_TABLE!;
console.assert(!!COURSES_TABLE, 'COURSES_TABLE is not defined in environment');

// * resolvers

const getCourseById = async (args: QueryGetCourseByIdArgs) => {
  const params: GetCommandInput = {
    TableName: process.env.COURSES_TABLE,
    Key: { id: args.id }
  };

  try {
    const { Item } = await docClient.send(new GetCommand(params));
    return Item;
  } catch (err) {
    console.error(err);
    return;
  }
};

const getCourses = async (args: QueryGetCoursesArgs) => {
  const params: BatchGetCommandInput = {
    RequestItems: {
      [COURSES_TABLE]: {
        Keys: args.ids.map(id => ({ id }))
      }
    }
  };

  try {
    const { Responses } = await docClient.send(new BatchGetCommand(params));
    return Responses ? Object.values(Responses!).flat() : [];
  } catch (err) {
    console.error(err);
    return;
  }
}

const listCourses = async (args: QueryListCoursesArgs) => {
  let values: ScanCommandInput['ExpressionAttributeValues'] = {};
  let names: ScanCommandInput['ExpressionAttributeNames'] = {};
  let filter: string[] | string | undefined = [];

  if (args.filter) {
    if (args.filter.departmentId) {
      values[':departmentId'] = args.filter.departmentId;
      filter.push('departmentId = :departmentId');
    }
    if (args.filter.number) {
      values[':number'] = args.filter.number;
      // 'number' is a reserved keyword, this maps it to '#number' which is safe
      names['#number'] = 'number';
      filter.push('number = :number');
    }
    if (args.filter.subnumber) {
      values[':subnumber'] = args.filter.subnumber;
      filter.push('subnumber = :subnumber');
    }
    if (args.filter.name) {
      values[':name'] = args.filter.name;
      filter.push('name contains :name');
    }
  }

  // format filter arg
  filter = filter.join(' and ');

  // empty parameters are not accepted
  if (isEmpty(values)) values = undefined;
  if (isEmpty(names)) names = undefined;
  if (filter.length === 0) filter = undefined;

  const params: ScanCommandInput = {
    TableName: COURSES_TABLE,
    ExpressionAttributeValues: values,
    ExpressionAttributeNames: names,
    FilterExpression: filter
  };

  try {
    const { Items } = await docClient.send(new ScanCommand(params));
    return Items || [];
  } catch (err) {
    console.error(err);
    return;
  }
}

const addCourse = async (args: MutationAddCourseArgs) => {
  const params: PutCommandInput = {
    TableName: COURSES_TABLE,
    Item: {
      ...args.input,
      id: uuidv4()
    }
  };

  try {
    await docClient.send(new PutCommand(params));
    return params.Item!.id;
  } catch (err) {
    console.error(err);
    return;
  }
}

// * handler

export const handler = async (event:
  | AppSyncEvent<'getCourseById', QueryGetCourseByIdArgs>
  | AppSyncEvent<'getCourses', QueryGetCoursesArgs>
  | AppSyncEvent<'listCourses', QueryListCoursesArgs>
  | AppSyncEvent<'addCourse', MutationAddCourseArgs>
) => {
  switch(event.info.fieldName) {
    case 'getCourseById':
      return await getCourseById(event.arguments as QueryGetCourseByIdArgs);
    case 'getCourses':
      return await getCourses(event.arguments as QueryGetCoursesArgs);
    case 'listCourses':
      return await listCourses(event.arguments as QueryListCoursesArgs);
    case 'addCourse':
      return await addCourse(event.arguments as MutationAddCourseArgs);
    default:
      return null;
  };
};
