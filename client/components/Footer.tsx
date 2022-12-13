import styles from "./Footer.module.scss";

const Footer = () => {
  return (
    <footer className={styles.footerContainer}>
      <p className={styles.supportLinkContainer}>
        <a className={styles.supportLink} href="mailto:support@layuplist.com">
          support@layuplist.com
        </a>
      </p>
    </footer>
  );
};

export default Footer;
