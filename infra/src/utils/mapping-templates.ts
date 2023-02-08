import { MappingTemplate } from "@aws-cdk/aws-appsync-alpha";

export const errorMappingTemplate = MappingTemplate.fromString(`
#if(!$util.isNull($ctx.result.error))
  $util.error($ctx.result.error.message, $ctx.result.error.type)
#else
  $util.toJson($ctx.result)
#end
`);
