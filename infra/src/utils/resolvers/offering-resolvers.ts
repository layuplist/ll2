import type { LambdaDataSource } from '@aws-cdk/aws-appsync-alpha';

import { errorMappingTemplate } from '../mapping-templates';

export default (offeringsDataSource: LambdaDataSource) => {
  // * queries

  offeringsDataSource.createResolver('query-getOffering-resolver', {
    typeName: 'Query',
    fieldName: 'getOffering',
    responseMappingTemplate: errorMappingTemplate
  });
  offeringsDataSource.createResolver('query-getOfferings-resolver', {
    typeName: 'Query',
    fieldName: 'getOfferings',
    responseMappingTemplate: errorMappingTemplate
  });
  offeringsDataSource.createResolver('query-listOfferings-resolver', {
    typeName: 'Query',
    fieldName: 'listOfferings',
    responseMappingTemplate: errorMappingTemplate
  });

  // * mutations

  offeringsDataSource.createResolver('mutation-addOffering-resolver', {
    typeName: 'Mutation',
    fieldName: 'addOffering',
    responseMappingTemplate: errorMappingTemplate
  });
  offeringsDataSource.createResolver('mutation-updateOffering-resolver', {
    typeName: 'Mutation',
    fieldName: 'updateOffering',
    responseMappingTemplate: errorMappingTemplate
  });
  offeringsDataSource.createResolver('mutation-deleteOffering-resolver', {
    typeName: 'Mutation',
    fieldName: 'deleteOffering',
    responseMappingTemplate: errorMappingTemplate
  });
};
