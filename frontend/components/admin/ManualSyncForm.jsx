"use client";

import { useEffect, useState } from "react";

export default function ManualSyncForm({ suggestedRange, onRunIngest, onLiveSync }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (suggestedRange?.suggested_start && !startDate) {
      setStartDate(suggestedRange.suggested_start);
    }
    if (suggestedRange?.suggested_end && !endDate) {
      setEndDate(suggestedRange.suggested_end);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedRange]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate) return;
    setIsRunning(true);
    setResult(null);
    try {
      const res = await onRunIngest({ start_date: startDate, end_date: endDate || undefined });
      setResult({ ok: true, data: res });
    } catch (err) {
      setResult({ ok: false, error: err.message || "Ingest run failed." });
    } finally {
      setIsRunning(false);
    }
  };

  const handleLiveSync = async () => {
    setIsSyncing(true);
    setResult(null);
    try {
      const res = await onLiveSync();
      setResult({ ok: true, data: res });
    } catch (err) {
      setResult({ ok: false, error: err.message || "Live sync failed." });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="rounded-lg border border-line bg-bg p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-ink">
            Trigger ingestion
          </h3>
          <p className="mt-1 text-xs text-ink-soft">
            Pull a specific date range from 3D-FEWSNET, or catch up on
            whatever's newer than what's already stored.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLiveSync}
          disabled={isSyncing || isRunning}
          className="shrink-0 rounded-md border border-line bg-bg-soft px-3 py-2 text-xs font-medium text-ink transition-colors hover:bg-line disabled:opacity-50"
        >
          {isSyncing ? "Catching up…" : "Catch up now"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-[0.68rem] uppercase tracking-wider text-muted">
            Start date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-[0.68rem] uppercase tracking-wider text-muted">
            End date <span className="normal-case text-muted">(optional)</span>
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isRunning || isSyncing || !startDate}
          className="rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2a2c1f] disabled:opacity-50"
        >
          {isRunning ? "Ingesting…" : "Run ingest"}
        </button>
        {suggestedRange?.suggested_start && (
          <p className="text-xs text-muted">
            Suggested: {suggestedRange.suggested_start} →{" "}
            {suggestedRange.suggested_end} (defaults to yesterday if end
            date is left blank)
          </p>
        )}
      </form>

      {result && (
        <div
          className={`mt-4 rounded-md px-4 py-3 text-sm ${
            result.ok
              ? result.data?.status === "failed"
                ? "bg-red-50 text-red-600"
                : result.data?.status === "partial"
                  ? "bg-accent-soft text-accent"
                  : "bg-green-bg text-green"
              : "bg-red-50 text-red-600"
          }`}
        >
          {result.ok ? (
            <>
              <p className="font-medium capitalize">
                {result.data.status || "done"} — {result.data.created ?? 0}{" "}
                created, {result.data.skipped_duplicates ?? 0} skipped,{" "}
                {result.data.fetched ?? 0} fetched
              </p>
              {result.data.station && (
                <p className="mt-0.5 text-xs opacity-80">
                  Station: {result.data.station} · {result.data.start_date}
                  {result.data.end_date ? ` → ${result.data.end_date}` : ""}
                </p>
              )}
              {result.data.errors?.length > 0 && (
                <ul className="mt-1 list-inside list-disc text-xs opacity-80">
                  {result.data.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p>{result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
