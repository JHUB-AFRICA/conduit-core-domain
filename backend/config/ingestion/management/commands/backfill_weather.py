"""
Run a large backfill from the terminal, avoiding any HTTP request timeout.

Usage:
    python manage.py backfill_weather --start 2026-06-01
    python manage.py backfill_weather --start 2026-06-01 --end 2026-07-04
"""

from django.core.management.base import BaseCommand, CommandError

from ingestion.services.ingest import run_ingest, IngestError


class Command(BaseCommand):
    help = "Backfill WeatherMeasurement rows from the 3D-FEWSNET API for a date range."

    def add_arguments(self, parser):
        parser.add_argument("--start", required=True, help="Start date, YYYY-MM-DD")
        parser.add_argument("--end", required=False, help="End date, YYYY-MM-DD (default: yesterday)")

    def handle(self, *args, **options):
        try:
            result = run_ingest(
                start_date=options["start"],
                end_date=options.get("end"),
                triggered_by="cli",
            )
        except IngestError as exc:
            raise CommandError(str(exc))

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. fetched={result['fetched']} created={result['created']} "
                f"skipped={result['skipped_duplicates']} status={result['status']}"
            )
        )
        if result["errors"]:
            self.stdout.write(self.style.WARNING(f"Chunk errors: {result['errors']}"))
