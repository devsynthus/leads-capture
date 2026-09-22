import { z } from "zod";
import { OPPORTUNITY_OPTIONS, ROLE_OPTIONS } from "@/lib/config/opportunities";

const opportunityValues = OPPORTUNITY_OPTIONS.map((o) => o.value) as [string, ...string[]];
const roleValues = ROLE_OPTIONS.map((o) => o.value) as [string, ...string[]];

export const meetingSelectionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a date."),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Please choose a time."),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Please choose a time."),
});

const leadCoreSchema = z.object({
  fullName: z.string().trim().min(1, "Please enter your full name.").max(120),
  email: z.string().trim().min(1, "Please enter your email.").email("Please enter a valid email address."),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  company: z.string().trim().min(1, "Please enter your company.").max(160),
  role: z.enum(roleValues, { message: "Please choose a role." }),
  roleOther: z.string().trim().max(160).optional().or(z.literal("")),
  whatTheyDo: z.string().trim().max(600).optional().or(z.literal("")),
  opportunity: z.enum(opportunityValues, { message: "Please choose an opportunity." }),
  opportunityOther: z.string().trim().max(160).optional().or(z.literal("")),
});

/** Body for POST /api/lead — the email-only follow-up path. */
export const emailLeadSchema = leadCoreSchema.extend({
  followUpMethod: z.literal("email"),
});

export type EmailLeadInput = z.infer<typeof emailLeadSchema>;

/** Body for POST /api/calendar/book — the meeting follow-up path. */
export const bookingRequestSchema = leadCoreSchema.extend({
  meeting: meetingSelectionSchema,
});

export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;
