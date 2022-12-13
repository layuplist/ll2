import { FormEventHandler, useState } from "react";
import { useRouter } from "next/router";

import styles from "./Header.module.scss";

const Header = () => {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    console.log("query", query);
    router.push(`/search?q=${query}`);
  };

  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerFlexContainer}>
        <img
          className={styles.headerLogo}
          alt="Layup List logo"
          src="/logo.svg"
        />
        <a className={styles.headerLink} href="/best">
          Best Classes
        </a>
        <a className={styles.headerLink} href="/layups">
          Layups
        </a>
        <a className={styles.headerLink} href="/departments">
          Departments
        </a>
      </div>

      <div className={styles.headerFlexContainer}>
        <form onSubmit={handleSubmit} className={styles.headerInput}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search LL2 here"
          />
          <button type="submit">search</button>
        </form>
        <img
          className={styles.headerProfile}
          src="/profile.svg"
          alt="profile icon"
        />
      </div>
    </header>
  );
};

export default Header;
