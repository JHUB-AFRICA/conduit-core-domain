# 📖 Conduit Core Domain — Documentation

![Docs](https://img.shields.io/badge/docs-15%20pages-blue)
![Stack](https://img.shields.io/badge/stack-Django%20%2B%20DRF-0C4B33)
![Status](https://img.shields.io/badge/status-living%20document-brightgreen)

This folder is the project's documentation set. It is **not an application** —
it contains no code that runs — it's a collection of Markdown documents that
together describe what Conduit Core Domain is, how it's built, how data
flows through it, and how every part of its API works.

Rather than one long file, the documentation is split into focused
documents. Read them in order for a full picture, or jump straight to the
one you need.

## How this documentation is organized

| #   | Document                                                                           | What it covers                                                                                |
| --- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 1   | [01-overview.md](./01-overview.md)                                                 | What Conduit is, who it's for, tech stack, feature summary                                    |
| 2   | [02-architecture.md](./02-architecture.md)                                         | System architecture, apps, request flow, how the pieces fit together                          |
| 3   | [03-data-model.md](./03-data-model.md)                                             | Every database model, its fields, and relationships between them                              |
| 4   | [04-authentication-and-authorization.md](./04-authentication-and-authorization.md) | JWT, API keys, rate limiting, permissions, internal shared-secret endpoints                   |
| 5   | [05-api-accounts.md](./05-api-accounts.md)                                         | `/api/v1/auth/` — signup, login, API keys, usage                                              |
| 6   | [06-api-telemetry.md](./06-api-telemetry.md)                                       | `/api/v1/stations/` and `/weather/` — stations, current weather, timeline, summaries, history |
| 7   | [07-api-ingestion.md](./07-api-ingestion.md)                                       | `/api/v1/ingest/`, sync logs, internal sync — pulling data from 3D-FEWSNET                    |
| 8   | [08-api-alerts.md](./08-api-alerts.md)                                             | `/api/v1/alerts/` and webhook subscriptions                                                   |
| 9   | [09-api-blog.md](./09-api-blog.md)                                                 | `/api/v1/blog/` — public editorial content                                                    |
| 10  | [10-ingestion-pipeline.md](./10-ingestion-pipeline.md)                             | How raw 3D-FEWSNET readings become `WeatherMeasurement` rows, step by step                    |
| 11  | [11-alerts-engine.md](./11-alerts-engine.md)                                       | The hydrology and livestock rule engines, scoring, and alert lifecycle                        |
| 12  | [12-webhooks.md](./12-webhooks.md)                                                 | Webhook delivery, signing, retries, and payload shape                                         |
| 13  | [13-configuration.md](./13-configuration.md)                                       | Every environment variable and Django setting that controls behavior                          |
| 14  | [14-deployment.md](./14-deployment.md)                                             | Docker, entrypoint, the GitHub Actions sync cron, and running locally                         |
| 15  | [15-glossary.md](./15-glossary.md)                                                 | Terms, abbreviations, and domain vocabulary used throughout                                   |

## Quick orientation

Conduit Core Domain is a **Django REST Framework backend** that:

1. **Ingests** weather telemetry from the 3D-FEWSNET platform (an external
   sensor network API) into a Postgres/SQLite database.
2. **Evaluates** each new batch of readings against two rule-based alert
   engines — hydrology (runoff risk) and livestock (heat stress).
3. **Serves** that data — current conditions, historical timelines, daily
   summaries, and alerts — over a versioned REST API secured by JWT or API
   keys.
4. **Notifies** external subscribers of new/resolved alerts via signed
   webhooks.
5. Also hosts a small **public blog** app for editorial content, unrelated
   to the telemetry pipeline.

The four Django apps under `config/` map roughly 1:1 to those
responsibilities: `accounts`, `telemetry`, `ingestion`, `alerts`, plus
`blog`. See [02-architecture.md](./02-architecture.md) for how they connect.

## Conventions used across these docs

- Endpoints are always written relative to the API base path, `/api/v1/`.
- Request/response bodies are shown as JSON with representative values,
  not exhaustive schemas — see the relevant serializer file in code for
  the exact field list if you need it.
- "Staff" / "admin" means a Django user with `is_staff=True`, distinct from
  the JWT-vs-API-key authentication method used to reach an endpoint.
