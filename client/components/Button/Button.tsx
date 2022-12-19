import { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.scss";

export interface ButtonProps {
  children: ReactNode;
  type: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  onClick: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
}

const Button = ({ children, type, onClick }: ButtonProps) => {
  return (
    <button className={styles.buttonContainer} onClick={onClick} type={type}>
      {children}
    </button>
  );
};

export default Button;
