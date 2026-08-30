# Conduit — Weather & Agricultural Risk API frontend

Built with Next.js 14 (App Router), Tailwind CSS, and Zustand for auth/state.

## Run locally

1. Point the frontend at your backend:

   ```bash
   cp .env.local.example .env.local
   # edit NEXT_PUBLIC_API_URL if your backend isn't on http://127.0.0.1:8000
   ```

2. Install and run:

   ```bash
   npm install
   npm run dev
   ```

Open http://localhost:3000. Make sure the Django backend (`conduit-core-domain`)
is running at the URL in `NEXT_PUBLIC_API_URL` — every data-driven page here
(Data Portal, Alerts, Dashboard, Webhooks) talks to it directly.

## Structure

```
app/
  layout.js               Root layout — global Navbar/Footer, fonts, styles
  page.js                 Homepage
  documentation/          Live API reference, generated from libs/docsData.js
  alerts/                 Live alerts feed (GET /alerts/) + marketing subpages
  webhooks/               Webhook subscription management (JWT-authenticated)
  data-portal/            Station browser + CSV/JSON export
  dashboard/               Account profile, API key management
  auth/                   Sign up, sign in, forgot/reset password
components/
  account/, alerts/, data-portal/, docs/, home/, webhooks/
  Navbar.jsx, Footer.jsx, Sidebar.jsx, EndpointSection.jsx, ...
libs/
  api.js                  Thin fetch wrapper — attaches X-API-KEY / JWT headers
  docsData.js             Source of truth for the documentation page content
store.js                  Zustand auth store (JWT + API key, persisted)
```

## Backend integration

Two auth schemes are in play, matching the backend:

- **API key** (`X-API-KEY` header) — telemetry (`/stations/...`) and alerts
  (`/alerts/...`) reads. Generate one from the dashboard's API Access tab.
- **JWT** (`Authorization: Bearer <token>`) — account actions: profile,
  API key management, and webhook subscriptions (`/alerts/webhooks/...`).

`libs/api.js` attaches both headers automatically to every request; each
backend view simply ignores whichever one it doesn't use.

## Notes

- Colors, type, and spacing are defined as Tailwind tokens in
  `tailwind.config.js` / `app/globals.css`.
- Fonts: Source Serif 4 (display), Inter (body), JetBrains Mono (code/data).
- The `/documentation` page's content is data-driven from `libs/docsData.js`
  — update that file (not the page components) when the backend API changes.
