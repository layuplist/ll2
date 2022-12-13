import { FormEvent } from "react";
import styles from "./Input.module.scss";

export interface InputProps {
  handleSubmit: (e: FormEvent) => void;
  query: string;
  setQuery: (q: string) => void;
}

const Input = ({ handleSubmit, query, setQuery }: InputProps) => {
  return (
    <form onSubmit={handleSubmit} className={styles.inputContainer}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search LL2 here"
      />
      <button type="submit">search</button>
    </form>
  );
};

export default Input;
