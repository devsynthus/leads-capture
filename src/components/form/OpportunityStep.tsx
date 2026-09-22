"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { SelectableCardGroup } from "@/components/ui/SelectableCard";
import { OPPORTUNITY_OPTIONS, OPPORTUNITY_OTHER_VALUE } from "@/lib/config/opportunities";
import { StepShell } from "./StepShell";
import type { LeadFormData, LeadFormErrors } from "@/hooks/useLeadForm";

interface OpportunityStepProps {
  data: LeadFormData;
  errors: LeadFormErrors;
  onChange: <K extends keyof LeadFormData>(field: K, value: LeadFormData[K]) => void;
  onContinue: () => void;
  onBack: () => void;
  stepIndex: number;
  stepTotal: number;
}

export function OpportunityStep({
  data,
  errors,
  onChange,
  onContinue,
  onBack,
  stepIndex,
  stepTotal,
}: OpportunityStepProps) {
  const [otherRequiredError, setOtherRequiredError] = useState<string | null>(null);
  const isOther = data.opportunity === OPPORTUNITY_OTHER_VALUE;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!data.opportunity) return;
    if (isOther && !data.opportunityOther.trim()) {
      setOtherRequiredError("Please tell us a bit more.");
      return;
    }
    setOtherRequiredError(null);
    onContinue();
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <StepShell
        title="What brings you here?"
        subtitle="Choose the option that fits best."
        stepIndex={stepIndex}
        stepTotal={stepTotal}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={onBack}>
              Back
            </Button>
            <div style={{ marginLeft: "auto" }}>
              <Button type="submit" disabled={!data.opportunity}>
                Continue
              </Button>
            </div>
          </>
        }
      >
        <SelectableCardGroup
          name="opportunity"
          legend="Opportunity"
          options={OPPORTUNITY_OPTIONS}
          value={data.opportunity}
          onChange={(value) => {
            onChange("opportunity", value);
            setOtherRequiredError(null);
          }}
        />
        {isOther && (
          <TextField
            id="opportunityOther"
            label="Tell us more"
            value={data.opportunityOther}
            error={errors.opportunityOther ?? otherRequiredError ?? undefined}
            onChange={(e) => onChange("opportunityOther", e.target.value)}
          />
        )}
      </StepShell>
    </form>
  );
}
