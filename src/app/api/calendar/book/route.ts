import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { bookingRequestSchema } from "@/lib/validation/schemas";
import { createMeetingEvent, isSlotStillAvailable } from "@/lib/google/calendar";
import { appendLeadRow, ensureSheetHeader } from "@/lib/google/sheets";
import { isRateLimited, getClientKey } from "@/lib/utils/rate-limit";
import type { LeadRecord } from "@/types/lead";

const GENERIC_ERROR = "Something went wrong. Please check your information and try again.";

export async function POST(request: Request) {
  if (isRateLimited(getClientKey(request))) {
    return NextResponse.json({ error: "Please wait a moment before trying again." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  const parsed = bookingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: GENERIC_ERROR, fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { meeting, ...leadFields } = parsed.data;

  // Re-check availability immediately before booking to close the double-booking race window.
  let stillAvailable: boolean;
  try {
    stillAvailable = await isSlotStillAvailable(meeting.date, meeting.startTime, meeting.endTime);
  } catch (error) {
    console.error("Failed to re-check calendar availability", error);
    return NextResponse.json(
      { error: "We couldn't complete the booking right now. Your information has not been lost. Please try again." },
      { status: 502 }
    );
  }

  if (!stillAvailable) {
    return NextResponse.json(
      { error: "That time was just booked by someone else. Please choose another available time.", code: "SLOT_TAKEN" },
      { status: 409 }
    );
  }

  const leadId = randomUUID();
  let eventId: string;
  let meetLink: string | undefined;
  try {
    const created = await createMeetingEvent({
      leadId,
      fullName: leadFields.fullName,
      email: leadFields.email,
      date: meeting.date,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
    });
    eventId = created.eventId;
    meetLink = created.meetLink;
  } catch (error) {
    console.error("Failed to create calendar event", error);
    return NextResponse.json(
      { error: "We couldn't complete the booking right now. Your information has not been lost. Please try again." },
      { status: 502 }
    );
  }

  const lead: LeadRecord = {
    ...leadFields,
    followUpMethod: "meeting",
    meeting: { date: meeting.date, startTime: meeting.startTime },
    leadId,
    submittedAt: new Date().toISOString(),
    meetingEventId: eventId,
    meetingLink: meetLink,
    status: "meeting_booked",
  };

  // The Calendar event is already committed at this point, so a Sheets hiccup must not
  // fail the whole booking — but a booked meeting with no record is exactly what we're
  // protecting against, so retry once before giving up and logging for manual recovery.
  try {
    await ensureSheetHeader();
    await appendLeadRow(lead);
  } catch (firstError) {
    console.error("Failed to write booked meeting to Google Sheets, retrying once", firstError);
    try {
      await appendLeadRow(lead);
    } catch (secondError) {
      console.error(
        `Meeting booked but could not be recorded in Google Sheets after retry — leadId=${leadId} eventId=${eventId}`,
        secondError
      );
    }
  }

  return NextResponse.json({ leadId, eventId, meetLink }, { status: 201 });
}
