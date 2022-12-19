import Home, { HomeProps } from "../components/pages/Home/Home";
import { GetStaticProps } from "next";

export const REGENERATION_HOURS = 24;

export const getStaticProps: GetStaticProps<HomeProps> = () => {
  // TODO fetch data from AWS here
  const currentReviewCount: number = 69;

  return {
    props: { reviewCount: currentReviewCount },
    revalidate: REGENERATION_HOURS * 60 * 60, // seconds
  };
};

export default Home;
