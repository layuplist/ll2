import styles from "./Fallback.module.scss";

const Fallback = () => {
  return (
    <div className={styles.fallbackContainer}>
      <div className={styles.fallbackContentContainer}>
        <h1>404</h1>
        <h2>Page not found</h2>
        <p>
          We couldn&apos;t find this page on our servers. If you believe this
          page should exist, let us know at{" "}
          <a href="mailto:support@layuplist.com">support@layuplist.com</a>.
        </p>
      </div>
    </div>
  );
};

export default Fallback;
