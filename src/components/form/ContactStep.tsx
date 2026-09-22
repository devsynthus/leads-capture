"use client";

import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { StepShell } from "./StepShell";
import type { LeadFormData, LeadFormErrors } from "@/hooks/useLeadForm";

interface ContactStepProps {
  data: LeadFormData;
  errors: LeadFormErrors;
  onChange: <K extends keyof LeadFormData>(field: K, value: LeadFormData[K]) => void;
  onContinue: () => void;
  onBack: () => void;
  stepIndex: number;
  stepTotal: number;
}

export function ContactStep({
  data,
  errors,
  onChange,
  onContinue,
  onBack,
  stepIndex,
  stepTotal,
}: ContactStepProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onContinue();
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <StepShell
        title="Let's start with you"
        subtitle="Tell us how to reach you."
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
          id="fullName"
          label="Full name"
          autoComplete="name"
          value={data.fullName}
          error={errors.fullName}
          onChange={(e) => onChange("fullName", e.target.value)}
        />
        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={data.email}
          error={errors.email}
          onChange={(e) => onChange("email", e.target.value)}
        />
        <TextField
          id="phone"
          label="Phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          optional
          value={data.phone}
          error={errors.phone}
          onChange={(e) => onChange("phone", e.target.value)}
        />
      </StepShell>
    </form>
  );
}
