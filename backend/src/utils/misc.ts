import type { AddCourseInput, AddOfferingInput, AddReviewInput } from "@layuplist/schema";

export const isEmpty = (obj: Record<string, unknown>) => Object.keys(obj).length === 0;

export const generateCourseId = (course: AddCourseInput): string =>
  `${course.department}-${course.number}`;

export const generateOfferingId = (offering: AddOfferingInput) =>
  `${offering.department}-${offering.number}-${offering.term}-${offering.section}`;

export const generateReviewId = (review: AddReviewInput): string =>
  `${review.department}-${review.number}-${review.term}-${review.section}-${review.userEmail}`;
