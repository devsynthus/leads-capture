import { google } from "googleapis";
import { getCalendarAuth } from "@/lib/google/auth";
import { googleEnv, eventEnv } from "@/lib/config/env";
import { zonedWallTimeToUtc, formatSlotDateLabel } from "@/lib/utils/timezone";
import type { TimeSlot } from "@/types/lead";

function addDaysStr(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

function windowDateRange(windowStart: string): string[] {
  const dates: string[] = [];
  let cursor = windowStart;
  for (let i = 0; i < eventEnv.windowDays; i++) {
    dates.push(cursor);
    cursor = addDaysStr(cursor, 1);
  }
  return dates;
}

/** Candidate slots derived from the configured event window, before checking real calendar busy time. */
function buildCandidateSlots(dateStr: string): { startTime: string; endTime: string; startUtc: Date; endUtc: Date }[] {
  const slots: { startTime: string; endTime: string; startUtc: Date; endUtc: Date }[] = [];
  const durationMin = eventEnv.slotDurationMinutes;
  const totalStartMin = eventEnv.dayStartHour * 60;
  const totalEndMin = eventEnv.dayEndHourFor(dateStr) * 60;

  for (let mins = totalStartMin; mins + durationMin <= totalEndMin; mins += durationMin) {
    const startHour = String(Math.floor(mins / 60)).padStart(2, "0");
    const startMinute = String(mins % 60).padStart(2, "0");
    const endTotal = mins + durationMin;
    const endHour = String(Math.floor(endTotal / 60)).padStart(2, "0");
    const endMinute = String(endTotal % 60).padStart(2, "0");
    const startTime = `${startHour}:${startMinute}`;
    const endTime = `${endHour}:${endMinute}`;
    slots.push({
      startTime,
      endTime,
      startUtc: zonedWallTimeToUtc(dateStr, startTime),
      endUtc: zonedWallTimeToUtc(dateStr, endTime),
    });
  }
  return slots;
}

export interface DayAvailability {
  date: string;
  label: string;
  slots: TimeSlot[];
}

export interface AvailabilityWindow {
  days: DayAvailability[];
  windowStart: string;
  hasPrevious: boolean;
}

/**
 * Queries real Google Calendar free/busy data for a paginated window of days (booking is
 * open-ended, so the full range is never fetched in one call). `requestedStart` is clamped to
 * `eventEnv.dateStart` — visitors can't page back before the event begins.
 */
export async function getAvailability(requestedStart?: string): Promise<AvailabilityWindow> {
  const windowStart =
    requestedStart && requestedStart > eventEnv.dateStart ? requestedStart : eventEnv.dateStart;
  const dates = windowDateRange(windowStart);

  const calendar = google.calendar({ version: "v3", auth: getCalendarAuth() });
  const queryStartUtc = zonedWallTimeToUtc(dates[0], "00:00");
  const queryEndUtc = zonedWallTimeToUtc(dates[dates.length - 1], "23:59");

  const freeBusy = await calendar.freebusy.query({
    requestBody: {
      timeMin: queryStartUtc.toISOString(),
      timeMax: queryEndUtc.toISOString(),
      items: [{ id: googleEnv.calendarId }],
    },
  });

  const busyRanges = (freeBusy.data.calendars?.[googleEnv.calendarId]?.busy ?? []).map((b) => ({
    start: new Date(b.start!).getTime(),
    end: new Date(b.end!).getTime(),
  }));

  const now = Date.now();

  const days = dates.map((date) => {
    const candidates = buildCandidateSlots(date);
    const slots: TimeSlot[] = candidates.map((c) => {
      const overlapsBusy = busyRanges.some(
        (b) => c.startUtc.getTime() < b.end && c.endUtc.getTime() > b.start
      );
      const isPast = c.startUtc.getTime() <= now;
      return {
        date,
        startTime: c.startTime,
        endTime: c.endTime,
        startUtc: c.startUtc.toISOString(),
        endUtc: c.endUtc.toISOString(),
        available: !overlapsBusy && !isPast,
      };
    });
    return { date, label: formatSlotDateLabel(date), slots };
  });

  return { days, windowStart, hasPrevious: windowStart > eventEnv.dateStart };
}

/** Re-checks the single requested slot against live calendar data immediately before booking. */
export async function isSlotStillAvailable(date: string, startTime: string, endTime: string): Promise<boolean> {
  const calendar = google.calendar({ version: "v3", auth: getCalendarAuth() });
  const startUtc = zonedWallTimeToUtc(date, startTime);
  const endUtc = zonedWallTimeToUtc(date, endTime);

  const freeBusy = await calendar.freebusy.query({
    requestBody: {
      timeMin: startUtc.toISOString(),
      timeMax: endUtc.toISOString(),
      items: [{ id: googleEnv.calendarId }],
    },
  });

  const busy = freeBusy.data.calendars?.[googleEnv.calendarId]?.busy ?? [];
  return busy.length === 0 && startUtc.getTime() > Date.now();
}

export interface CreateMeetingEventInput {
  leadId: string;
  fullName: string;
  email: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface CreateMeetingEventResult {
  eventId: string;
  meetLink?: string;
}

/** Creates the calendar event with a Google Meet link and adds the visitor as an attendee. */
export async function createMeetingEvent(input: CreateMeetingEventInput): Promise<CreateMeetingEventResult> {
  const calendar = google.calendar({ version: "v3", auth: getCalendarAuth() });
  const startUtc = zonedWallTimeToUtc(input.date, input.startTime);
  const endUtc = zonedWallTimeToUtc(input.date, input.endTime);

  const response = await calendar.events.insert({
    calendarId: googleEnv.calendarId,
    conferenceDataVersion: 1,
    requestBody: {
      summary: `Expo meeting: ${input.fullName}`,
      description: input.notes,
      start: { dateTime: startUtc.toISOString(), timeZone: eventEnv.timezone },
      end: { dateTime: endUtc.toISOString(), timeZone: eventEnv.timezone },
      attendees: [{ email: input.email, displayName: input.fullName }],
      extendedProperties: { private: { leadId: input.leadId } },
      conferenceData: {
        // requestId just needs to be unique per insert call; leadId already is.
        createRequest: { requestId: input.leadId, conferenceSolutionKey: { type: "hangoutsMeet" } },
      },
    },
    sendUpdates: "all",
  });

  if (!response.data.id) {
    throw new Error("Google Calendar did not return an event ID.");
  }
  return { eventId: response.data.id, meetLink: response.data.hangoutLink ?? undefined };
}
