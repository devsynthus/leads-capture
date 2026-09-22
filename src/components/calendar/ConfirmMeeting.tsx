"use client";

import { Button } from "@/components/ui/Button";
import { StepShell } from "@/components/form/StepShell";
import styles from "./ConfirmMeeting.module.css";

interface ConfirmMeetingProps {
  fullName: string;
  email: string;
  dateLabel: string;
  timeLabel: string;
  submitting: boolean;
  error: string | null;
  onConfirm: () => void;
  onBack: () => void;
  stepIndex: number;
  stepTotal: number;
}

export function ConfirmMeeting({
  fullName,
  email,
  dateLabel,
  timeLabel,
  submitting,
  error,
  onConfirm,
  onBack,
  stepIndex,
  stepTotal,
}: ConfirmMeetingProps) {
  return (
    <StepShell
      title="Confirm your meeting"
      stepIndex={stepIndex}
      stepTotal={stepTotal}
      error={error}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onBack} disabled={submitting}>
            Back
          </Button>
          <div style={{ marginLeft: "auto" }}>
            <Button
              type="button"
              onClick={onConfirm}
              loading={submitting}
              loadingLabel="Booking…"
            >
              Confirm meeting
            </Button>
          </div>
        </>
      }
    >
      <div className={styles.card}>
        <div className={styles.row}>
          <span className={styles.label}>Name</span>
          <span className={styles.value}>{fullName}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Email</span>
          <span className={styles.value}>{email}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Date</span>
          <span className={styles.value}>{dateLabel}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Time</span>
          <span className={styles.value}>{timeLabel}</span>
        </div>
      </div>
    </StepShell>
  );
}
