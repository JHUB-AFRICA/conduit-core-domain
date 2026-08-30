# Base Image
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1



RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*



RUN useradd --create-home appuser

WORKDIR /app

COPY requirements.txt .

RUN pip install --upgrade pip && \
    pip install -r requirements.txt


COPY . .


RUN chmod +x entrypoint.sh

RUN chown -R appuser:appuser /app

USER appuser


WORKDIR /app/config

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]