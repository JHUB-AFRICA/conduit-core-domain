# Conduit Core Domain

Core backend service for ingesting, processing, and serving telemetry and weather-sensor data (3D-FEWSNET) via a Django REST API.

## Features

- JWT-based authentication with custom API key support
- Telemetry data ingestion and aggregation
- 3D-FEWSNET weather dataset integration
- REST API built with Django REST Framework
- Rate-limited API access via per-user API keys

## Tech Stack

- Python / Django 6.0
- Django REST Framework
- SimpleJWT
- SQLite (dev)

## Getting Started

### Prerequisites

- Python 3.12+
- pip

### Installation

```bash
git clone https://github.com/your-username/conduit-core-domain.git
cd conduit-core-domain
python -m venv venv
source venv/bin/activate  # on Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Run migrations and start the server

```bash
cd config
python manage.py migrate
python manage.py createsuperuser   # optional, for admin access
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/`.

## Project Structure

## API Overview

| App         | Purpose                                  |
| ----------- | ---------------------------------------- |
| `accounts`  | User registration, login (JWT), API keys |
| `telemetry` | Stores and serves telemetry readings     |
| `ingestion` | Pulls weather data from 3D-FEWSNET       |

Authentication is via JWT (`/accounts/login/`) or an `x-api-key` header for programmatic access.

## License

MIT License — see [LICENSE](LICENSE) for details.
