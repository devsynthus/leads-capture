"use client";

import { useCallback, useState } from "react";
import { emailLeadSchema } from "@/lib/validation/schemas";
import type { EmailLeadInput, BookingRequestInput } from "@/lib/validation/schemas";

export interface LeadFormData {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  roleOther: string;
  whatTheyDo: string;
  opportunity: string;
  opportunityOther: string;
}

export const initialLeadFormData: LeadFormData = {
  fullName: "",
  email: "",
  phone: "",
  company: "",
  role: "",
  roleOther: "",
  whatTheyDo: "",
  opportunity: "",
  opportunityOther: "",
};

export type LeadFormErrors = Partial<Record<keyof LeadFormData, string>>;

const STEP_FIELDS = {
  contact: ["fullName", "email", "phone"],
  details: ["company", "role", "roleOther", "whatTheyDo"],
  opportunity: ["opportunity", "opportunityOther"],
} as const satisfies Record<string, readonly (keyof LeadFormData)[]>;

export type LeadFormStepName = keyof typeof STEP_FIELDS;

const FIELD_TO_STEP: Record<keyof LeadFormData, LeadFormStepName> = {
  fullName: "contact",
  email: "contact",
  phone: "contact",
  company: "details",
  role: "details",
  roleOther: "details",
  whatTheyDo: "details",
  opportunity: "opportunity",
  opportunityOther: "opportunity",
};

const STEP_ORDER: LeadFormStepName[] = ["contact", "details", "opportunity"];

function undefinedIfBlank(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

export function useLeadForm() {
  const [data, setData] = useState<LeadFormData>(initialLeadFormData);
  const [errors, setErrors] = useState<LeadFormErrors>({});

  const update = useCallback(<K extends keyof LeadFormData>(field: K, value: LeadFormData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const validateStep = useCallback(
    (step: LeadFormStepName): boolean => {
      const fields = STEP_FIELDS[step];
      const shape = Object.fromEntries(fields.map((f) => [f, true])) as Record<
        (typeof fields)[number],
        true
      >;
      const schema = emailLeadSchema.pick(shape);
      const subset = Object.fromEntries(fields.map((f) => [f, data[f]]));
      const result = schema.safeParse(subset);

      if (result.success) {
        setErrors((prev) => {
          const next = { ...prev };
          fields.forEach((f) => delete next[f]);
          return next;
        });
        return true;
      }

      const flat = result.error.flatten().fieldErrors as Record<string, string[] | undefined>;
      setErrors((prev) => {
        const next = { ...prev };
        fields.forEach((f) => {
          const messages = flat[f];
          if (messages && messages.length) {
            next[f] = messages[0];
          } else {
            delete next[f];
          }
        });
        return next;
      });
      return false;
    },
    [data]
  );

  const applyServerFieldErrors = useCallback((fieldErrors: Record<string, string[]>) => {
    const next: LeadFormErrors = {};
    let firstStep: LeadFormStepName | null = null;
    for (const [field, messages] of Object.entries(fieldErrors)) {
      if (!messages?.length) continue;
      if (!(field in FIELD_TO_STEP)) continue;
      const key = field as keyof LeadFormData;
      next[key] = messages[0];
      const step = FIELD_TO_STEP[key];
      if (!firstStep || STEP_ORDER.indexOf(step) < STEP_ORDER.indexOf(firstStep)) {
        firstStep = step;
      }
    }
    setErrors((prev) => ({ ...prev, ...next }));
    return firstStep;
  }, []);

  const reset = useCallback(() => {
    setData(initialLeadFormData);
    setErrors({});
  }, []);

  const restore = useCallback((restored: LeadFormData) => {
    setData(restored);
    setErrors({});
  }, []);

  const toEmailLeadPayload = useCallback((): EmailLeadInput => {
    return {
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      phone: undefinedIfBlank(data.phone),
      company: undefinedIfBlank(data.company),
      role: undefinedIfBlank(data.role),
      roleOther: undefinedIfBlank(data.roleOther),
      whatTheyDo: undefinedIfBlank(data.whatTheyDo),
      opportunity: data.opportunity,
      opportunityOther: undefinedIfBlank(data.opportunityOther),
      followUpMethod: "email",
    };
  }, [data]);

  const toBookingCoreFields = useCallback((): Omit<BookingRequestInput, "meeting"> => {
    return {
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      phone: undefinedIfBlank(data.phone),
      company: undefinedIfBlank(data.company),
      role: undefinedIfBlank(data.role),
      roleOther: undefinedIfBlank(data.roleOther),
      whatTheyDo: undefinedIfBlank(data.whatTheyDo),
      opportunity: data.opportunity,
      opportunityOther: undefinedIfBlank(data.opportunityOther),
    };
  }, [data]);

  return {
    data,
    errors,
    update,
    validateStep,
    applyServerFieldErrors,
    reset,
    restore,
    toEmailLeadPayload,
    toBookingCoreFields,
  };
}
