import Departments, {
  DepartmentsProps,
} from "../components/pages/Departments/Departments";
import { GetStaticProps } from "next";

export const REGENERATION_HOURS = 24;

export const getStaticProps: GetStaticProps<DepartmentsProps> = () => {
  // TODO fetch data from AWS here

  return {
    props: {
      departments: [
        {
          code: "AAAS",
          name: "African and African American Studies",
          numCourses: 163,
        },
        {
          code: "AMEL",
          name: "Asian and Middle Eastern Languages and Literatures",
          numCourses: 7,
        },
      ],
    },
    revalidate: REGENERATION_HOURS * 60 * 60, // seconds
  };
};

export default Departments;
