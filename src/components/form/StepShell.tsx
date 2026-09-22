import type { ReactNode } from "react";
import { ProgressIndicator } from "@/components/ui/ProgressIndicator";
import styles from "./StepShell.module.css";

interface StepShellProps {
  title: string;
  subtitle?: string;
  stepIndex: number;
  stepTotal: number;
  error?: string | null;
  children: ReactNode;
  footer: ReactNode;
}

export function StepShell({
  title,
  subtitle,
  stepIndex,
  stepTotal,
  error,
  children,
  footer,
}: StepShellProps) {
  return (
    <div className={styles.shell}>
      <div className={styles.header}>
        <ProgressIndicator current={stepIndex} total={stepTotal} />
        <div className={styles.titles}>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>
      {error && (
        <p className={styles.banner} role="alert">
          {error}
        </p>
      )}
      <div className={styles.body}>{children}</div>
      <div className={styles.footer}>{footer}</div>
    </div>
  );
}
