"use client";

import type { TextareaHTMLAttributes } from "react";
import styles from "./Field.module.css";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
}

export function TextArea({ id, label, optional, error, className, ...rest }: TextAreaProps) {
  const errorId = `${id}-error`;
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label} {optional && <span className={styles.optional}>(optional)</span>}
      </label>
      <textarea
        id={id}
        className={`${styles.textarea} ${error ? styles.invalid : ""} ${className ?? ""}`.trim()}
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
