# Conduit Core Domain

![Python](https://img.shields.io/badge/python-3.12-3776AB?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/django-6.0-0C4B33?logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/DRF-REST%20Framework-A30000)
![Docker](https://img.shields.io/badge/docker-ready-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-informational)

Conduit Core Domain is a Django REST Framework backend for ingesting, processing, and serving telemetry and weather data from the **3D-FEWSNET** platform.

## 📚 Documentation

This README covers the basics — for the full picture (architecture,
data model, every API endpoint, the ingestion pipeline, the alerts
engine, webhooks, and deployment) see the **[full documentation](./docs/README.md)**:

| | |
|---|---|
| 🧭 [Overview](./docs/01-overview.md) | What Conduit is, who it's for, the stack |
| 🏗️ [Architecture](./docs/02-architecture.md) | How the apps fit together, with diagrams |
| 🗃️ [Data Model](./docs/03-data-model.md) | Every model, field, and relationship |
| 🔐 [Auth & Authorization](./docs/04-authentication-and-authorization.md) | JWT, API keys, rate limits, internal endpoints |
| 🔌 API Reference | [Accounts](./docs/05-api-accounts.md) · [Telemetry](./docs/06-api-telemetry.md) · [Ingestion](./docs/07-api-ingestion.md) · [Alerts](./docs/08-api-alerts.md) · [Blog](./docs/09-api-blog.md) |
| 🔄 [Ingestion Pipeline](./docs/10-ingestion-pipeline.md) | How raw readings become stored measurements |
| 🚨 [Alerts Engine](./docs/11-alerts-engine.md) | Hydrology & livestock scoring rules |
| 📡 [Webhooks](./docs/12-webhooks.md) | Delivery, signing, retries |
| ⚙️ [Configuration](./docs/13-configuration.md) | Every environment variable |
| 🚀 [Deployment](./docs/14-deployment.md) | Docker, cron, running locally |
| 📖 [Glossary](./docs/15-glossary.md) | Terms and domain vocabulary |

## Features

- REST API built with Django REST Framework
- JWT and API Key authentication
- Telemetry and weather data ingestion
- Dockerized development environment
- Environment-based configuration
- Configurable weather data aggregation (minutely, hourly, daily)
- Daily weather summaries with date range filtering
- Paginated historical weather data
- SQLite (development) and PostgreSQL (production)

## Tech Stack

- Python 3.12
- Django 6.0
- Django REST Framework
- SimpleJWT
- Docker & Docker Compose
- SQLite / PostgreSQL
- Django CORS Headers
- WhiteNoise

---

## Getting Started

### Prerequisites

- Git
- Docker Desktop (recommended)
- Python 3.12+ (for local development)

### Clone the Repository

```bash
git clone https://github.com/JHUB-AFRICA/conduit-core-domain.git
cd conduit-core-domain
```

---

## Environment Variables

Create a `.env` file inside the `config` directory:

```text
config/
└── .env
```

Example:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# FEWSNET Configuration
FEWSNET_API_BASE_URL=https://3d-fewsnet.icdp.ucar.edu/api/v1/data
FEWSNET_EMAIL=your-email@example.com
FEWSNET_API_KEY=your-api-key
FEWSNET_SENSOR_ID=61

# Production Database
DATABASE_URL=your-postgresql-database-url
```

---

## Running the Application

### Using Docker (Recommended)

Build the Docker image:

```bash
docker compose build
```

Start the application:

```bash
docker compose up
```

The API will be available at:

```
http://localhost:8000/
```

---

### Local Development

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt

cd config

python manage.py migrate
python manage.py createsuperuser   # Optional
python manage.py runserver
```

---

## Project Structure

```text
conduit-core-domain/
├── .github/
├── Dockerfile
├── docker-compose.yml
├── entrypoint.sh
├── requirements.txt
├── .dockerignore
├── config/
│   ├── accounts/
│   ├── alerts/
│   ├── ingestion/
│   ├── telemetry/
│   ├── config/
│   ├── manage.py
│   └── .env
└── README.md
```

---

## Applications

| Application | Purpose                                                      |
| ----------- | ------------------------------------------------------------ |
| `accounts`  | User authentication and API key management                   |
| `telemetry` | Weather stations, telemetry, aggregation and historical data |
| `ingestion` | Imports telemetry data from the 3D-FEWSNET platform          |
| `alerts`    | Weather alert generation and webhook notifications           |

---

## Authentication

The API supports two authentication methods:

- **JWT Authentication**
- **API Key Authentication**

For API Key authentication, include:

```http
X-API-KEY: YOUR_API_KEY
```

---

## API Overview

**Base URL**

```
/api/v1/
```

| Method | Endpoint                         | Description                             |
| ------ | -------------------------------- | --------------------------------------- |
| GET    | `/stations/`                     | List all weather stations               |
| GET    | `/stations/{slug}/`              | Retrieve station details                |
| GET    | `/weather/current/`              | Current weather for all active stations |
| GET    | `/weather/{slug}/current/`       | Current weather for a specific station  |
| GET    | `/weather/{slug}/timeline/`      | Aggregated weather timeline             |
| GET    | `/weather/{slug}/daily-summary/` | Daily weather summaries                 |
| GET    | `/weather/{slug}/history/`       | Historical weather data                 |

### Query Parameters

#### Timeline

| Parameter    | Description                      |
| ------------ | -------------------------------- |
| `resolution` | `minutely`, `hourly`, or `daily` |
| `start`      | Start datetime (ISO 8601)        |
| `end`        | End datetime (ISO 8601)          |

#### Daily Summary

| Parameter | Description    |
| --------- | -------------- |
| `start`   | Start datetime |
| `end`     | End datetime   |

#### History

| Parameter    | Description                |
| ------------ | -------------------------- |
| `start_date` | YYYY-MM-DD                 |
| `end_date`   | YYYY-MM-DD                 |
| `page`       | Page number                |
| `page_size`  | Number of records per page |

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
