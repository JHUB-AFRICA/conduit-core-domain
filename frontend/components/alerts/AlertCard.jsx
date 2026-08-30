const SEVERITY_STYLES = {
  low: "bg-green-bg text-green",
  moderate: "bg-accent-soft text-accent",
  high: "bg-orange-100 text-orange-600",
  critical: "bg-red-100 text-red-600",
};

const TYPE_LABEL = {
  hydrology: "Hydrology",
  livestock: "Livestock",
};

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AlertCard({ alert }) {
  const severityClass =
    SEVERITY_STYLES[alert.severity?.toLowerCase()] || "bg-bg-soft text-ink-soft";

  return (
    <div className="flex flex-col rounded-lg border border-line bg-bg p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-md px-2.5 py-1 font-mono text-[0.68rem] font-semibold uppercase tracking-wider ${severityClass}`}
        >
          {alert.severity || "unknown"}
        </span>
        <span className="rounded-md border border-line bg-bg-soft px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-wider text-ink-soft">
          {TYPE_LABEL[alert.alert_type] || alert.alert_type}
        </span>
        {alert.is_active ? (
          <span className="ml-auto rounded-md bg-red-100 px-2.5 py-1 text-[0.68rem] font-medium text-red-600">
            Active
          </span>
        ) : (
          <span className="ml-auto rounded-md bg-bg-soft px-2.5 py-1 text-[0.68rem] font-medium text-muted">
            Resolved
          </span>
        )}
      </div>

      <h3 className="font-display text-base font-semibold text-ink">
        {alert.station_name || "Unknown station"}
      </h3>
      <p className="mt-1.5 text-sm text-ink-soft">{alert.message}</p>

      {alert.alert_type === "hydrology" && (
        <div className="mt-4 space-y-1.5 border-t border-line pt-3 text-xs text-ink-soft">
          {alert.runoff_risk_score != null && (
            <div className="flex justify-between">
              <span>Runoff risk score</span>
              <span className="font-mono text-ink">
                {alert.runoff_risk_score}
              </span>
            </div>
          )}
          {alert.pressure_trend && (
            <div className="flex justify-between">
              <span>Pressure trend</span>
              <span className="font-mono text-ink capitalize">
                {alert.pressure_trend}
              </span>
            </div>
          )}
          {alert.recommendation && (
            <div className="flex justify-between gap-4">
              <span>Recommendation</span>
              <span className="font-mono text-ink text-right">
                {alert.recommendation}
              </span>
            </div>
          )}
        </div>
      )}

      {alert.alert_type === "livestock" && (
        <div className="mt-4 space-y-1.5 border-t border-line pt-3 text-xs text-ink-soft">
          {alert.wbgt_value != null && (
            <div className="flex justify-between">
              <span>WBGT reading</span>
              <span className="font-mono text-ink">
                {alert.wbgt_value}°C
              </span>
            </div>
          )}
          {alert.threshold != null && (
            <div className="flex justify-between">
              <span>Threshold</span>
              <span className="font-mono text-ink">{alert.threshold}°C</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[0.72rem] text-muted">
        <span>Raised {formatDate(alert.created_at)}</span>
        {alert.resolved_at && <span>Resolved {formatDate(alert.resolved_at)}</span>}
      </div>
    </div>
  );
}
