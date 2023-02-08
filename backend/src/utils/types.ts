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

export type AppSyncResponse<TResponse> = TResponse & {
  error: {
    type: string,
    message: string
  };
};
