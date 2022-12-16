export type Maybe<T> = T | undefined;
export type InputMaybe<T> = T | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  AWSDate: any;
}

export interface Comment extends Identifiable {
  __typename?: 'Comment';
  id: Scalars['ID'];
  offeringId: Scalars['ID'];
  text: Scalars['String'];
}

export interface Course extends Identifiable {
  __typename?: 'Course';
  departmentIds: Array<Maybe<Scalars['ID']>>;
  description: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
  number: Scalars['Int'];
  offerings?: Maybe<Array<Maybe<Offering>>>;
  subnumber: Scalars['Int'];
  xlist?: Maybe<CourseGroup>;
}

export interface CourseGroup {
  __typename?: 'CourseGroup';
  courseIds: Array<Maybe<Scalars['ID']>>;
}

export interface Department extends Identifiable {
  __typename?: 'Department';
  code: Scalars['String'];
  courseIds: Array<Scalars['ID']>;
  id: Scalars['ID'];
  name: Scalars['String'];
  offeringIds: Array<Scalars['ID']>;
}

export interface Identifiable {
  id: Scalars['ID'];
}

export interface Mutation {
  __typename?: 'Mutation';
  _?: Maybe<Scalars['Boolean']>;
}

export interface Offering extends Identifiable {
  __typename?: 'Offering';
  courseId: Scalars['ID'];
  id: Scalars['ID'];
  professorId: Scalars['ID'];
  termId: Scalars['ID'];
  timeslot: Scalars['String'];
}

export interface Professor extends Identifiable {
  __typename?: 'Professor';
  departmentIds: Array<Scalars['ID']>;
  id: Scalars['ID'];
  name: Scalars['String'];
  offeringIds: Array<Scalars['ID']>;
}

export interface Query {
  __typename?: 'Query';
  _?: Maybe<Scalars['Boolean']>;
}

export interface Term extends Identifiable {
  __typename?: 'Term';
  code: Scalars['String'];
  end: Scalars['AWSDate'];
  id: Scalars['ID'];
  start: Scalars['AWSDate'];
}

export interface User extends Identifiable {
  __typename?: 'User';
  comments?: Maybe<Array<Maybe<Comment>>>;
  id: Scalars['ID'];
}

export const typeDefs = `
schema {
  query: Query
  mutation: Mutation
}

scalar AWSDate

type Comment implements Identifiable {
  id: ID!
  offeringId: ID!
  text: String!
}

type Course implements Identifiable {
  departmentIds: [ID]!
  description: String!
  id: ID!
  name: String!
  number: Int!
  offerings: [Offering]
  subnumber: Int!
  xlist: CourseGroup
}

type CourseGroup {
  courseIds: [ID]!
}

type Department implements Identifiable {
  code: String!
  courseIds: [ID!]!
  id: ID!
  name: String!
  offeringIds: [ID!]!
}

interface Identifiable {
  id: ID!
}

type Mutation {
  _: Boolean
}

type Offering implements Identifiable {
  courseId: ID!
  id: ID!
  professorId: ID!
  termId: ID!
  timeslot: String!
}

type Professor implements Identifiable {
  departmentIds: [ID!]!
  id: ID!
  name: String!
  offeringIds: [ID!]!
}

type Query {
  _: Boolean
}

type Term implements Identifiable {
  code: String!
  end: AWSDate!
  id: ID!
  start: AWSDate!
}

type User implements Identifiable {
  comments: [Comment]
  id: ID!
}
`;