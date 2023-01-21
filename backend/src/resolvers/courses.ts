import {
  BatchGetCommand,
  BatchGetCommandInput,
  GetCommand,
  GetCommandInput,
  ScanCommand,
  ScanCommandInput,
  PutCommandInput,
  PutCommand,
  UpdateCommandInput,
  UpdateCommand,
  DeleteCommandInput,
  DeleteCommand
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

import type {
  MutationAddCourseArgs,
  MutationDeleteCourseArgs,
  MutationUpdateCourseArgs,
  QueryGetCourseByIdArgs,
  QueryGetCoursesArgs,
  QueryListCoursesArgs
} from '@layuplist/schema';

import type { AppSyncEvent } from 'utils/types';
import { generateDdbEqualsParams } from 'utils/misc';
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
    console.trace(err);
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
    console.trace(err);
    return;
  }
}

const listCourses = async (args: QueryListCoursesArgs) => {
  let params: ScanCommandInput = {
    TableName: COURSES_TABLE
  };

  if (args.filter) {
    const { values, names, expression } = generateDdbEqualsParams(args.filter!);
    params = {
      ...params,
      ExpressionAttributeValues: values,
      ExpressionAttributeNames: names,
      FilterExpression: expression?.join(' and ')
    };
  }

  try {
    const { Items } = await docClient.send(new ScanCommand(params));
    return Items || [];
  } catch (err) {
    console.trace(err);
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
    console.trace(err);
    return;
  }
}

const updateCourse = async (args: MutationUpdateCourseArgs) => {
  const { values, names, expression } = generateDdbEqualsParams(args.input);

  if (!expression) {
    console.info('updateCourse called with no updates');
    return;
  }

  let params: UpdateCommandInput = {
    TableName: COURSES_TABLE,
    ExpressionAttributeValues: values,
    ExpressionAttributeNames: names,
    UpdateExpression: `set ${expression.join(', ')}`,
    Key: {
      id: args.id
    }
  };

  try {
    await docClient.send(new UpdateCommand(params));
    return args.id;
  } catch (err) {
    console.trace(err);
    return;
  }
};

const deleteCourse = async (args: MutationDeleteCourseArgs) => {
  const params: DeleteCommandInput = {
    TableName: COURSES_TABLE,
    Key: {
      id: args.id
    }
  };

  try {
    await docClient.send(new DeleteCommand(params));
    return args.id;
  } catch (err) {
    console.trace(err);
    return;
  }
};

// * handler

export const handler = async (event:
  | AppSyncEvent<'getCourseById', QueryGetCourseByIdArgs>
  | AppSyncEvent<'getCourses', QueryGetCoursesArgs>
  | AppSyncEvent<'listCourses', QueryListCoursesArgs>
  | AppSyncEvent<'addCourse', MutationAddCourseArgs>
  | AppSyncEvent<'updateCourse', MutationUpdateCourseArgs>
  | AppSyncEvent<'deleteCourse', MutationDeleteCourseArgs>
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
    case 'updateCourse':
      return await updateCourse(event.arguments as MutationUpdateCourseArgs);
    case 'deleteCourse':
      return await deleteCourse(event.arguments as MutationDeleteCourseArgs);
    default:
      return null;
  };
};
