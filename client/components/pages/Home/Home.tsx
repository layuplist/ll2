import { useRouter } from "next/router";
import { FormEventHandler, useState } from "react";
import Button from "../../Button/Button";
import Input from "../../Input/Input";
import styles from "./Home.module.scss";

export interface HomeProps {
  reviewCount: number;
}

const Home = ({ reviewCount }: HomeProps) => {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    router.push(`/search?q=${query}`);
  };

  return (
    <div className={styles.homeContainer}>
      <div className={styles.homeFeatureLayout}>
        <img src="/logo.svg" alt="layup list logo" />
        <h1>Layup List</h1>
        <h2>Dartmouth Course Reviews, Rankings, and Recommendations</h2>
        <p className={styles.reviewCount}>
          {reviewCount ?? "Many"} reviews and counting
        </p>
      </div>

      <Input
        className={styles.homeSearchForm}
        handleSubmit={handleSubmit}
        query={query}
        setQuery={setQuery}
      />

      <div className={styles.homeAnchorLinksContainer}>
        <p className={styles.homeAnchorLinkContainer}>
          <a className={styles.homeAnchorLink} href="/best">
            See Best Classes
          </a>
        </p>

        <p className={styles.homeAnchorLinkContainer}>
          <a className={styles.homeAnchorLink} href="/layups">
            See Layups
          </a>
        </p>

        <p className={styles.homeAnchorLinkContainer}>
          <a className={styles.homeAnchorLink} href="/departments">
            See Departments
          </a>
        </p>
      </div>

      <p className={styles.contributeAnchorContainer}>
        Know how to code?{" "}
        <a
          className={styles.contributeAnchor}
          href="https://github.com/layuplist/layup-list"
        >
          Try contributing to Layup List!
        </a>{" "}
      </p>
    </div>
  );
};

export default Home;
