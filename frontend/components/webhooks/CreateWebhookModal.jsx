"use client";

import { useState } from "react";

const EVENT_TYPES = ["alert.created", "alert.resolved"];

export default function CreateWebhookModal({ isOpen, onClose, onCreate, stations }) {
  const [url, setUrl] = useState("");
  const [eventTypes, setEventTypes] = useState([...EVENT_TYPES]);
  const [alertType, setAlertType] = useState("");
  const [stationSlug, setStationSlug] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const toggleEventType = (evt) => {
    setEventTypes((prev) =>
      prev.includes(evt) ? prev.filter((e) => e !== evt) : [...prev, evt],
    );
  };

  const reset = () => {
    setUrl("");
    setEventTypes([...EVENT_TYPES]);
    setAlertType("");
    setStationSlug("");
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("A URL is required.");
      return;
    }
    if (eventTypes.length === 0) {
      setError("Select at least one event type.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onCreate({
        url: url.trim(),
        event_types: eventTypes,
        ...(alertType ? { alert_type: alertType } : {}),
        ...(stationSlug ? { station_slug: stationSlug } : {}),
      });
      reset();
    } catch (err) {
      setError(err.message || "Failed to create webhook.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-lg border border-line bg-bg p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">
            New webhook subscription
          </h2>
          <button
            onClick={() => {
              reset();
              onClose();
            }}
            className="text-muted hover:text-ink"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[0.85rem] font-medium text-ink">
              Endpoint URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/hooks/conduit"
              required
              className="w-full rounded-md border border-line bg-bg px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[0.85rem] font-medium text-ink">
              Event types
            </label>
            <div className="flex gap-4">
              {EVENT_TYPES.map((evt) => (
                <label key={evt} className="flex items-center gap-2 text-sm text-ink-soft">
                  <input
                    type="checkbox"
                    checked={eventTypes.includes(evt)}
                    onChange={() => toggleEventType(evt)}
                    className="h-4 w-4 rounded border-line accent-accent"
                  />
                  <span className="font-mono text-xs">{evt}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[0.85rem] font-medium text-ink">
                Alert type (optional)
              </label>
              <select
                value={alertType}
                onChange={(e) => setAlertType(e.target.value)}
                className="w-full rounded-md border border-line bg-bg px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">Both</option>
                <option value="hydrology">Hydrology</option>
                <option value="livestock">Livestock</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[0.85rem] font-medium text-ink">
                Station (optional)
              </label>
              <select
                value={stationSlug}
                onChange={(e) => setStationSlug(e.target.value)}
                className="w-full rounded-md border border-line bg-bg px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">All stations</option>
                {stations.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.site_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {stations.length === 0 && (
            <p className="text-xs text-muted">
              No stations loaded — generate an API key from your dashboard to
              filter by station. You can still create a webhook without a
              station filter.
            </p>
          )}

          {error && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                reset();
                onClose();
              }}
              className="rounded-md border border-line bg-bg px-4 py-2 text-sm text-ink-soft transition-colors hover:bg-bg-soft"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2a2c1f] disabled:opacity-50"
            >
              {isSubmitting ? "Creating…" : "Create webhook"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
