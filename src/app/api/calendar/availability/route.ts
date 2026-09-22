import { NextResponse } from "next/server";
import { getAvailability } from "@/lib/google/calendar";
import { isRateLimited, getClientKey } from "@/lib/utils/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (isRateLimited(getClientKey(request), 30)) {
    return NextResponse.json({ error: "Please wait a moment before trying again." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const requestedStart = start && /^\d{4}-\d{2}-\d{2}$/.test(start) ? start : undefined;

  try {
    const window = await getAvailability(requestedStart);
    return NextResponse.json(window);
  } catch (error) {
    console.error("Failed to fetch calendar availability", error);
    return NextResponse.json(
      { error: "We couldn't load available times right now. Please try again in a moment." },
      { status: 502 }
    );
  }
}
