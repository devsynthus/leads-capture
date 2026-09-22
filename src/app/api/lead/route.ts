import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { emailLeadSchema } from "@/lib/validation/schemas";
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

  const parsed = emailLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: GENERIC_ERROR, fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const lead: LeadRecord = {
    ...parsed.data,
    leadId: randomUUID(),
    submittedAt: new Date().toISOString(),
    status: "submitted",
  };

  try {
    await ensureSheetHeader();
    await appendLeadRow(lead);
  } catch (error) {
    console.error("Failed to write lead to Google Sheets", error);
    return NextResponse.json(
      { error: "We couldn't save your information right now. Please try again in a moment." },
      { status: 502 }
    );
  }

  return NextResponse.json({ leadId: lead.leadId }, { status: 201 });
}
