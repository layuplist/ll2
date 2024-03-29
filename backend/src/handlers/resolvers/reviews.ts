import middy from '@middy/core';

import type {
  MutationAddReviewArgs,
  MutationDeleteReviewArgs,
  MutationResponse,
  MutationResponseWithId,
  MutationUpdateReviewArgs,
  QueryGetReviewArgs,
  QueryGetReviewsArgs,
  QueryListReviewsArgs,
  Review
} from '@layuplist/schema';

import type { AppSyncEvent, FieldResolverHandler } from 'utils/types';
import { addItem, deleteItem, getItem, getItems, listItems, updateItem } from 'utils/dao';
import { generateReviewId } from 'utils/misc';
import { errorMiddleware } from 'utils/errors';

const REVIEWS_TABLE = process.env.REVIEWS_TABLE!;
console.assert(!!REVIEWS_TABLE, 'REVIEWS_TABLE is not defined in environment');

// * resolvers

export const getReview: FieldResolverHandler<QueryGetReviewArgs, Review | null> = async (args) => {
  return await getItem(REVIEWS_TABLE, { id: args.id }) as Review;
};

export const getReviews: FieldResolverHandler<QueryGetReviewsArgs, Review[]> = async (args) => {
  return await getItems(REVIEWS_TABLE, args.ids.map(id => ({ id }))) as Review[];
};

export const listReviews: FieldResolverHandler<QueryListReviewsArgs, Review[]> = async (args) => {
  return (await listItems(REVIEWS_TABLE, args.filter ?? {}) ?? []) as Review[];
};

export const addReview: FieldResolverHandler<MutationAddReviewArgs, MutationResponseWithId> = async (args) => {
  const id = generateReviewId(args.review);
  // ! TODO - verify that args.review.userEmail matches signed in user

  await addItem(
    REVIEWS_TABLE,
    {
      ...args.review,
      id
    }
  );
  return { id, success: true };
};

export const updateReview: FieldResolverHandler<MutationUpdateReviewArgs, MutationResponse> = async (args) => {
  await updateItem(
    REVIEWS_TABLE,
    { id: args.id },
    args.review
  );

  return { success: true };
};

export const deleteReview: FieldResolverHandler<MutationDeleteReviewArgs, MutationResponse> = async (args) => {
  await deleteItem(REVIEWS_TABLE, { id: args.id });
  return { success: true };
};

// * handler

const handler = async (event:
  | AppSyncEvent<'Query', 'getReview', QueryGetReviewArgs>
  | AppSyncEvent<'Query', 'getReviews', QueryGetReviewsArgs>
  | AppSyncEvent<'Query', 'listReviews', QueryListReviewsArgs>
  | AppSyncEvent<'Mutation', 'addReview', MutationAddReviewArgs>
  | AppSyncEvent<'Mutation', 'updateReview', MutationUpdateReviewArgs>
  | AppSyncEvent<'Mutation', 'deleteReview', MutationDeleteReviewArgs>
) => {
  console.debug('reviews.handler received event:\n', event);

  switch (`${event.info.parentTypeName}.${event.info.fieldName}`) {
    case 'Query.getReview':
      return await getReview(event.arguments as QueryGetReviewArgs);
    case 'Query.getReviews':
      return await getReviews(event.arguments as QueryGetReviewsArgs);
    case 'Query.listReviews':
      return await listReviews(event.arguments as QueryListReviewsArgs);
    case 'Mutation.addReview':
      return await addReview(event.arguments as MutationAddReviewArgs);
    case 'Mutation.updateReview':
      return await updateReview(event.arguments as MutationUpdateReviewArgs);
    case 'Mutation.deleteReview':
      return await deleteReview(event.arguments as MutationDeleteReviewArgs);
    default:
      return null;
  }
};

export default middy(handler)
  .use(errorMiddleware());
