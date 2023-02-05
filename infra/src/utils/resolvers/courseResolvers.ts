import type { LambdaDataSource } from '@aws-cdk/aws-appsync-alpha';
import { errorMappingTemplate } from '../mappingTemplates';

export default (coursesDataSource: LambdaDataSource) => {
  // * queries

  coursesDataSource.createResolver('query-getcourse-resolver', {
    typeName: 'Query',
    fieldName: 'getCourse',
    responseMappingTemplate: errorMappingTemplate
  });
  coursesDataSource.createResolver('query-getcourses-resolver', {
    typeName: 'Query',
    fieldName: 'getCourses',
    responseMappingTemplate: errorMappingTemplate
  });
  coursesDataSource.createResolver('query-listcourses-resolver', {
    typeName: 'Query',
    fieldName: 'listCourses',
    responseMappingTemplate: errorMappingTemplate
  });

  // * mutations

  coursesDataSource.createResolver('mutation-addcourse-resolver', {
    typeName: 'Mutation',
    fieldName: 'addCourse',
    responseMappingTemplate: errorMappingTemplate
  });
  coursesDataSource.createResolver('mutation-updatecourse-resolver', {
    typeName: 'Mutation',
    fieldName: 'updateCourse',
    responseMappingTemplate: errorMappingTemplate
  });
  coursesDataSource.createResolver('mutation-deletecourse-resolver', {
    typeName: 'Mutation',
    fieldName: 'deleteCourse',
    responseMappingTemplate: errorMappingTemplate
  });
};
