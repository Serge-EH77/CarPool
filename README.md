# Church Ride Pairing App

This is a full stack ride coordination platform built for church transportation programs. Administrators can manage events, geocode member addresses, automatically pair passengers with drivers based on location, and send updates to everyone involved.

## Features

* Role based accounts for admins, drivers, and passengers, with a separate dashboard and permission set for each role.
* Address geocoding that converts member addresses and event locations into coordinates using the OpenRouteService geocoding API. The app can preview changes in dry run mode before writing anything to the database.
* Automatic ride pairing using a greedy nearest match algorithm. Each driver and passenger combination is scored using a weighted mix of driver to passenger distance and passenger to event distance.
* Manual override so admins can reassign any passenger to a different driver before finalizing the plan.
* A draft and commit workflow. Pairing updates and manual changes are written to a staging table first, so riders and drivers only see assignments after an admin clicks Commit.
* SMS notifications sent through Twilio when an assignment is finalized. Each driver and passenger receives a text with the other person's name and, for passengers, vehicle details.
* Two factor authentication using email verification codes during login, plus an optional trusted device setting that skips the code for devices the user marks as safe.
* Session based authorization with signed JWT sessions stored in HttpOnly cookies. Access is enforced through Next.js middleware in proxy.ts for both page routes and API routes.

## Tech Stack

* Framework: Next.js with the App Router and TypeScript
* Database: MySQL using mysql2/promise
* Geocoding: OpenRouteService
* SMS: Twilio
* Auth: jsonwebtoken, HttpOnly cookies, and Next.js middleware in proxy.ts
* UI: Tailwind CSS, shadcn/ui components, and lucide-react icons

## Architecture Notes

**Pairing algorithm.** Distances are calculated using the haversine formula, which measures straight line distance rather than actual driving routes. This keeps the algorithm fast, dependency free, and easy to run, which matters more for a volunteer based scheduling process than highly precise trip routing.

**Staging before commit.** Auto pairing and manual reassignment updates are written to a pairing_drafts table for the active event instead of modifying the live AssignedDriverId values that riders and drivers read from directly.

**Auth model.** After a successful login, a signed JWT is created and saved in an HttpOnly, SameSite Strict cookie. The proxy.ts middleware runs on every matching route and verifies the user before allowing access to pages or API endpoints.

## Getting Started

### Prerequisites

* Node.js 18 or later
* MySQL 8.0 or later, preferably 8.0.29 or newer if you want support for ADD COLUMN IF NOT EXISTS in migrations
* An OpenRouteService API key
* A Twilio account with an SMS capable phone number

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

NEXT_PUBLIC_BASE_URL=   # your deployed domain, used to build registration invite links
