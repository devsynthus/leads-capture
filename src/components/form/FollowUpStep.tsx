"use client";

import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { SelectableCardGroup } from "@/components/ui/SelectableCard";
import { OPPORTUNITY_OPTIONS } from "@/lib/config/opportunities";
import type { FollowUpMethod } from "@/types/lead";
import { StepShell } from "./StepShell";
import type { LeadFormData } from "@/hooks/useLeadForm";
import styles from "./FollowUpStep.module.css";

const FOLLOW_UP_OPTIONS = [
  { value: "email", label: "Email me", description: "We'll follow up by email." },
  { value: "meeting", label: "Book a meeting", description: "Pick a time that works for you." },
];

interface FollowUpStepProps {
  data: LeadFormData;
  followUpMethod: FollowUpMethod | null;
  onFollowUpChange: (method: FollowUpMethod) => void;
  onContinue: () => void;
  onBack: () => void;
  submitting: boolean;
  submitError: string | null;
  stepIndex: number;
  stepTotal: number;
}

export function FollowUpStep({
  data,
  followUpMethod,
  onFollowUpChange,
  onContinue,
  onBack,
  submitting,
  submitError,
  stepIndex,
  stepTotal,
}: FollowUpStepProps) {
  const opportunityLabel =
    OPPORTUNITY_OPTIONS.find((o) => o.value === data.opportunity)?.label ?? data.opportunity;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!followUpMethod || submitting) return;
    onContinue();
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <StepShell
        title="How should we follow up?"
        stepIndex={stepIndex}
        stepTotal={stepTotal}
        error={submitError}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={onBack} disabled={submitting}>
              Back
            </Button>
            <div style={{ marginLeft: "auto" }}>
              <Button
                type="submit"
                disabled={!followUpMethod}
                loading={submitting}
                loadingLabel="Submitting…"
              >
                {followUpMethod === "meeting" ? "Continue to scheduling" : "Submit"}
              </Button>
            </div>
          </>
        }
      >
        <SelectableCardGroup
          name="followUpMethod"
          legend="Follow-up method"
          options={FOLLOW_UP_OPTIONS}
          value={followUpMethod ?? ""}
          onChange={(value) => onFollowUpChange(value as FollowUpMethod)}
        />
        <div className={styles.summary}>
          <span className={styles.summaryTitle}>You&apos;re submitting</span>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Name</span>
            <span>{data.fullName || "—"}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Email</span>
            <span>{data.email || "—"}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Opportunity</span>
            <span>{opportunityLabel || "—"}</span>
          </div>
        </div>
      </StepShell>
    </form>
  );
}
