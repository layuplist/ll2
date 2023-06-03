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

export enum Source {
  TIMETABLE = 'timetable',
  ORC = 'orc'
}

export type Version = {
  hash: string,
  timestamp: string,
  changed?: string
}
export type Versions = {
  archive: {
    timetable: Version[],
    orc: Version[]
  },
  current: {
    timetable: Version,
    orc: Version
  }
}

export type TimetableOffering = {
  building?: string,
  creditOptions?: string,
  crn?: string,
  description?: string,
  distribs?: string,
  enrollment?: string,
  fys?: string,
  instructor?: string,
  languageRequirement?: string,
  learningObjective?: string,
  limit?: string,
  number?: number,
  period?: string,
  periodCode?: string,
  room?: string,
  section?: string,
  status?: string,
  subject?: string,
  term?: string,
  text?: string,
  title?: string,
  wc?: string,
  xlist?: string
};

export type ORCCourse = {
  description?: string,
  distribs?: string,
  instructor?: string,
  number?: number,
  offered?: string,
  subject?: string,
  title?: string,
  xlist?: string
};
