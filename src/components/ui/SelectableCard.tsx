"use client";

import styles from "./SelectableCard.module.css";

export interface SelectableCardOption {
  value: string;
  label: string;
  description?: string;
}

interface SelectableCardGroupProps {
  name: string;
  legend: string;
  options: SelectableCardOption[];
  value: string;
  onChange: (value: string) => void;
}

export function SelectableCardGroup({
  name,
  legend,
  options,
  value,
  onChange,
}: SelectableCardGroupProps) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.grid}>
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              className={`${styles.cardLabel} ${selected ? styles.cardSelected : ""}`.trim()}
            >
              <input
                type="radio"
                className={styles.input}
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
              />
              <span className={styles.cardTitle}>{option.label}</span>
              {option.description && (
                <span className={styles.cardDescription}>{option.description}</span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
