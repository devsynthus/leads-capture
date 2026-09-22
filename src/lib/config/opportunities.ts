import type { OpportunityOption } from "@/types/lead";

/**
 * Visitor-facing opportunity choices. Confirmed placeholder list — swap freely,
 * values are persisted as-is to the lead record and Google Sheet.
 */
export const OPPORTUNITY_OPTIONS: OpportunityOption[] = [
  { value: "partnership", label: "Partnership" },
  { value: "product", label: "Product" },
  { value: "collaboration", label: "Collaboration" },
  { value: "investment", label: "Investment" },
  { value: "other", label: "Other" },
];

export const OPPORTUNITY_OTHER_VALUE = "other";

export const ROLE_OPTIONS: OpportunityOption[] = [
  { value: "founder", label: "Founder" },
  { value: "ceo", label: "CEO" },
  { value: "cto", label: "CTO" },
  { value: "developer", label: "Developer" },
  { value: "product-manager", label: "Product Manager" },
  { value: "investor", label: "Investor" },
  { value: "consultant", label: "Consultant" },
  { value: "student", label: "Student" },
  { value: "other", label: "Other" },
];

export const ROLE_OTHER_VALUE = "other";
