# Expo Lead Capture & Meeting Booking

A premium, tablet-first lead-capture form for an expo booth. Visitors submit their
details and either request an email follow-up or book a meeting against real
Google Calendar availability. Every submission is written to a Google Sheet.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Custom CSS design-token system (no UI framework)
- GSAP for step/micro-interaction animation
- Zod for shared client/server validation
- `googleapis` for Google Sheets + Google Calendar

## How it works

- `POST /api/lead` — email-only follow-up. Validates, writes one row to Google Sheets.
- `GET /api/calendar/availability` — computes candidate slots from the configured
  event window, then filters out anything that overlaps a real Google Calendar
  busy period (`freebusy.query`). Availability is never hardcoded — it always
  reflects the live calendar.
- `POST /api/calendar/book` — re-checks the requested slot against the live
  calendar immediately before creating the event (closing the double-booking
  race window), creates the Calendar event with the visitor as an attendee,
  then writes the row to Google Sheets with the event ID attached. The Sheets
  write is retried once if it fails, since the Calendar event is already
  committed by that point and a booked meeting with no record is exactly what
  this guards against.

## Environment variables — what you actually need

Only **6 values** are required, all of them Google credentials plus one date.
Everything else (timezone, booth hours, slot length) is a plain constant in
`src/lib/config/env.ts` — edit that file directly if you ever need to change
them, instead of an environment variable.

| Variable | Required | What it is |
|---|---|---|
| `GOOGLE_CLIENT_EMAIL` | Yes | The service account's identity — how the app authenticates to Google without a human logging in. |
| `GOOGLE_PRIVATE_KEY` | Yes | The service account's private key. Proves the requests are really from that account. |
| `GOOGLE_SHEET_ID` | Yes | Which spreadsheet receives lead rows. |
| `GOOGLE_SHEET_NAME` | No (defaults to `Leads`) | Which tab inside that spreadsheet. |
| `GOOGLE_CALENDAR_ID` | Yes | Which calendar meetings get checked against and booked on. |
| `GOOGLE_IMPERSONATE_SUBJECT` | Yes | The real Workspace staff email the service account borrows identity from, so it's allowed to invite the visitor as an attendee. |
| `EVENT_DATE_START` | Yes | The single day meetings can be booked (`YYYY-MM-DD`). |

## Step-by-step: getting every value

This is the part that takes the most setup. Budget about 20 minutes the first
time — it's mostly clicking through Google's own console, not writing code.

### 1. Create a Google Cloud project

