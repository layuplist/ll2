import Search, { SearchProps } from "../components/pages/Search/Search";
import { GetStaticProps } from "next";

export const REGENERATION_HOURS = 24;

// ! This will need to pregenerate all pages

export const getStaticProps: GetStaticProps<SearchProps> = () => {
  // TODO fetch data from AWS here

  return {
    props: {
      results: [
        {
          id: "5481621",
          name: "AAAS007.01: Postcolonial Dialogues",
          offeredNextTerm: false,
          distributives: ["INT", "LIT", "CI"],
          numReviews: 0,
          qualityScore: -2,
          layupScore: 0,
        },
        {
          id: "844651",
          name: "AAAS007.02: Women & Gender in Caribbean",
          offeredNextTerm: true,
          distributives: ["INT", "SOC", "W"],
          numReviews: 0,
          qualityScore: 0,
          layupScore: 0,
        },
        {
          id: "6544812",
          name: "AAAS007.05: Imagining Freedom",
          offeredNextTerm: false,
          distributives: ["SOC", "CI"],
          numReviews: 0,
          qualityScore: 1,
          layupScore: 1,
        },
      ],
      nextTermCode: "23W",
    },
    revalidate: REGENERATION_HOURS * 60 * 60, // seconds
  };
};

export default Search;
