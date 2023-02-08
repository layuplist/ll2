import type { LambdaDataSource } from '@aws-cdk/aws-appsync-alpha';

export default (reviewsDataSource: LambdaDataSource) => {
  // * queries

  reviewsDataSource.createResolver('query-getreview-resolver', {
    typeName: 'Query',
    fieldName: 'getReview',
  });
  reviewsDataSource.createResolver('query-getreviews-resolver', {
    typeName: 'Query',
    fieldName: 'getReviews'
  });
  reviewsDataSource.createResolver('query-listreviews-resolver', {
    typeName: 'Query',
    fieldName: 'listReviews'
  });

  // * mutations

  reviewsDataSource.createResolver('mutation-addreview-resolver', {
    typeName: 'Mutation',
    fieldName: 'addReview'
  });
  reviewsDataSource.createResolver('mutation-updatereview-resolver', {
    typeName: 'Mutation',
    fieldName: 'updateReview'
  });
  reviewsDataSource.createResolver('mutation-deletereview-resolver', {
    typeName: 'Mutation',
    fieldName: 'deleteReview'
  });
};
