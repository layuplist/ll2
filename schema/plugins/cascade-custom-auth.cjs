/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const { printSchemaWithDirectives, mapSchema, getDirective, MapperKind, makeDirectiveNode } = require('@graphql-tools/utils');

module.exports = {
  plugin(schema) {
    const backpointers = {};
    const cascadeAuthVisitor = (nodeConfig, fieldName, typeName) => {
      const kind = nodeConfig.astNode.kind;
      const name = kind === 'FieldDefinition'
        ? `${typeName}.${fieldName}`
        : nodeConfig.astNode.name.value;
      const authDirective = getDirective(schema, nodeConfig, 'auth')?.[0];
      const parentAuthDirective = backpointers[name]?.authDirective;

      if (kind === 'ObjectTypeDefinition') {
        Object.keys(nodeConfig.getFields()).forEach(fieldName => {
          backpointers[`${name}.${fieldName}`] = {
            parent: name,
            authDirective: authDirective || parentAuthDirective
          };
        });
      }

      if (!authDirective && parentAuthDirective) {
        nodeConfig.astNode.directives.push(makeDirectiveNode('auth', parentAuthDirective));
      } else {
        nodeConfig.astNode.directives = [
          ...nodeConfig.astNode.directives.filter(d => d.name.value !== 'auth'),
          makeDirectiveNode('auth', { ...parentAuthDirective, ...authDirective })
        ];
      }

      return nodeConfig;
    };
    const schemaWithCascadedAuth = mapSchema(schema, {
      [MapperKind.OBJECT_TYPE](objectTypeConfig) {
        return cascadeAuthVisitor(objectTypeConfig);
      },
      [MapperKind.OBJECT_FIELD](objectFieldConfig, fieldName, typeName) {
        return cascadeAuthVisitor(objectFieldConfig, fieldName, typeName);
      }
    });

    const appsyncAuthTranslationVisitor = (nodeConfig) => {
      const authDirective = getDirective(schemaWithCascadedAuth, nodeConfig, 'auth')?.[0];
      if (authDirective) {
        const { cognito_groups, allow_api_key, allow_iam } = authDirective;

        const appsyncDirectives = [];
        if (cognito_groups) appsyncDirectives.push(
          makeDirectiveNode('aws_cognito_user_pools', { cognito_groups })
        );
        if (allow_api_key) appsyncDirectives.push(
          makeDirectiveNode('aws_api_key')
        );
        if (allow_iam) appsyncDirectives.push(
          makeDirectiveNode('aws_iam')
        );

        nodeConfig.astNode.directives = [
          ...nodeConfig.astNode.directives.filter(d => d.name.value !== 'auth'),
          ...appsyncDirectives
        ];
      }

      return nodeConfig;
    }
    const appsyncSchema = mapSchema(schemaWithCascadedAuth, {
      [MapperKind.OBJECT_TYPE](objectTypeConfig) {
        return appsyncAuthTranslationVisitor(objectTypeConfig);
      },
      [MapperKind.OBJECT_FIELD](objectFieldConfig) {
        return appsyncAuthTranslationVisitor(objectFieldConfig);
      }
    });

    return printSchemaWithDirectives(appsyncSchema);
  }
};
