export type AppSyncEvent<TParentTypeName, TFieldName, TArgs, TSource=never> = {
  info: {
    parentTypeName: TParentTypeName,
    fieldName: TFieldName
  },
  arguments: TArgs
  source: TSource
};

export type KeyOf<TRecord> = keyof TRecord;
export type ValueOf<TRecord> = TRecord[keyof TRecord];

export type AppSyncResponse<TResult> = TResult & {
  error: {
    type: string,
    message: string
  };
};

export type FieldResolverHandler<TArgs, TResult> =
  (args: TArgs) => Promise<TResult>;
