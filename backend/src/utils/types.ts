export type AppSyncEvent<TFieldName, TArgs> = {
  info: {
    fieldName: TFieldName
  },
  arguments: TArgs
};

export type KeyOf<TRecord> = keyof TRecord;
export type ValueOf<TRecord> = TRecord[keyof TRecord];

export type AppSyncResponse<TResponse> = TResponse & {
  error: {
    type: string,
    message: string
  };
};
