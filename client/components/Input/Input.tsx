import { FormEventHandler } from "react";
import Button from "../Button/Button";
import styles from "./Input.module.scss";

export interface InputProps {
  handleSubmit: FormEventHandler;
  query: string;
  setQuery: (q: string) => void;
  className?: string;
}

const Input = ({
  handleSubmit,
  query,
  setQuery,
  className = "",
}: InputProps) => {
  return (
    <form
      onSubmit={handleSubmit}
      className={`${styles.inputContainer} ${className}`}
    >
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search LL2 here"
      />
      <Button onClick={() => null} type="submit">
        search
      </Button>
    </form>
  );
};

export default Input;
