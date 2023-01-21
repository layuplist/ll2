import type { LambdaDataSource } from '@aws-cdk/aws-appsync-alpha';

export default (coursesDataSource: LambdaDataSource) => {
  // * queries

  coursesDataSource.createResolver('query-getcourse-resolver', {
    typeName: 'Query',
    fieldName: 'getCourseById',
  });
  coursesDataSource.createResolver('query-getcourses-resolver', {
    typeName: 'Query',
    fieldName: 'getCourses'
  });
  coursesDataSource.createResolver('query-listcourses-resolver', {
    typeName: 'Query',
    fieldName: 'listCourses'
  });

  // * mutations

  coursesDataSource.createResolver('mutation-addcourse-resolver', {
    typeName: 'Mutation',
    fieldName: 'addCourse'
  });
  coursesDataSource.createResolver('mutation-updatecourse-resolver', {
    typeName: 'Mutation',
    fieldName: 'updateCourse'
  });
  coursesDataSource.createResolver('mutation-deletecourse-resolver', {
    typeName: 'Mutation',
    fieldName: 'deleteCourse'
  });
};
