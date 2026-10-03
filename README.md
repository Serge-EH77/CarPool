# Church Ride Pairing App

A full-stack ride-coordination platform for church transportation programs. Admins manage events, geocode member addresses, auto-pair passengers with drivers based on proximity, and notify everyone by SMS — all without pairings becoming visible to riders until an admin explicitly commits them.

## Features

- **Role-based accounts** — admin, driver, and passenger dashboards, each with their own view and permissions.
- **Address geocoding** — converts member addresses and event locations into coordinates via the OpenRouteService geocoding API, with dry-run previews before writing to the database.
- **Automatic ride pairing** — a greedy nearest-match algorithm scores every driver/passenger combination by a weighted blend of (driver → passenger distance) and (passenger → event distance), respects per-driver seat capacity, and surfaces anyone who couldn't be matched along with why.
- **Manual override** — admins can reassign any passenger to a different driver inline before finalizing.
- **Draft/commit workflow** — auto-pairing and manual edits write to a staging table first. Riders and drivers only see their assignment once an admin clicks **Commit**, so in-progress adjustments are never visible mid-edit.
- **SMS notifications** — on commit, both the driver and passenger in each pairing get a text via Twilio with the other party's name and (for passengers) vehicle details.
- **Two-factor authentication** — email-based verification codes on login, with an optional "remember this device" skip for trusted devices.
- **Session-based authorization** — signed JWT sessions in HttpOnly cookies, enforced at the edge via Next.js middleware (`proxy.ts`) for both page access and API routes, with the verified identity forwarded downstream via request headers.

## Tech Stack

- **Framework:** Next.js (App Router, TypeScript)
- **Database:** MySQL via `mysql2/promise`
- **Geocoding:** OpenRouteService
- **SMS:** Twilio
- **Auth:** `jsonwebtoken`, HttpOnly cookies, Next.js middleware (`proxy.ts`, Node.js runtime)
- **UI:** Tailwind CSS, shadcn/ui components, lucide-react icons

## Architecture Notes

**Pairing algorithm.** Distances use the haversine formula (straight-line), not routed driving distance — this keeps the algorithm free to run, dependency-free, and fast, which matters more for a volunteer-run system than routing precision. Each passenger is scored against every available driver as `score = (driver→passenger distance × 0.6) + (passenger→event distance × 0.4)`; all valid candidate pairs are sorted globally and assigned greedily, so results don't depend on database row order.

**Staging before commit.** Auto-pairing and manual reassigns write to a `pairing_drafts` table scoped to the active event, never directly to the live `AssignedDriverId` column riders/drivers read from. Committing is a single bulk `UPDATE ... JOIN` rather than a per-row loop, and past events' committed drafts remain as a natural history log.

**Auth model.** Login issues a signed JWT on success (immediately if the device is trusted, after a 2FA code otherwise), stored as an HttpOnly, `SameSite=Strict` cookie. `proxy.ts` runs on every matched request (both page routes and `/api/admin`, `/api/driver`, `/api/passenger`), rejects anything without a valid session for its required role, and forwards the verified `userId`/`role` to route handlers via `x-user-id`/`x-user-role` headers — so individual routes trust the header, not a client-supplied ID in the request body.

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8.0+ (8.0.29+ if you want `ADD COLUMN IF NOT EXISTS` support for migrations)
- An [OpenRouteService API key](https://openrouteservice.org/dev/#/signup) (free tier)
- A [Twilio account](https://www.twilio.com) with an SMS-capable phone number

### Environment Variables

```env
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=

ORS_API_KEY=

JWT_SECRET=          # generate with: openssl rand -base64 32

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

NEXT_PUBLIC_BASE_URL=   # your deployed domain — used to build registration invite links
```

### Database Setup

Run the migrations in `/migrations` against your MySQL instance, in order. These add the `pairing_drafts` staging table and related columns on top of a base `users`/`events` schema.

### Install & Run

```bash
npm install
npm run dev
```

### Docker

```bash
docker compose up -d
```

> **Note:** `NEXT_PUBLIC_*` environment variables are baked in at build time, not read at runtime — rebuild the image after changing `NEXT_PUBLIC_BASE_URL`, don't just restart the container.

## Project Structure

```
app/
  admin/              # admin dashboard — events, users, pairing, settings
  driver/              # driver dashboard + settings
  passenger/           # passenger dashboard + settings
  api/
    admin/
      geocode/         # user & event geocoding routes
      pairing/         # run / manual / commit / draft routes
      users/           # driver & passenger list endpoints
    login/ verify-2fa/ resend-2fa/ logout/
lib/
  db.ts                # MySQL connection pool
  auth.ts              # JWT session creation & verification
  geocode.ts           # OpenRouteService geocoding wrapper
  sms.ts               # Twilio SMS helper
proxy.ts                # Next.js middleware — auth gate for pages & API routes
migrations/             # SQL migration files
```

## Known Limitations

- Distance scoring uses straight-line (haversine) distance rather than actual driving routes.
- "Trusted device" status is currently a client-reported flag rather than a server-verified token — suitable for low-stakes internal use, not hardened against a motivated attacker who already has valid login credentials.
