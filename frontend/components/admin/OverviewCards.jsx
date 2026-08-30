"use client";

function StatCard({ label, value, sublabel, tone = "default" }) {
  const toneClasses =
    tone === "accent"
      ? "text-accent"
      : tone === "warn"
        ? "text-amber-600"
        : "text-ink";

  return (
    <div className="rounded-lg border border-line bg-bg p-5">
      <p className="font-mono text-[0.68rem] uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className={`mt-2 font-display text-2xl font-semibold ${toneClasses}`}>
        {value}
      </p>
      {sublabel && <p className="mt-1 text-xs text-ink-soft">{sublabel}</p>}
    </div>
  );
}

export default function OverviewCards({ totals, sourceConfig }) {
  const t = totals || {};

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard
        label="Total measurements"
        value={(t.total_measurements ?? 0).toLocaleString()}
        sublabel="All stations, all time"
      />
      <StatCard
        label="Records — last 24h"
        value={(t.records_last_24h ?? 0).toLocaleString()}
        sublabel={`${(t.records_last_7d ?? 0).toLocaleString()} in last 7 days`}
        tone="accent"
      />
      <StatCard
        label="Stations tracked"
        value={t.total_stations ?? 0}
        sublabel={
          sourceConfig?.sensor_id
            ? `FEWSNET sensor #${sourceConfig.sensor_id}`
            : undefined
        }
      />
      <StatCard
        label="FEWSNET source"
        value={sourceConfig?.configured ? "Connected" : "Not configured"}
        sublabel={
          sourceConfig?.configured
            ? `Auto-sync every ${sourceConfig.cron_interval_minutes ?? 15} min`
            : "Set FEWSNET_EMAIL / FEWSNET_API_KEY"
        }
        tone={sourceConfig?.configured ? "default" : "warn"}
      />
    </div>
  );
}
