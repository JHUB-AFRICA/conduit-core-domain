"use client";

export default function SourceConfigCard({ sourceConfig }) {
  const cfg = sourceConfig || {};

  return (
    <div className="rounded-lg border border-line bg-bg p-5">
      <h3 className="font-display text-base font-semibold text-ink">
        Data source
      </h3>
      <p className="mt-1 text-xs text-ink-soft">
        3D-FEWSNET CHORDS API — the upstream feed this app ingests from.
      </p>

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-ink-soft">Connection</dt>
          <dd>
            <span
              className={`rounded-md px-2.5 py-1 text-[0.68rem] font-medium ${
                cfg.configured
                  ? "bg-green-bg text-green"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {cfg.configured ? "Configured" : "Missing credentials"}
            </span>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-ink-soft">Sensor ID</dt>
          <dd className="font-mono text-ink">{cfg.sensor_id ?? "—"}</dd>
        </div>
        <div className="flex items-start justify-between gap-3">
          <dt className="shrink-0 text-ink-soft">API base URL</dt>
          <dd className="truncate font-mono text-xs text-ink" title={cfg.api_base_url}>
            {cfg.api_base_url ?? "—"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-ink-soft">Automated sync</dt>
          <dd className="text-ink">
            every {cfg.cron_interval_minutes ?? 15} min (GitHub Actions)
          </dd>
        </div>
      </dl>

      {!cfg.configured && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
          Set <code className="font-mono">FEWSNET_EMAIL</code> and{" "}
          <code className="font-mono">FEWSNET_API_KEY</code> in the
          backend environment — ingestion runs will fail until both are
          present.
        </p>
      )}
    </div>
  );
}
