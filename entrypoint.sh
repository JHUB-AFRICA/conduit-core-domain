#!/bin/sh

set -e

echo ""
echo "========================================="
echo " Starting Conduit Weather API "
echo "========================================="
echo ""

echo "Running database migrations..."
python manage.py migrate --noinput

echo ""
echo "Collecting static files..."
python manage.py collectstatic --noinput

if [ "$DJANGO_ENV" = "production" ]; then
    echo "Starting Gunicorn..."

    exec gunicorn config.wsgi:application \
        --bind 0.0.0.0:8000 \
        --workers=3 \
        --threads=2 \
        --timeout=120 \
        --access-logfile=- \
        --error-logfile=-
else
    echo "Starting Django Development Server..."

    exec python manage.py runserver 0.0.0.0:8000
fi