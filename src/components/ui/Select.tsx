"use client";

import type { SelectHTMLAttributes } from "react";
import styles from "./Field.module.css";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({
  id,
  label,
  optional,
  error,
  options,
  placeholder = "Select…",
  className,
  ...rest
}: SelectProps) {
  const errorId = `${id}-error`;
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label} {optional && <span className={styles.optional}>(optional)</span>}
      </label>
      <select
        id={id}
        className={`${styles.input} ${error ? styles.invalid : ""} ${className ?? ""}`.trim()}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className={styles.errorText} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
