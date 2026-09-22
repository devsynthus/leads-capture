/**
 * In-memory fixed-window rate limiter. Sufficient for a single-booth expo app with
 * modest traffic. On serverless platforms each instance keeps its own counters, so
 * this is a best-effort abuse deterrent, not a hard guarantee — documented in the README.
 */
const hits = new Map<string, { count: number; windowStart: number }>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;

export function isRateLimited(key: string, limit = MAX_REQUESTS_PER_WINDOW): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    hits.set(key, { count: 1, windowStart: now });
    return false;
  }

  entry.count += 1;
  return entry.count > limit;
}

export function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}
