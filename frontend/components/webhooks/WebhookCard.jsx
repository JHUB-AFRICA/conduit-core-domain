"use client";

import { useState } from "react";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function WebhookCard({
  webhook,
  onDelete,
  onTest,
  onViewDeliveries,
}) {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await onTest(webhook.id);
      setTestResult(result);
    } catch (err) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setIsTesting(false);
      setTimeout(() => setTestResult(null), 6000);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this webhook subscription? This can't be undone.")) {
      return;
    }
    setIsDeleting(true);
    try {
      await onDelete(webhook.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-lg border border-line bg-bg p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-mono text-sm text-ink" title={webhook.url}>
            {webhook.url}
          </p>
          <p className="mt-1 text-xs text-muted">
            Created {formatDate(webhook.created_at)}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-md px-2.5 py-1 text-[0.68rem] font-medium ${
            webhook.is_active
              ? "bg-green-bg text-green"
              : "bg-bg-soft text-muted"
          }`}
        >
          {webhook.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {(webhook.event_types || []).map((evt) => (
          <span
            key={evt}
            className="rounded-md border border-line bg-bg-soft px-2 py-0.5 font-mono text-[0.68rem] text-ink-soft"
          >
            {evt}
          </span>
        ))}
        {webhook.alert_type && (
          <span className="rounded-md border border-line bg-bg-soft px-2 py-0.5 font-mono text-[0.68rem] text-ink-soft">
            type: {webhook.alert_type}
          </span>
        )}
        {webhook.station_slug && (
          <span className="rounded-md border border-line bg-bg-soft px-2 py-0.5 font-mono text-[0.68rem] text-ink-soft">
            station: {webhook.station_slug}
          </span>
        )}
      </div>

      {testResult && (
        <div
          className={`mb-4 rounded-md px-3 py-2 text-xs ${
            testResult.success
              ? "bg-green-bg text-green"
              : "bg-red-50 text-red-600"
          }`}
        >
          {testResult.success
            ? `Ping delivered — HTTP ${testResult.status_code ?? "200"}`
            : `Ping failed${testResult.status_code ? ` — HTTP ${testResult.status_code}` : ""}${testResult.error ? `: ${testResult.error}` : ""}`}
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-t border-line pt-3">
        <button
          onClick={handleTest}
          disabled={isTesting}
          className="rounded-md border border-line bg-bg px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-bg-soft disabled:opacity-50"
        >
          {isTesting ? "Sending…" : "Send test ping"}
        </button>
        <button
          onClick={() => onViewDeliveries(webhook)}
          className="rounded-md border border-line bg-bg px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-bg-soft"
        >
          View deliveries
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="ml-auto rounded-md border border-red-200 bg-bg px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
        >
          {isDeleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
}
