"use client";

import { useState, Fragment } from "react";

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

const STATUS_STYLES = {
  success: "bg-green-bg text-green",
  partial: "bg-accent-soft text-accent",
  failed: "bg-red-50 text-red-600",
};

export default function SyncLogsTable({ logs, isLoading, onRefresh, limit, onLimitChange }) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="rounded-lg border border-line bg-bg">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h3 className="font-display text-base font-semibold text-ink">
            Ingestion runs
          </h3>
          <p className="mt-0.5 text-xs text-ink-soft">
            Manual admin runs and the every-15-minute automated sync,
            most recent first.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="rounded-md border border-line bg-bg px-2.5 py-1.5 text-xs text-ink focus:border-accent focus:outline-none"
          >
            <option value={10}>Last 10</option>
            <option value={20}>Last 20</option>
            <option value={50}>Last 50</option>
            <option value={100}>Last 100</option>
          </select>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="rounded-md border border-line bg-bg-soft px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-line disabled:opacity-50"
          >
            {isLoading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {(!logs || logs.length === 0) && !isLoading && (
        <p className="px-5 py-8 text-center text-sm text-ink-soft">
          No ingestion runs recorded yet.
        </p>
      )}

      {logs && logs.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[0.68rem] uppercase tracking-wider text-muted">
                <th className="px-5 py-3 font-medium">When</th>
                <th className="px-5 py-3 font-medium">Range</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Fetched</th>
                <th className="px-5 py-3 font-medium text-right">Created</th>
                <th className="px-5 py-3 font-medium text-right">Skipped</th>
                <th className="px-5 py-3 font-medium">Triggered by</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <Fragment key={log.id}>
                  <tr
                    onClick={() =>
                      setExpandedId(expandedId === log.id ? null : log.id)
                    }
                    className="cursor-pointer border-b border-line last:border-0 hover:bg-bg-soft"
                  >
                    <td className="px-5 py-3 text-ink-soft">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-ink-soft">
                      {log.requested_start} → {log.requested_end}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-md px-2.5 py-1 text-[0.68rem] font-medium capitalize ${
                          STATUS_STYLES[log.status] || "bg-bg-soft text-muted"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-ink">
                      {log.records_fetched}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-ink">
                      {log.records_created}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-ink">
                      {log.records_skipped}
                    </td>
                    <td className="px-5 py-3 text-ink-soft">
                      {log.triggered_by || "—"}
                    </td>
                  </tr>
                  {expandedId === log.id && log.error_message && (
                    <tr className="border-b border-line bg-red-50/40 last:border-0">
                      <td colSpan={7} className="px-5 py-3">
                        <p className="text-[0.68rem] uppercase tracking-wider text-muted">
                          Error detail
                        </p>
                        <p className="mt-1 font-mono text-xs text-red-600 break-words">
                          {log.error_message}
                        </p>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
