export type FollowUpMethod = "email" | "meeting";

export interface OpportunityOption {
  value: string;
  label: string;
}

export interface LeadSubmission {
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
  roleOther?: string;
  whatTheyDo?: string;
  opportunity: string;
  opportunityOther?: string;
  followUpMethod: FollowUpMethod;
  meeting?: {
    date: string; // YYYY-MM-DD, in EVENT_TIMEZONE
    startTime: string; // HH:mm, 24h, in EVENT_TIMEZONE
  };
}

export interface LeadRecord extends LeadSubmission {
  leadId: string;
  submittedAt: string; // ISO 8601 UTC
  meetingEventId?: string;
  meetingLink?: string;
  status: "submitted" | "meeting_booked";
}

export interface TimeSlot {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  startUtc: string; // ISO 8601 UTC
  endUtc: string; // ISO 8601 UTC
  available: boolean;
}
