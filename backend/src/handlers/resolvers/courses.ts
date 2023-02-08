import type {
  Course,
  MutationAddCourseArgs,
  MutationDeleteCourseArgs,
  MutationResponse,
  MutationResponseWithId,
  MutationUpdateCourseArgs,
  QueryGetCourseArgs,
  QueryGetCoursesArgs,
  QueryListCoursesArgs
} from '@layuplist/schema';

import type { AppSyncEvent } from 'utils/types';
import { addItem, deleteItem, getItem, getItems, listItems, updateItem } from 'utils/dao';
import { generateCourseId } from 'utils/misc';
import { errorMiddleware } from 'utils/errors';
import middy from '@middy/core';

const COURSES_TABLE = process.env.COURSES_TABLE!;
console.assert(!!COURSES_TABLE, 'COURSES_TABLE is not defined in environment');

// * resolvers

export const getCourse = async (args: QueryGetCourseArgs): Promise<Course> => {
  return await getItem(COURSES_TABLE, { id: args.id }) as Course;
};

export const getCourses = async (args: QueryGetCoursesArgs): Promise<Course[]> => {
  return (await getItems(COURSES_TABLE, args.ids.map(id => ({ id }))) ?? []) as Course[];
};

export const listCourses = async (args: QueryListCoursesArgs): Promise<Course[]> => {
  const { term, ...filter } = args.filter || {};
  return await listItems(
    COURSES_TABLE,
    term ? { ...filter, terms: term } : filter,
    // if filtering on term, use CONTAINS comparator
    key => key === 'terms' ? 'CONTAINS' : '='
  ) as Course[];
};

export const addCourse = async (args: MutationAddCourseArgs): Promise<MutationResponseWithId> => {
  const id = generateCourseId(args.course);

  await addItem(
    COURSES_TABLE,
    // appsync does not respect gql schema defaults, set manually
    {
      qualityScore: 0,
      layupScore: 0,
      terms: [],
      ...args.course,
      id
    },
  );
  return { id, success: true };
};

export const updateCourse = async (args: MutationUpdateCourseArgs): Promise<MutationResponse> => {
  await updateItem(
    COURSES_TABLE,
    { id: args.id },
    {
      ...args.course,
      // convert xlist to json for update expression
      xlist: args.course.xlist ? JSON.stringify(args.course.xlist) : null
    }
  );
  return { success: true };
};

export const deleteCourse = async (args: MutationDeleteCourseArgs): Promise<MutationResponse> => {
  await deleteItem(COURSES_TABLE, { id: args.id });
  return { success: true };
};

// * handler

const handler = async (event:
  | AppSyncEvent<'Query', 'getCourse', QueryGetCourseArgs>
  | AppSyncEvent<'Query', 'getCourses', QueryGetCoursesArgs>
  | AppSyncEvent<'Query', 'listCourses', QueryListCoursesArgs>
  | AppSyncEvent<'Mutation', 'addCourse', MutationAddCourseArgs>
  | AppSyncEvent<'Mutation', 'updateCourse', MutationUpdateCourseArgs>
  | AppSyncEvent<'Mutation', 'deleteCourse', MutationDeleteCourseArgs>
  | AppSyncEvent<'Offering', 'course', never, Course>
) => {
  console.debug('courses.handler received event:\n', event);

  switch (`${event.info.parentTypeName}.${event.info.fieldName}`) {
    case 'Query.getCourse':
      return await getCourse(event.arguments as QueryGetCourseArgs);
    case 'Query.getCourses':
      return await getCourses(event.arguments as QueryGetCoursesArgs);
    case 'Query.listCourses':
      return await listCourses(event.arguments as QueryListCoursesArgs);
    case 'Mutation.addCourse':
      return await addCourse(event.arguments as MutationAddCourseArgs);
    case 'Mutation.updateCourse':
      return await updateCourse(event.arguments as MutationUpdateCourseArgs);
    case 'Mutation.deleteCourse':
      return await deleteCourse(event.arguments as MutationDeleteCourseArgs);
    case 'Offering.course':
      return await getCourse({ id: generateCourseId(event.source) });
    default:
      return null;
  }
};

export default middy(handler)
  .use(errorMiddleware());
