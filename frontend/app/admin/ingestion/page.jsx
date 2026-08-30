"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  OverviewCards,
  StationCoverageTable,
  SyncHealthPanel,
  ManualSyncForm,
  SyncLogsTable,
  SourceConfigCard,
} from "../../../components/admin";
import { apiClient } from "../../../libs/api";

const AUTO_REFRESH_SECONDS = 30;

export default function AdminIngestionPage() {
  const [overview, setOverview] = useState(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);
  const [overviewError, setOverviewError] = useState(null);

  const [logs, setLogs] = useState([]);
  const [logsLimit, setLogsLimit] = useState(20);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const pollRef = useRef(null);

  const fetchOverview = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setIsLoadingOverview(true);
    setOverviewError(null);
    try {
      const data = await apiClient.get("/ingestion/overview/");
      setOverview(data);
      setLastUpdated(new Date());
    } catch (err) {
      setOverviewError(err.message || "Failed to load ingestion overview.");
    } finally {
      if (!silent) setIsLoadingOverview(false);
    }
  }, []);

  const fetchLogs = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setIsLoadingLogs(true);
      try {
        const data = await apiClient.get(`/sync-logs/?limit=${logsLimit}`);
        setLogs(data || []);
      } catch (err) {
        console.error("Error fetching sync logs:", err);
      } finally {
        if (!silent) setIsLoadingLogs(false);
      }
    },
    [logsLimit],
  );

  // Initial load
  useEffect(() => {
    fetchOverview();
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch logs whenever the page size changes
  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logsLimit]);

  // Auto-refresh polling — quiet background refresh so the console
  // reflects the automated cron sync without the person having to
  // manually hit refresh every few minutes.
  useEffect(() => {
    if (!autoRefresh) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    pollRef.current = setInterval(() => {
      fetchOverview({ silent: true });
      fetchLogs({ silent: true });
    }, AUTO_REFRESH_SECONDS * 1000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [autoRefresh, fetchOverview, fetchLogs]);

  const handleRunIngest = async ({ start_date, end_date }) => {
    const result = await apiClient.post("/ingest/", { start_date, end_date });
    await Promise.all([fetchOverview({ silent: true }), fetchLogs({ silent: true })]);
    return result;
  };

  const handleLiveSync = async () => {
    const result = await apiClient.post("/ingestion/live-sync/", {});
    await Promise.all([fetchOverview({ silent: true }), fetchLogs({ silent: true })]);
    return result;
  };

  const refreshAll = () => {
    fetchOverview();
    fetchLogs();
  };

  return (
    <div className="min-h-screen border-t border-line bg-bg py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="mb-3 inline-block rounded-sm bg-accent-soft px-3 py-1.5 font-mono text-[0.72rem] font-semibold uppercase tracking-wider text-accent">
              Admin · Staff only
            </span>
            <h1 className="font-display text-2xl font-semibold text-ink">
              Data ingestion console
            </h1>
            <p className="mt-2 max-w-xl text-sm text-ink-soft">
              Monitor the 3D-FEWSNET feed, trigger backfills or catch-up
              syncs, and review ingestion run history.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdated && (
              <p className="text-xs text-muted">
                Updated{" "}
                {lastUpdated.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
            )}
            <label className="flex items-center gap-2 text-xs text-ink-soft">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-line accent-accent"
              />
              Auto-refresh
            </label>
            <button
              onClick={refreshAll}
              className="rounded-md border border-line bg-bg-soft px-3 py-2 text-xs font-medium text-ink transition-colors hover:bg-line"
            >
              Refresh now
            </button>
          </div>
        </div>

        {isLoadingOverview && (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-accent"></div>
          </div>
        )}

        {!isLoadingOverview && overviewError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-600">
            {overviewError}
          </div>
        )}

        {!isLoadingOverview && !overviewError && overview && (
          <div className="space-y-6">
            <OverviewCards
              totals={overview.totals}
              sourceConfig={overview.source_config}
            />

            <ManualSyncForm
              suggestedRange={overview.suggested_range}
              onRunIngest={handleRunIngest}
              onLiveSync={handleLiveSync}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <h2 className="mb-3 font-display text-base font-semibold text-ink">
                  Station coverage
                </h2>
                <StationCoverageTable stations={overview.stations} />
              </div>
              <div className="space-y-6">
                <SyncHealthPanel syncHealth={overview.sync_health} />
                <SourceConfigCard sourceConfig={overview.source_config} />
              </div>
            </div>

            <SyncLogsTable
              logs={logs}
              isLoading={isLoadingLogs}
              onRefresh={() => fetchLogs()}
              limit={logsLimit}
              onLimitChange={setLogsLimit}
            />
          </div>
        )}
      </div>
    </div>
  );
}
