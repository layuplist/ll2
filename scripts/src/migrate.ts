/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
// import csv from 'csv-parser';
// import fs from 'fs';

const csv = require('csv-parser');
const fs = require('fs');
const fetch = require('cross-fetch');
const { ApolloClient, ApolloLink, HttpLink, InMemoryCache, concat, gql } = require('@apollo/client');
require('dotenv').config();

const ADD_COURSE = gql`
  mutation AddCourse($course: AddCourseInput!) {
    addCourse(course: $course) {
      id
      success
    }
  }
`;

const client = new ApolloClient({
  link: concat(
    new ApolloLink((operation: any, forward: any) => {
      operation.setContext(({ headers = {} }) => ({
        headers: {
          ...headers,
          'x-api-key': process.env.GQL_KEY
        }
      }));
      return forward(operation);
    }),
    new HttpLink({ uri: process.env.GQL_URL, fetch }),
  ),
  cache: new InMemoryCache()
});

console.log(process.env.GQL_URL, process.env.GQL_KEY);

(async () => {
  const courses: any[] = []
  await new Promise((resolve) => {
    fs.createReadStream('data/web_course.csv')
      .pipe(csv())
      .on('data', (course: any) => courses.push(course))
      .on('end', () => { console.log(`Parsed ${courses.length} courses.`); resolve(null); });
  });

  await Promise.all(courses.slice(0, 1).map(async course => {
    try {
      console.log(await client.mutate({
        mutation: ADD_COURSE,
        variables: { course }
      }));
    } catch (err: any) {
      console.error('failed to add course', err);
    }
  }));
})();
