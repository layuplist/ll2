export const isEmpty = (obj: Object) => Object.keys(obj).length === 0;

export const generateDdbEqualsParams = (args: Record<string, any>) => {
  let values: Record<string, NonNullable<any>> = {};
  let names: Record<string, NonNullable<any>> = {};
  const expression: string[] = [];

  Object.entries(args).forEach(([key, value]) => {
    if (value == null) return;

    // set value
    values[`:${key}`] = value;

    // avoid reserved keywords
    names[`#${key}`] = key;

    // add to expression
    expression.push(`#${key} = :${key}`)
  });

  return {
    values: isEmpty(values) ? undefined : values,
    names: isEmpty(names) ? undefined : names,
    expression: expression.length > 0 ? expression : undefined
  };
};
