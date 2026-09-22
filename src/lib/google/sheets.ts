import { google } from "googleapis";
import { getSheetsAuth } from "@/lib/google/auth";
import { googleEnv } from "@/lib/config/env";
import type { LeadRecord } from "@/types/lead";
import { formatInEventTimezone } from "@/lib/utils/timezone";

const SHEET_HEADER = [
  "Timestamp",
  "Lead ID",
  "Name",
  "Email",
  "Phone",
  "Company",
  "Role",
  "What They Do",
  "Opportunity",
  "Follow-up Method",
  "Meeting Date",
  "Meeting Time",
  "Meeting ID",
  "Meeting Link",
  "Status",
];

function leadToRow(lead: LeadRecord): string[] {
  const opportunity =
    lead.opportunity === "other" && lead.opportunityOther
      ? `Other: ${lead.opportunityOther}`
      : lead.opportunity;
  const role =
    lead.role === "other" && lead.roleOther ? `Other: ${lead.roleOther}` : lead.role ?? "";

  return [
    formatInEventTimezone(new Date(lead.submittedAt)),
    lead.leadId,
    lead.fullName,
    lead.email,
    lead.phone ?? "",
    lead.company ?? "",
    role,
    lead.whatTheyDo ?? "",
    opportunity,
    lead.followUpMethod === "meeting" ? "Meeting" : "Email",
    lead.meeting?.date ?? "",
    lead.meeting?.startTime ?? "",
    lead.meetingEventId ?? "",
    lead.meetingLink ?? "",
    lead.status,
  ];
}

/** Appends one row per lead submission. Throws on API failure; caller decides user-facing messaging. */
export async function appendLeadRow(lead: LeadRecord): Promise<void> {
  const sheets = google.sheets({ version: "v4", auth: getSheetsAuth() });
  await sheets.spreadsheets.values.append({
    spreadsheetId: googleEnv.sheetId,
    range: `${googleEnv.sheetName}!A1`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [leadToRow(lead)] },
  });
}

/** Ensures the header row exists. Safe to call on every cold start; it is a no-op if already present. */
export async function ensureSheetHeader(): Promise<void> {
  const sheets = google.sheets({ version: "v4", auth: getSheetsAuth() });
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId: googleEnv.sheetId,
    range: `${googleEnv.sheetName}!A1:O1`,
  });
  if (existing.data.values && existing.data.values.length > 0) return;

  await sheets.spreadsheets.values.update({
    spreadsheetId: googleEnv.sheetId,
    range: `${googleEnv.sheetName}!A1`,
    valueInputOption: "RAW",
    requestBody: { values: [SHEET_HEADER] },
  });
}
