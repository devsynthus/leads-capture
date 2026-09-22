import { google } from "googleapis";
import { googleEnv } from "@/lib/config/env";

const SHEETS_SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const CALENDAR_SCOPES = ["https://www.googleapis.com/auth/calendar"];

let cachedSheetsAuth: InstanceType<typeof google.auth.JWT> | null = null;
let cachedCalendarAuth: InstanceType<typeof google.auth.JWT> | null = null;

/**
 * Server-only service-account client for Sheets. Requires the target Sheet to be
 * shared with GOOGLE_CLIENT_EMAIL (Editor access). No impersonation needed.
 */
export function getSheetsAuth() {
  if (cachedSheetsAuth) return cachedSheetsAuth;
  cachedSheetsAuth = new google.auth.JWT({
    email: googleEnv.clientEmail,
    key: googleEnv.privateKey,
    scopes: SHEETS_SCOPES,
  });
  return cachedSheetsAuth;
}

/**
 * Server-only service-account client for Calendar, impersonating a real Workspace
 * user via Domain-Wide Delegation (GOOGLE_IMPERSONATE_SUBJECT). Required because a
 * bare service account cannot add attendees to events — Google rejects it outright.
 * The Workspace admin must authorize this service account's client ID for the
 * calendar scope in Admin Console > Security > API Controls > Domain-wide Delegation.
 */
export function getCalendarAuth() {
  if (cachedCalendarAuth) return cachedCalendarAuth;
  cachedCalendarAuth = new google.auth.JWT({
    email: googleEnv.clientEmail,
    key: googleEnv.privateKey,
    scopes: CALENDAR_SCOPES,
    subject: googleEnv.impersonateSubject,
  });
  return cachedCalendarAuth;
}
