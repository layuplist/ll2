import middy from '@middy/core';

import type {
  Offering,
  MutationAddOfferingArgs,
  MutationDeleteOfferingArgs,
  MutationResponse,
  MutationResponseWithId,
  MutationUpdateOfferingArgs,
  QueryGetOfferingArgs,
  QueryGetOfferingsArgs,
  QueryListOfferingsArgs,
  CourseOfferingsArgs,
  Course
} from '@layuplist/schema';

import type { AppSyncEvent, FieldResolverHandler } from 'utils/types';
import { addItem, updateItem, deleteItem, getItem, getItems, listItems } from 'utils/dao';
import { generateCourseId, generateOfferingId } from 'utils/misc';
import { errorMiddleware, ItemNotFoundError } from 'utils/errors';
import { addCourse, getCourse, updateCourse } from 'handlers/resolvers/courses';

const OFFERINGS_TABLE = process.env.OFFERINGS_TABLE!;
console.assert(!!OFFERINGS_TABLE, 'OFFERINGS_TABLE is not defined in environment');

// * resolvers

export const getOffering: FieldResolverHandler<QueryGetOfferingArgs, Offering> = async (args) => {
  return await getItem(OFFERINGS_TABLE, { id: args.id }) as Offering;
};

export const getOfferings: FieldResolverHandler<QueryGetOfferingsArgs, Offering[]> = async (args) => {
  return (await getItems(OFFERINGS_TABLE, args.ids.map(id => ({ id }))) ?? []) as Offering[];
};

export const listOfferings: FieldResolverHandler<QueryListOfferingsArgs, Offering[]> = async (args) => {
  return await listItems(OFFERINGS_TABLE, args.filter ?? {}) as Offering[];
};

export const addOffering: FieldResolverHandler<MutationAddOfferingArgs, MutationResponseWithId> = async (args) => {
  const id = generateOfferingId(args.offering);

  // add offering
  await addItem(
    OFFERINGS_TABLE,
    {
      ...args.offering,
      id
    },
    args.overwrite
  );

  // update course terms
  const courseKey = {
    id: generateCourseId({
      department: args.offering.department,
      number: args.offering.number
    })
  };
  try {
    // if course exists and does not include new offering term, update
    const course = await getCourse(courseKey);
    if (!course.terms.includes(args.offering.term)) {
      await updateCourse({
        ...courseKey,
        course: {
          terms: [...course.terms, args.offering.term]
        }
      });
    }
  } catch (err) {
    // if course does not exist, add
    if (err instanceof ItemNotFoundError) {
      await addCourse({
        course: {
          department: args.offering.department,
          number: args.offering.number,
          terms: [args.offering.term]
        }
      });
    } else throw err;
  }

  return { id, success: true };
};

export const updateOffering: FieldResolverHandler<MutationUpdateOfferingArgs, MutationResponse> = async (args) => {
  // ! TODO - confirm professor exists

  await updateItem(
    OFFERINGS_TABLE,
    { id: args.id },
    args.offering
  );
  return { success: true };
};

export const deleteOffering: FieldResolverHandler<MutationDeleteOfferingArgs, MutationResponse> = async (args) => {
  await deleteItem(OFFERINGS_TABLE, { id: args.id });
  return { success: true };
};

// * handler

const handler = async (event:
  | AppSyncEvent<'Query', 'getOffering', QueryGetOfferingArgs>
  | AppSyncEvent<'Query', 'getOfferings', QueryGetOfferingsArgs>
  | AppSyncEvent<'Query', 'listOfferings', QueryListOfferingsArgs>
  | AppSyncEvent<'Mutation', 'addOffering', MutationAddOfferingArgs>
  | AppSyncEvent<'Mutation', 'updateOffering', MutationUpdateOfferingArgs>
  | AppSyncEvent<'Mutation', 'deleteOffering', MutationDeleteOfferingArgs>
  | AppSyncEvent<'Course', 'offerings', MutationDeleteOfferingArgs>
) => {
  console.debug('offerings.handler received event:\n', event);

  switch (`${event.info.parentTypeName}.${event.info.fieldName}`) {
    case 'Query.getOffering':
      return await getOffering(event.arguments as QueryGetOfferingArgs);
    case 'Query.getOfferings':
      return await getOfferings(event.arguments as QueryGetOfferingsArgs);
    case 'Query.listOfferings':
      return await listOfferings(event.arguments as QueryListOfferingsArgs);
    case 'Mutation.addOffering':
      return await addOffering(event.arguments as MutationAddOfferingArgs);
    case 'Mutation.updateOffering':
      return await updateOffering(event.arguments as MutationUpdateOfferingArgs);
    case 'Course.offerings':
      return await listOfferings({
        filter: {
          department: (event.source as Course).department,
          number: (event.source as Course).number,
          term: (event.arguments as CourseOfferingsArgs).term
        }
      })
    default:
      return null;
  }
};

export default middy(handler)
  .use(errorMiddleware());
