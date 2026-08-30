"use client";

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function freshnessBadge(minutes) {
  if (minutes === null || minutes === undefined) {
    return { label: "No data", className: "bg-bg-soft text-muted" };
  }
  if (minutes <= 20) {
    return { label: "Live", className: "bg-green-bg text-green" };
  }
  if (minutes <= 24 * 60) {
    return { label: "Delayed", className: "bg-accent-soft text-accent" };
  }
  return { label: "Stale", className: "bg-red-50 text-red-600" };
}

function formatMinutesAgo(minutes) {
  if (minutes === null || minutes === undefined) return "—";
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)}h ago`;
  return `${Math.round(minutes / (60 * 24))}d ago`;
}

const STATUS_STYLES = {
  active: "bg-green-bg text-green",
  maintenance: "bg-accent-soft text-accent",
  inactive: "bg-bg-soft text-muted",
  decommissioned: "bg-red-50 text-red-600",
};

export default function StationCoverageTable({ stations }) {
  if (!stations || stations.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-bg-soft p-8 text-center text-sm text-ink-soft">
        No weather stations have been created yet. They're created
        automatically the first time an ingest run succeeds.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-bg">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-bg-soft text-[0.68rem] uppercase tracking-wider text-muted">
            <th className="px-4 py-3 font-medium">Station</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Feed</th>
            <th className="px-4 py-3 font-medium">Last reading</th>
            <th className="px-4 py-3 font-medium text-right">Records (24h)</th>
            <th className="px-4 py-3 font-medium text-right">Total records</th>
          </tr>
        </thead>
        <tbody>
          {stations.map((s) => {
            const fresh = freshnessBadge(s.minutes_since_last_reading);
            const statusClass =
              STATUS_STYLES[s.status] || "bg-bg-soft text-muted";
            return (
              <tr key={s.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{s.instrument_name}</p>
                  <p className="text-xs text-muted">
                    sensor #{s.sensor_id} · {s.site_name}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-md px-2.5 py-1 text-[0.68rem] font-medium capitalize ${statusClass}`}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-md px-2.5 py-1 text-[0.68rem] font-medium ${fresh.className}`}
                  >
                    {fresh.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  <p>{formatDateTime(s.latest_measurement_time)}</p>
                  <p className="text-xs text-muted">
                    {formatMinutesAgo(s.minutes_since_last_reading)}
                  </p>
                </td>
                <td className="px-4 py-3 text-right font-mono text-ink">
                  {s.records_last_24h.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-mono text-ink">
                  {s.measurement_count.toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
