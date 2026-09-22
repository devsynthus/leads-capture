import { eventEnv } from "@/lib/config/env";

/** Offset (ms) such that `utcInstant - offset` reads as `utcInstant`'s wall-clock time in `timeZone`. */
function getTimeZoneOffsetMs(utcInstant: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(utcInstant).reduce<Record<string, string>>((acc, p) => {
    if (p.type !== "literal") acc[p.type] = p.value;
    return acc;
  }, {});
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );
  return asUtc - utcInstant.getTime();
}

/**
 * Converts a wall-clock date/time as experienced in `timeZone` into the corresponding UTC Date.
 * Two-pass to stay correct across DST transitions.
 */
export function zonedWallTimeToUtc(
  dateStr: string, // YYYY-MM-DD
  timeStr: string, // HH:mm
  timeZone: string = eventEnv.timezone
): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);
  const guess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const offset1 = getTimeZoneOffsetMs(new Date(guess), timeZone);
  const pass1 = guess - offset1;
  const offset2 = getTimeZoneOffsetMs(new Date(pass1), timeZone);
  return new Date(guess - offset2);
}

/** Formats a UTC instant as a readable timestamp in the event timezone, e.g. "2026-09-24 14:30". */
export function formatInEventTimezone(date: Date, timeZone: string = eventEnv.timezone): string {
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const parts = dtf.formatToParts(date).reduce<Record<string, string>>((acc, p) => {
    if (p.type !== "literal") acc[p.type] = p.value;
    return acc;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
}

/** Human-friendly time label, e.g. "2:30 PM", rendered in the event timezone. */
export function formatSlotTimeLabel(dateStr: string, timeStr: string, timeZone: string = eventEnv.timezone): string {
  const utc = zonedWallTimeToUtc(dateStr, timeStr, timeZone);
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(utc);
}

/** Human-friendly date label, e.g. "September 24". */
export function formatSlotDateLabel(dateStr: string, timeZone: string = eventEnv.timezone): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const noonUtc = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "long",
    day: "numeric",
  }).format(noonUtc);
}
