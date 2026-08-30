# Conduit

Weather & agricultural risk API, split into two apps in this monorepo:

| | |
|---|---|
| [`backend/`](./backend) | Django REST Framework API — see [backend/README.md](./backend/README.md) |
| [`frontend/`](./frontend) | Next.js 14 app — see [frontend/README.md](./frontend/README.md) |

## Run both with Docker

```bash
cp backend/config/.env.example backend/config/.env   # fill in real values
cp frontend/.env.local.example frontend/.env.local    # only used for local `npm run dev`, not Docker

docker compose up --build
```

- API → http://localhost:8000
- Frontend → http://localhost:3000

`NEXT_PUBLIC_API_URL` is baked into the frontend at build time — override it via a `.env` file at the repo root (read by `docker-compose.yml`) if the API isn't on `localhost:8000`.

## Run without Docker

See each app's own README for local (non-Docker) setup.

## CI

GitHub Actions workflows live in [`.github/workflows/`](./.github/workflows):
- `backend-docker-publish.yml` — builds/pushes the backend image on changes under `backend/`
- `sync-weather.yml` — scheduled weather data sync