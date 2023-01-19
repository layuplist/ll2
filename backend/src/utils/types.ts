export type AppSyncEvent<TFieldName, TArgs> = {
  info: {
    fieldName: TFieldName
  },
  arguments: TArgs
};
