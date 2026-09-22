"use client";

import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { TextArea } from "@/components/ui/TextArea";
import { Select } from "@/components/ui/Select";
import { ROLE_OPTIONS, ROLE_OTHER_VALUE } from "@/lib/config/opportunities";
import { StepShell } from "./StepShell";
import type { LeadFormData, LeadFormErrors } from "@/hooks/useLeadForm";

interface DetailsStepProps {
  data: LeadFormData;
  errors: LeadFormErrors;
  onChange: <K extends keyof LeadFormData>(field: K, value: LeadFormData[K]) => void;
  onContinue: () => void;
  onBack: () => void;
  stepIndex: number;
  stepTotal: number;
}

export function DetailsStep({
  data,
  errors,
  onChange,
  onContinue,
  onBack,
  stepIndex,
  stepTotal,
}: DetailsStepProps) {
  const isOtherRole = data.role === ROLE_OTHER_VALUE;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onContinue();
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <StepShell
        title="A little about your work"
        subtitle="This helps us route your follow-up to the right person."
        stepIndex={stepIndex}
        stepTotal={stepTotal}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={onBack}>
              Back
            </Button>
            <div style={{ marginLeft: "auto" }}>
              <Button type="submit">Continue</Button>
            </div>
          </>
        }
      >
        <TextField
          id="company"
          label="Company"
          autoComplete="organization"
          value={data.company}
          error={errors.company}
          onChange={(e) => onChange("company", e.target.value)}
        />
        <Select
          id="role"
          label="Role"
          options={ROLE_OPTIONS}
          value={data.role}
          error={errors.role}
          onChange={(e) => onChange("role", e.target.value)}
        />
        {isOtherRole && (
          <TextField
            id="roleOther"
            label="Tell us more"
            optional
            value={data.roleOther}
            error={errors.roleOther}
            onChange={(e) => onChange("roleOther", e.target.value)}
          />
        )}
        <TextArea
          id="whatTheyDo"
          label="What do you do?"
          optional
          rows={4}
          value={data.whatTheyDo}
          error={errors.whatTheyDo}
          onChange={(e) => onChange("whatTheyDo", e.target.value)}
        />
      </StepShell>
    </form>
  );
}
