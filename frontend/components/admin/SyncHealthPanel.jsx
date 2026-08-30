"use client";

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_STYLES = {
  success: "bg-green-bg text-green",
  partial: "bg-accent-soft text-accent",
  failed: "bg-red-50 text-red-600",
};

export default function SyncHealthPanel({ syncHealth }) {
  const health = syncHealth || {};
  const { success_count = 0, partial_count = 0, failed_count = 0, runs_considered = 0 } = health;
  const lastRun = health.last_run;

  const pct = (n) => (runs_considered > 0 ? Math.round((n / runs_considered) * 100) : 0);

  return (
    <div className="rounded-lg border border-line bg-bg p-5">
      <h3 className="font-display text-base font-semibold text-ink">
        Sync health
      </h3>
      <p className="mt-1 text-xs text-ink-soft">
        Based on the last {runs_considered || 0} ingestion run
        {runs_considered === 1 ? "" : "s"} (manual + automated).
      </p>

      <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-bg-soft">
        {success_count > 0 && (
          <div className="bg-green" style={{ width: `${pct(success_count)}%` }} />
        )}
        {partial_count > 0 && (
          <div className="bg-accent" style={{ width: `${pct(partial_count)}%` }} />
        )}
        {failed_count > 0 && (
          <div className="bg-red-500" style={{ width: `${pct(failed_count)}%` }} />
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="font-mono text-lg font-semibold text-green">{success_count}</p>
          <p className="text-[0.68rem] uppercase tracking-wider text-muted">Success</p>
        </div>
        <div>
          <p className="font-mono text-lg font-semibold text-accent">{partial_count}</p>
          <p className="text-[0.68rem] uppercase tracking-wider text-muted">Partial</p>
        </div>
        <div>
          <p className="font-mono text-lg font-semibold text-red-600">{failed_count}</p>
          <p className="text-[0.68rem] uppercase tracking-wider text-muted">Failed</p>
        </div>
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <p className="text-[0.68rem] uppercase tracking-wider text-muted">
          Most recent run
        </p>
        {lastRun ? (
          <div className="mt-2 flex items-start justify-between gap-2">
            <div>
              <p className="text-sm text-ink">
                {formatDateTime(lastRun.created_at)}
              </p>
              <p className="text-xs text-ink-soft">
                {lastRun.records_created} created ·{" "}
                {lastRun.records_skipped} skipped ·{" "}
                {lastRun.triggered_by || "unknown"}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-md px-2.5 py-1 text-[0.68rem] font-medium capitalize ${
                STATUS_STYLES[lastRun.status] || "bg-bg-soft text-muted"
              }`}
            >
              {lastRun.status}
            </span>
          </div>
        ) : (
          <p className="mt-2 text-sm text-ink-soft">No runs yet.</p>
        )}
      </div>
    </div>
  );
}
