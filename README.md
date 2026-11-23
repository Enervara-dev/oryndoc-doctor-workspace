# Oryndoc Doctor Workspace

Next.js 16, React, TypeScript and Tailwind CSS. The launcher opens the Reach
workspace; Voice, Assist and Azure remain coming-soon destinations.

## Local development

Start Docker Desktop, then prepare Central and Reach using the root
[local development guide](../LOCAL_DEVELOPMENT.md).

```powershell
node scripts/local-env.mjs
./scripts/Start-Local.ps1 central-api
./scripts/Start-Local.ps1 reach-api
# In another terminal:
./scripts/Start-Local.ps1 doctor-workspace
```

The workspace runs at http://localhost:3101. From this project directory, use
`npm install` once and `npm run dev -- --port 3101`, or `npm run build` and
`npm start -- --port 3101`. Webpack is configured as the default because the
installed Turbopack CSS worker fails to start on this Windows environment.
The same Tailwind loader runs before Next's CSS processing in Webpack.

Copy `.env.example` to `.env.local`, or let the root environment script
fill missing values. All API URLs are server-only variables; no service
key or clinic API key belongs in this browser application.

## Authentication and clinic access

Sign in with a Central account, complete MFA when requested, and select a
clinic with an active Reach membership. The local generated credentials are
in the ignored root `.local-tools/local-credentials.json`.

Access and rotating refresh tokens stay in httpOnly cookies. The Next proxy
renews expired access tokens, and authenticated server reads/actions call
Reach using the selected clinic. Central validates the session and current
membership; Reach separately checks the current permissions and tenant on
each request. The browser receives view models, never bearer tokens.

The navigation and mutation controls reflect clinic permissions. The Reach
API remains the authorization boundary when callers forge requests.

## Live data and changes

All eight Reach views use authenticated APIs, with no automatic demo-data
fallback: appointments, patient directory/history, doctors, scheduling,
follow-ups, clinic settings, overview and analytics. View adapters live in
`src/lib/api`. Dates and appointment times use the clinic timezone.

Server actions persist appointment booking/status/rescheduling/cancellation;
follow-up creation/completion/cancellation; working hours, breaks, holidays
and blocked time; clinic profile/policies; services and follow-up reasons;
doctor creation and Central identity links. Validation and conflicts are
shown in the form.

Follow-ups are associated with an existing appointment. Reach derives patient,
doctor and the audit actor on the server. Clinic administrators can act as
administrators; doctor users require an active doctor linked to their Central
user ID. Manage these links in Doctors & Staff. Central checks the target
user's active clinic access before accepting a link. Staff invitations,
roles and permissions remain managed in Central.

Notification delivery uses Reach's existing queue/provider configuration.
A follow-up's clinical status is separate from whether its message was sent.
Local development does not require MSG91 credentials.

## Verification

With Central, Reach and this workspace running locally:

```powershell
node scripts/check-doctor-workspace.mjs
```

Run that command from the workspace root. It uses generated development
credentials, creates named test records in Local Integration Clinic, verifies
MFA, clinic selection, all views, saved follow-ups, the database audit actor,
settings changes after reload, session refresh, tenant denial and logout.
It restores the booking horizon, unlinks/deactivates its test doctor and
cancels its test appointment. Historical test records remain visible.
Central's MFA request limits still apply to repeated runs.

Backend HTTP tests in Reach also verify that supplied follow-up actors are
rejected and unmapped doctors cannot act as administrators.
