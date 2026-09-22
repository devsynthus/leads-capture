"use client";

import type { InputHTMLAttributes } from "react";
import styles from "./Field.module.css";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
}

export function TextField({ id, label, optional, error, className, ...rest }: TextFieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label} {optional && <span className={styles.optional}>(optional)</span>}
      </label>
      <input
        id={id}
        className={`${styles.input} ${error ? styles.invalid : ""} ${className ?? ""}`.trim()}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      />
      {error && (
        <p id={errorId} className={styles.errorText} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
