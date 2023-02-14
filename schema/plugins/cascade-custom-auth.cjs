/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const { getCachedDocumentNodeFromSchema } = require('@graphql-codegen/plugin-helpers');
const { visit, buildASTSchema } = require('graphql');
const { printSchemaWithDirectives } = require('@graphql-tools/utils');

module.exports = {
  plugin(schema) {
    const astNode = getCachedDocumentNodeFromSchema(schema);

    const backpointers = {};
    const visitor = (node) => {
      const { name, kind, fields, directives } = node;
      const authDirective = directives.find(d => d?.name.value === 'auth');

      // if object type def, loop through children, cascade auth
      if (kind === 'ObjectTypeDefinition') {
        fields.forEach(field => {
          const fieldName = field?.name.value;

          backpointers[fieldName] = {
            parent: name.value,
            authDirective: authDirective || backpointers[name]?.authDirective
          };
        });
      }

      if (!authDirective && backpointers[name.value]?.authDirective) {
        return {
          ...node,
          directives: [
            ...directives,
            backpointers[name.value]?.authDirective
          ]
        };
      }
    };
    const result = visit(astNode, {
      FieldDefinition: visitor,
      ObjectTypeDefinition: visitor
    });

    return printSchemaWithDirectives(buildASTSchema(result));
  }
};
