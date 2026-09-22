function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

/**
 * Event scheduling defaults. Not environment-configurable on purpose — kept as plain
 * constants to keep the required .env surface small. Edit these directly if your
 * booth's timezone, hours, or slot length ever need to change.
 */
const EVENT_TIMEZONE = "Asia/Karachi";
const EVENT_DAY_START_HOUR = 10;
// Booth hours (staffed, in-person) apply through this date; later dates use EXTENDED_DAY_END_HOUR instead.
const EXHIBITION_LAST_DAY = "2026-09-24";
const EVENT_DAY_END_HOUR = 18;
const EXTENDED_DAY_END_HOUR = 22;
const SLOT_DURATION_MINUTES = 30;
// Booking is open-ended (no last bookable day) — availability is paginated in chunks of this size.
const AVAILABILITY_WINDOW_DAYS = 7;

/** Server-only Google credentials and sheet/calendar targets. Never import from client components. */
export const googleEnv = {
  get clientEmail() {
    return required("GOOGLE_CLIENT_EMAIL");
  },
  get privateKey() {
    // Private keys stored in .env files commonly escape newlines as literal "\n".
    return required("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");
  },
  get sheetId() {
    return required("GOOGLE_SHEET_ID");
  },
  get sheetName() {
    return optional("GOOGLE_SHEET_NAME", "Leads");
  },
  get calendarId() {
    return required("GOOGLE_CALENDAR_ID");
  },
  /**
   * Workspace user email the service account impersonates via Domain-Wide Delegation.
   * Required for Calendar event attendee invites — a bare service account cannot invite attendees.
   */
  get impersonateSubject() {
    return required("GOOGLE_IMPERSONATE_SUBJECT");
  },
};

/** Event-wide scheduling configuration. Safe to read on the server for any request. */
export const eventEnv = {
  timezone: EVENT_TIMEZONE,
  get dateStart() {
    return required("EVENT_DATE_START"); // YYYY-MM-DD — earliest bookable day, no last day (open-ended)
  },
  dayStartHour: EVENT_DAY_START_HOUR,
  /** Booth hours (10-6) on exhibition days; extended hours (10-10) on any later date. */
  dayEndHourFor(dateStr: string): number {
    return dateStr <= EXHIBITION_LAST_DAY ? EVENT_DAY_END_HOUR : EXTENDED_DAY_END_HOUR;
  },
  slotDurationMinutes: SLOT_DURATION_MINUTES,
  windowDays: AVAILABILITY_WINDOW_DAYS,
};
