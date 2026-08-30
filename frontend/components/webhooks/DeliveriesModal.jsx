"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "../../libs/api";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DeliveriesModal({ webhook, onClose }) {
  const [deliveries, setDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ next: null, previous: null, count: 0 });

  const fetchDeliveries = useCallback(async () => {
    if (!webhook) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(
        `/alerts/webhooks/${webhook.id}/deliveries/?page=${page}`,
      );
      setDeliveries(response.results || []);
      setPagination({
        next: response.next,
        previous: response.previous,
        count: response.count || 0,
      });
    } catch (err) {
      setError(err.message || "Failed to load delivery history.");
    } finally {
      setIsLoading(false);
    }
  }, [webhook, page]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  if (!webhook) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-line bg-bg p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold text-ink">
              Delivery history
            </h2>
            <p className="truncate font-mono text-xs text-muted">{webhook.url}</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-ink" aria-label="Close">
            ✕
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-accent"></div>
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {!isLoading && !error && deliveries.length === 0 && (
          <p className="py-8 text-center text-sm text-ink-soft">
            No deliveries yet. Trigger a test ping or wait for a live alert.
          </p>
        )}

        {!isLoading && !error && deliveries.length > 0 && (
          <div className="divide-y divide-line rounded-lg border border-line">
            {deliveries.map((d) => (
              <div key={d.id} className="flex items-center gap-4 px-4 py-3 text-sm">
                <span
                  className={`shrink-0 rounded-md px-2 py-0.5 text-[0.68rem] font-medium ${
                    d.success ? "bg-green-bg text-green" : "bg-red-100 text-red-600"
                  }`}
                >
                  {d.success ? "OK" : "Failed"}
                </span>
                <span className="w-32 shrink-0 font-mono text-xs text-ink-soft">
                  {d.event_type}
                </span>
                <span className="w-16 shrink-0 font-mono text-xs text-ink-soft">
                  {d.response_status ?? "—"}
                </span>
                <span className="flex-1 truncate text-xs text-muted" title={d.error_message}>
                  {d.error_message || "—"}
                </span>
                <span className="shrink-0 text-xs text-muted">
                  {formatDate(d.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}

        {(pagination.next || pagination.previous) && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.previous}
              className="rounded-md border border-line bg-bg px-3 py-1.5 text-xs text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-muted">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.next}
              className="rounded-md border border-line bg-bg px-3 py-1.5 text-xs text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
