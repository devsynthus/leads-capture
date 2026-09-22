import styles from "./ProgressIndicator.module.css";

interface ProgressIndicatorProps {
  current: number;
  total: number;
}

export function ProgressIndicator({ current, total }: ProgressIndicatorProps) {
  return (
    <div
      className={styles.wrap}
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Step ${current} of ${total}`}
    >
      <div className={styles.dots} aria-hidden="true">
        {Array.from({ length: total }, (_, i) => i + 1).map((step) => (
          <span
            key={step}
            className={`${styles.dot} ${
              step === current ? styles.dotActive : step < current ? styles.dotDone : ""
            }`.trim()}
          />
        ))}
      </div>
      <span className={styles.label} aria-hidden="true">
        Step {current} of {total}
      </span>
    </div>
  );
}
