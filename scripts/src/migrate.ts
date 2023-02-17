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

const ADD_OFFERING = gql`
  mutation AddOffering($offering: AddOfferingInput!) {
    addOffering(offering: $offering) {
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

const uploadCourses = async (courses: any[]) => {
  return Promise.all(courses.map(async row => {
    const course = {
      department: row.department,
      number: parseFloat(`${row.number}.${row.subnumber}`),
      url: row.url,
      qualityScore: row.quality_score,
      layupScore: row.difficulty_score
    }

    try {
      const res = await client.mutate({
        mutation: ADD_COURSE,
        variables: { course }
      });
      const { success, id } = res.data.addCourse;
      if (success) console.log(`Course ${id} added successfully.`);
      else console.error(res);
    } catch (err: any) {
      console.error('failed to add course\n', err);
    }
  }));
};

const uploadOfferings = async (courses: any[], offerings: any[]) => {
  await Promise.all(offerings.map(async row => {
    const course = courses.find(c => c.id === row.id);
    if (!course) return;
    const [, year, season] = row.term.match(/([0-9]+)([W,S,X,F])/);
    const term = parseInt(`20${year}${season === 'W' ? '01' : season === 'S' ? '03' : season === 'X' ? '06' : '09'}`)
    const offering = {
      crn: row.course_registration_number,
      department: course.department,
      number: parseFloat(`${course.number}.${course.subnumber}`),
      term: term,
      section: row.section,
      professorId: '',
      timeslot: row.period,
      title: course.title,
      description: course.description
    };

    try {
      const res = await client.mutate({
        mutation: ADD_OFFERING,
        variables: { offering }
      });
      const { success, id } = res.data.addOffering;
      if (success) console.log(`Offering ${id} added successfully.`);
      else console.error(res);
    } catch (err: any) {
      console.error('failed to add offering\n', err);
    }
  }));
}

(async () => {
  const courses: any[] = []
  await new Promise((resolve) => {
    fs.createReadStream('data/web_course.csv')
      .pipe(csv())
      .on('data', (course: any) => courses.push(course))
      .on('end', () => { console.log(`Parsed ${courses.length} courses.`); resolve(null); });
  });

  const offerings: any[] = [];
  await new Promise((resolve) => {
    fs.createReadStream('data/web_courseoffering.csv')
      .pipe(csv())
      .on('data', (offering: any) => offerings.push(offering))
      .on('end', () => { console.log(`Parsed ${offerings.length} offerings.`); resolve(null) });
  });

  // await uploadCourses(courses.slice(0, 1));
  // for (let i = 2650; i < offerings.length; i += 10) {
  //   await uploadOfferings(courses, offerings.slice(i, i + 10));
  //   await new Promise((resolve) => setTimeout(resolve, 10));
  // }
})();
