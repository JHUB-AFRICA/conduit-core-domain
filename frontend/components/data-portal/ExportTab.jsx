"use client";

import { useState } from "react";
import WeatherCard from "./WeatherCard";
import DatasetInfo from "./DatasetInfo";
import DataPreview from "./DataPreview";
import { apiClient } from "../../libs/api";

// The backend's /history/ endpoint defaults to 100 rows/page but accepts up
// to 1000 via page_size — requesting the max up front cuts the number of
// round trips (and therefore download time) by up to 10x on large ranges.
const EXPORT_PAGE_SIZE = 1000;

// Each API key is limited to 60 requests/minute (see /auth/api-usage/).
// A large export can burn through that quickly, so instead of the request
// silently failing partway through, pause and retry with backoff when the
// backend reports a rate limit, and keep the user informed the whole time.
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 61_000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(message = "") {
  const m = message.toLowerCase();
  return m.includes("rate limit") || m.includes("quota");
}

export default function ExportTab({
  stations,
  selectedStation,
  setSelectedStation,
}) {
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [exportFormat, setExportFormat] = useState("CSV");
  const [showPreview, setShowPreview] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);

  // Progress while paging through /history/ for a full download.
  const [progress, setProgress] = useState({
    fetched: 0,
    total: 0,
    statusText: "",
  });

  // Fetch every page of historical data, reporting progress as it goes and
  // retrying (with backoff) if the API key's rate limit is hit mid-export
  // rather than silently returning a truncated dataset.
  const fetchAllData = async (firstPageResults, initialCount, stationSlug, baseParams) => {
    let allResults = [...firstPageResults];
    const totalPages = Math.max(1, Math.ceil(initialCount / EXPORT_PAGE_SIZE));

    setProgress({
      fetched: allResults.length,
      total: initialCount,
      statusText: `Fetched page 1 of ${totalPages}…`,
    });

    for (let page = 2; page <= totalPages; page++) {
      let attempt = 0;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        try {
          const params = new URLSearchParams(baseParams);
          params.set("page", String(page));
          params.set("page_size", String(EXPORT_PAGE_SIZE));
          const response = await apiClient.get(
            `/stations/${stationSlug}/history/?${params.toString()}`,
          );
          allResults = allResults.concat(response.results || []);
          setProgress({
            fetched: allResults.length,
            total: initialCount,
            statusText: `Fetched page ${page} of ${totalPages}…`,
          });
          break;
        } catch (err) {
          attempt++;
          if (isRateLimitError(err.message) && attempt <= MAX_RETRIES) {
            setProgress({
              fetched: allResults.length,
              total: initialCount,
              statusText: `Rate limit reached — pausing before retrying page ${page} (attempt ${attempt}/${MAX_RETRIES})…`,
            });
            await sleep(RETRY_DELAY_MS);
            continue;
          }
          // Give up on this page — surface an honest warning rather than
          // pretending the export is complete.
          console.error("Error fetching page", page, err);
          setWarning(
            `Download stopped early at ${allResults.length.toLocaleString()} of ${initialCount.toLocaleString()} records (${err.message || "request failed"}). You can retry, or narrow the date range.`,
          );
          return allResults;
        }
      }
    }

    return allResults;
  };

  // Fetch a preview (first page only — fast, no pagination needed)
  const fetchHistoricalData = async () => {
    if (!selectedStation) {
      setError("Please select a station first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setWarning(null);
    setShowPreview(false);

    try {
      const stationSlug = selectedStation.id;
      const params = new URLSearchParams();
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      const endpoint = `/stations/${stationSlug}/history/?${params.toString()}`;
      const response = await apiClient.get(endpoint);

      setTotalRecords(response.count || 0);

      const previewResults = (response.results || []).slice(0, 10);
      const transformedPreview = previewResults.map((item) => ({
        timestamp: item.time,
        temperature: item.weather_readings?.temperature?.sht || 0,
        humidity: item.weather_readings?.humidity_pct || 0,
        pressure: item.weather_readings?.pressure_bmx || 0,
        windSpeed: item.weather_readings?.wind?.speed || 0,
        windDirection: item.weather_readings?.wind?.direction || 0,
        rainfall: item.weather_readings?.rain?.gauge_1_today || 0,
        heatIndex: item.weather_readings?.indices?.heat_index || 0,
        wbgt: item.weather_readings?.indices?.wbgt || 0,
      }));

      setPreviewData(transformedPreview);
      setShowPreview(true);
    } catch (err) {
      console.error("Error fetching historical data:", err);
      setError(err.message || "Failed to fetch historical data");
    } finally {
      setIsLoading(false);
    }
  };

  // Download the full dataset for the selected range
  const handleDownload = async () => {
    if (!selectedStation) {
      setError("Please select a station first.");
      return;
    }

    setIsDownloading(true);
    setError(null);
    setWarning(null);
    setDownloadSuccess(null);
    setProgress({ fetched: 0, total: 0, statusText: "Starting export…" });

    try {
      const stationSlug = selectedStation.id;
      const baseParams = new URLSearchParams();
      if (startDate) baseParams.append("start_date", startDate);
      if (endDate) baseParams.append("end_date", endDate);
      baseParams.append("page_size", String(EXPORT_PAGE_SIZE));

      const firstPage = await apiClient.get(
        `/stations/${stationSlug}/history/?${baseParams.toString()}`,
      );
      const count = firstPage.count || 0;
      setTotalRecords(count);

      const allData = await fetchAllData(
        firstPage.results || [],
        count,
        stationSlug,
        baseParams,
      );

      setProgress({
        fetched: allData.length,
        total: count,
        statusText: "Preparing file…",
      });

      if (exportFormat === "CSV") {
        downloadCSV(allData, selectedStation);
      } else {
        downloadJSON(allData, selectedStation);
      }

      setDownloadSuccess(
        `${allData.length.toLocaleString()} record${allData.length === 1 ? "" : "s"} downloaded as ${exportFormat}.`,
      );
      setTimeout(() => setDownloadSuccess(null), 6000);
    } catch (err) {
      console.error("Error downloading data:", err);
      setError(err.message || "Failed to download data");
    } finally {
      setIsDownloading(false);
      setProgress({ fetched: 0, total: 0, statusText: "" });
    }
  };

  // Flatten one measurement into a CSV row, with station metadata attached
  // so every row is self-describing — useful once files from multiple
  // stations get merged or shared downstream.
  const flattenData = (item, station) => ({
    station_name: station.siteName || station.name || "",
    station_slug: station.slug || station.id || "",
    station_latitude: station.latitude ?? "",
    station_longitude: station.longitude ?? "",
    station_elevation_m: station.elevationMeters ?? "",
    id: item.id || "",
    time: item.time || "",
    temp_bmx: item.weather_readings?.temperature?.bmx ?? "",
    temp_mcp: item.weather_readings?.temperature?.mcp ?? "",
    temp_sht: item.weather_readings?.temperature?.sht ?? "",
    humidity_pct: item.weather_readings?.humidity_pct ?? "",
    pressure_bmx: item.weather_readings?.pressure_bmx ?? "",
    light_visible: item.weather_readings?.light?.visible ?? "",
    light_infrared: item.weather_readings?.light?.infrared ?? "",
    light_ultraviolet: item.weather_readings?.light?.ultraviolet ?? "",
    rain_gauge_1_today: item.weather_readings?.rain?.gauge_1_today ?? "",
    rain_gauge_2_today: item.weather_readings?.rain?.gauge_2_today ?? "",
    wind_speed: item.weather_readings?.wind?.speed ?? "",
    wind_direction: item.weather_readings?.wind?.direction ?? "",
    wind_gust: item.weather_readings?.wind?.gust ?? "",
    wind_gust_direction: item.weather_readings?.wind?.gust_direction ?? "",
    heat_index: item.weather_readings?.indices?.heat_index ?? "",
    wet_bulb: item.weather_readings?.indices?.wet_bulb ?? "",
    wbgt: item.weather_readings?.indices?.wbgt ?? "",
  });

  // Download as CSV — built as an array and joined once at the end (rather
  // than repeated string concatenation) so this stays fast on large exports.
  const downloadCSV = (data, station) => {
    if (!data || data.length === 0) {
      setError("No data available to download.");
      return;
    }

    const rows = data.map((item) => flattenData(item, station));
    const headers = Object.keys(rows[0]);

    const lines = new Array(rows.length + 1);
    lines[0] = headers.join(",");

    rows.forEach((row, i) => {
      const values = headers.map((header) => {
        let value = row[header] ?? "";
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      lines[i + 1] = values.join(",");
    });

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    triggerDownload(blob, `${(station.siteName || station.name).replace(/\s+/g, "_")}_weather_data_${startDate}_to_${endDate}.csv`);
  };

  // Download as JSON — station metadata lives once at the top level since
  // JSON (unlike CSV) doesn't need every record to repeat it.
  const downloadJSON = (data, station) => {
    if (!data || data.length === 0) {
      setError("No data available to download.");
      return;
    }

    const jsonData = {
      station: {
        name: station.siteName || station.name,
        slug: station.slug || station.id,
        latitude: station.latitude,
        longitude: station.longitude,
        elevation_m: station.elevationMeters,
        status: station.status,
      },
      date_range: { start: startDate, end: endDate },
      total_records: data.length,
      data,
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json;charset=utf-8;",
    });
    triggerDownload(blob, `${(station.siteName || station.name).replace(/\s+/g, "_")}_weather_data_${startDate}_to_${endDate}.json`);
  };

  const triggerDownload = (blob, filename) => {
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!selectedStation) {
    return (
      <div className="text-center py-12">
        <p className="text-ink-soft">Please select a station first.</p>
      </div>
    );
  }

  const progressPct =
    progress.total > 0
      ? Math.min(100, Math.round((progress.fetched / progress.total) * 100))
      : 0;

  return (
    <div className="space-y-8">
      {/* Current Weather Section */}
      <div>
        <h2 className="mb-4 font-display text-lg font-semibold text-ink">
          Current Weather — {selectedStation.name}
        </h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          <WeatherCard
            label="Temperature"
            value={`${selectedStation.current.temperature}°C`}
          />
          <WeatherCard
            label="Humidity"
            value={`${selectedStation.current.humidity}%`}
          />
          <WeatherCard
            label="Pressure"
            value={`${selectedStation.current.pressure} hPa`}
          />
          <WeatherCard
            label="Wind Speed"
            value={`${selectedStation.current.windSpeed} m/s`}
          />
          <WeatherCard
            label="Wind Direction"
            value={selectedStation.current.windDirection}
          />
          <WeatherCard
            label="Rainfall"
            value={`${selectedStation.current.rainfall} mm`}
          />
          <WeatherCard
            label="Heat Index"
            value={`${selectedStation.current.heatIndex}°C`}
          />
          <WeatherCard
            label="Wet Bulb"
            value={`${selectedStation.current.wetBulb}°C`}
          />
          <WeatherCard
            label="WBGT"
            value={`${selectedStation.current.wbgt}°C`}
          />
        </div>
        <p className="mt-3 text-xs text-muted">
          Last updated: {selectedStation.lastUpdated}
        </p>
      </div>

      {/* Export Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Export Form */}
        <div>
          <div className="rounded-lg border border-line bg-bg-soft p-6">
            <h3 className="mb-2 font-display text-base font-semibold text-ink">
              Export Historical Data
            </h3>
            <p className="mb-6 text-sm text-ink-soft">
              Download historical weather observations for the selected
              station and date range. Every row includes the station&apos;s
              name, slug, and location so exported files stay self-describing
              on their own.
            </p>

            <fieldset
              disabled={isDownloading}
              className="space-y-4 disabled:opacity-60"
            >
              {/* Station Selection */}
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">
                  Weather Station
                </label>
                <select
                  value={selectedStation.id}
                  onChange={(e) => {
                    const station = stations.find(
                      (s) => s.id === e.target.value,
                    );
                    setSelectedStation(station);
                    setShowPreview(false);
                    setPreviewData([]);
                    setWarning(null);
                  }}
                  className="w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  {stations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setShowPreview(false);
                      setPreviewData([]);
                      setWarning(null);
                    }}
                    className="w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setShowPreview(false);
                      setPreviewData([]);
                      setWarning(null);
                    }}
                    className="w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Export Format */}
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">
                  Export Format
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 text-sm text-ink-soft">
                    <input
                      type="radio"
                      value="CSV"
                      checked={exportFormat === "CSV"}
                      onChange={(e) => {
                        setExportFormat(e.target.value);
                        setShowPreview(false);
                      }}
                      className="text-accent focus:ring-accent"
                    />
                    CSV
                  </label>
                  <label className="flex items-center gap-2 text-sm text-ink-soft">
                    <input
                      type="radio"
                      value="JSON"
                      checked={exportFormat === "JSON"}
                      onChange={(e) => {
                        setExportFormat(e.target.value);
                        setShowPreview(false);
                      }}
                      className="text-accent focus:ring-accent"
                    />
                    JSON
                  </label>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {exportFormat === "CSV"
                    ? "CSV flattens nested data into columns, with station metadata repeated on every row"
                    : "JSON preserves the complete data structure, with station metadata once at the top"}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Warning Message (partial download) */}
              {warning && (
                <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3">
                  <p className="text-sm text-amber-700">{warning}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={fetchHistoricalData}
                  disabled={isLoading || isDownloading}
                  className="flex-1 rounded-md border border-line bg-bg px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-bg-soft disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Loading…" : "Preview Data"}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isLoading || isDownloading}
                  className="flex-1 rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2a2c1f] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDownloading ? "Downloading…" : "Download Dataset"}
                </button>
              </div>

              {/* Download progress */}
              {isDownloading && (
                <div className="rounded-md border border-line bg-bg px-4 py-3">
                  <div className="mb-2 flex items-center justify-between text-xs text-ink-soft">
                    <span>{progress.statusText}</span>
                    {progress.total > 0 && (
                      <span>
                        {progress.fetched.toLocaleString()} /{" "}
                        {progress.total.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-bg-soft">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {downloadSuccess && (
                <div className="rounded-md bg-green-bg px-4 py-3 text-sm text-green">
                  ✓ {downloadSuccess}
                </div>
              )}
            </fieldset>
          </div>
        </div>

        {/* Dataset Information */}
        <div>
          <DatasetInfo
            station={selectedStation}
            startDate={startDate}
            endDate={endDate}
            totalRecords={totalRecords || 0}
            exportFormat={exportFormat}
          />

          <div className="mt-4 rounded-lg border border-line bg-bg-soft p-4">
            <h4 className="mb-2 text-sm font-semibold text-ink">
              ℹ️ About This Data
            </h4>
            <ul className="space-y-1 text-xs text-ink-soft">
              <li>• Includes station name, slug, coordinates, and elevation</li>
              <li>• Temperature, humidity, pressure, light, rain, wind, and comfort indices</li>
              <li>• All timestamps are in UTC</li>
              <li>
                •{" "}
                {exportFormat === "CSV"
                  ? "CSV flattens nested data, station metadata repeated per row"
                  : "JSON preserves full structure, station metadata once at the top"}
              </li>
              <li>• Large date ranges are fetched in {EXPORT_PAGE_SIZE.toLocaleString()}-row pages with progress shown below</li>
              <li>• Total records: {totalRecords.toLocaleString()}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Data Preview */}
      {showPreview && previewData.length > 0 && (
        <DataPreview
          previewData={previewData}
          totalRecords={totalRecords}
          station={selectedStation}
          exportFormat={exportFormat}
        />
      )}

      {/* Preview loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          <span className="ml-3 text-ink-soft">Loading data…</span>
        </div>
      )}
    </div>
  );
}