1. Go to [console.cloud.google.com](https://console.cloud.google.com/).
2. Click the project dropdown at the top → **New Project**.
3. Name it anything (e.g. "Expo Lead Capture") → **Create**.
4. Make sure this new project is selected (check the dropdown at the top again).

### 2. Turn on the two APIs this app uses

1. In the search bar at the top, search **"Google Sheets API"** → open it → click **Enable**.
2. Search **"Google Calendar API"** → open it → click **Enable**.

### 3. Create the service account (this becomes `GOOGLE_CLIENT_EMAIL` + `GOOGLE_PRIVATE_KEY`)

1. In the search bar, search **"Service Accounts"** → open it.
2. Click **+ Create Service Account**.
3. Give it a name (e.g. "expo-lead-capture") → **Create and Continue**.
4. You can skip the optional "grant access" and "grant users access" steps →
   click **Done**.
5. Click on the service account you just created (from the list).
6. Copy its **email address** shown at the top — this is your
   `GOOGLE_CLIENT_EMAIL` (looks like
   `expo-lead-capture@your-project.iam.gserviceaccount.com`).
7. Go to the **Keys** tab → **Add Key** → **Create new key** → choose **JSON** → **Create**.
   A `.json` file downloads automatically.
8. Open that downloaded file in any text editor. Find the field called
   `"private_key"` — copy its entire value (the long block starting with
   `-----BEGIN PRIVATE KEY-----`). That's your `GOOGLE_PRIVATE_KEY`.
   - Paste it into `.env.local` exactly as it appears in the JSON file
     (including the `\n` characters) — the app automatically converts those
     into real line breaks, so you don't need to reformat anything.
9. **Keep this JSON file private.** Don't commit it to git, don't share it —
   it's effectively a password.

### 4. Create the Google Sheet (this becomes `GOOGLE_SHEET_ID`)

1. Go to [sheets.google.com](https://sheets.google.com) → create a new blank
   spreadsheet. Name it whatever you like (e.g. "Expo Leads").
2. Look at the URL in your browser — it looks like:
   `https://docs.google.com/spreadsheets/d/`**`1AbCdEfGhIjKlMnOp...`**`/edit`
   The long string between `/d/` and `/edit` is your `GOOGLE_SHEET_ID`.
3. Click **Share** (top right) → paste the service account's email from step
   3.6 → set its role to **Editor** → **Send** (it's fine that it's a robot
   account, not a real Gmail address — Google will warn you, click through it).
4. If you want a specific tab name other than the first sheet's default
   "Sheet1", rename the tab and set `GOOGLE_SHEET_NAME` to match — otherwise
   leave `GOOGLE_SHEET_NAME` as `Leads` and rename the tab to `Leads` to match.

### 5. Point at your Google Calendar (this becomes `GOOGLE_CALENDAR_ID`)

1. Open [calendar.google.com](https://calendar.google.com). Decide which
   calendar should receive booth meetings — you can use your main calendar or
   create a dedicated one (recommended, so booth meetings don't mix with your
   personal events).
2. Hover over that calendar in the left sidebar → click the **⋮** (three
   dots) → **Settings and sharing**.
3. Scroll to **"Share with specific people"** → **Add people** → paste the
   service account's email → give it **"Make changes to events"** permission
   → **Send**.
4. Scroll further to **"Integrate calendar"** → copy the **Calendar ID**
   shown there (for your main calendar this is your Gmail address; for a
   dedicated calendar it looks like a long string ending in
   `@group.calendar.google.com`). That's your `GOOGLE_CALENDAR_ID`.

### 6. Authorize Domain-Wide Delegation (this becomes `GOOGLE_IMPERSONATE_SUBJECT`)

This step exists because Google flatly refuses to let a bare service account
invite people to a calendar event — it has to borrow a real person's identity
to do that. **This only works on a Google Workspace account** (a company
domain, not personal Gmail), and needs a Workspace super-admin to approve it.

1. Back on the service account page (Cloud Console → IAM & Admin → Service
   Accounts → your account → **Details** tab), find and copy its
   **Unique ID** (a long numeric string) — this is different from its email.
2. As a Workspace super-admin, go to
   [admin.google.com](https://admin.google.com) → **Security** → **API
   Controls** → **Domain-wide Delegation** → **Add new**.
3. Paste the numeric Unique ID into **Client ID**.
4. Under **OAuth Scopes**, paste exactly:
   `https://www.googleapis.com/auth/calendar`
5. **Authorize**.
6. Decide which real Workspace mailbox should appear as the meeting
   organizer (often the booth owner's own calendar account, or a shared
   mailbox like `events@yourcompany.com`). Set `GOOGLE_IMPERSONATE_SUBJECT`
   to that person's email address.

If you don't have Workspace admin access yourself, this is the one step
you'll need to hand to whoever does.

### 7. Set your event date

Set `EVENT_DATE_START` to the day your booth runs, e.g. `2026-09-24`.
Booth hours default to 10:00–18:00, 30-minute slots, `Asia/Karachi` timezone —
edit the constants at the top of `src/lib/config/env.ts` if any of those need
to change for your event.

## Local development

```bash
npm install
cp .env.example .env.local   # already done in this repo; fill in real values
npm run dev
```

## Configuration you'll actually touch

- **Opportunity options**: `src/lib/config/opportunities.ts`
- **Brand name/tagline/logo alt text**: `src/lib/config/brand.ts`
- **Logo**: replace the file at `public/brand/logo-variant-1.png` (referenced from one place, `src/components/ui/BrandLogo.tsx`)
- **Colors/typography/spacing/radius/shadows**: CSS custom properties at the top of `src/app/globals.css`
- **Event date, timezone, booth hours, slot length**: `src/lib/config/env.ts` (only the date is an env var; the rest are constants in that same file)

## Testing before an event

- Submit the form with the email-only path and confirm a row appears in the Sheet.
- Book a meeting and confirm: the Calendar event exists, the visitor is listed
  as an attendee, and the Sheet row has the event ID.
- Open two browser tabs, load the same time slot in both, book it in one, then
  try to book the same slot in the other — you should get the "just booked by
  someone else" message, not a duplicate booking.
- Try submitting with an invalid/empty email — you should get a clear inline
  error, not a server crash.
- Test on an actual tablet in both orientations, and with a screen reader /
  keyboard-only navigation.
- Enable "reduce motion" in your OS accessibility settings and confirm the
  form still works with minimal animation.

## Deploying to Vercel

1. Push this repository to GitHub (or GitLab/Bitbucket).
2. In Vercel, **Import Project** and select the repository.
3. Add all 6 variables from `.env.example` under **Settings → Environment
   Variables** (Production and Preview).
4. Deploy.
5. After deploying, re-run the booking test plan above against the production URL.
6. For a new event, just update `EVENT_DATE_START` in Vercel and redeploy —
   no code changes needed unless booth hours/timezone/slot length change too.

## Known limitations

- Rate limiting is in-memory per server instance (`src/lib/utils/rate-limit.ts`) —
  adequate for a single-booth event, but not a hard guarantee on serverless
  platforms that run multiple instances. Swap in a shared store (e.g. Upstash
  Redis) if you expect heavier or adversarial traffic.
- Calendar availability is computed from a single configured event window
  (one venue/timezone). Multi-timezone or multi-track events would need the
  scheduling logic extended.
- Domain-Wide Delegation only works on Google Workspace, not personal Gmail —
  see step 6 above.
