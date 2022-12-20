import { useRouter } from "next/router";
import styles from "./Search.module.scss";

export type DistributiveRequirement = string;

export interface Course {
  id: string;
  name: string;
  offeredNextTerm: boolean;
  distributives: DistributiveRequirement[];
  numReviews: number;
  qualityScore: number;
  layupScore: number;
}

export interface SearchProps {
  results: Course[];
  nextTermCode: string;
}

const Search = ({ results, nextTermCode }: SearchProps) => {
  const router = useRouter();

  return (
    <div className={styles.searchContainer}>
      <h1>Departments</h1>

      <table>
        <thead>
          <tr>
            <th style={{ width: "50%" }}>Course</th>
            <th style={{ width: "10%" }}>Offered {nextTermCode}?</th>
            <th style={{ width: "10%" }}>Distribs</th>
            <th style={{ width: "10%" }}>Reviews</th>
            <th style={{ width: "10%" }}>Quality</th>
            <th style={{ width: "10%" }}>Layup</th>
          </tr>
        </thead>

        <tbody>
          {results.map((result) => (
            <tr
              key={result.name}
              onClick={() => router.push(`/course/${result.id}`)}
            >
              <td>
                <a>{result.name}</a>
              </td>
              <td>{result.offeredNextTerm ? "Yes" : "No"}</td>
              <td>{result.distributives.join(", ")}</td>
              <td>{result.numReviews}</td>
              <td>{result.qualityScore}</td>
              <td>{result.layupScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Search;
