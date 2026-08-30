"use client";

import { useEffect, useState } from "react";
import Reading from "./Reading";

const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

function formatValue(value, suffix = "", digits = 1) {
  if (value === null || value === undefined) return "—";
  return `${Number(value).toFixed(digits)}${suffix}`;
}

function formatTimestamp(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });
}

function timeAgo(isoString) {
  if (!isoString) return "";
  const minutes = Math.round(
    (Date.now() - new Date(isoString).getTime()) / 60000,
  );
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h ago`;
  return `${Math.round(minutes / 1440)}d ago`;
}

export default function Hero() {
  const [station, setStation] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    let intervalId = null;

    async function fetchWeatherData() {
      if (!API_KEY) {
        setStatus("unavailable");
        return;
      }

      try {
        // Using the specific JKUAT station endpoint
        const res = await fetch(
          `${API_URL}/stations/kenya-kiambu-jkuat-iot-aws-condutiempathy1/current`,
          {
            headers: { "x-api-key": API_KEY },
          },
        );

        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = await res.json();

        if (cancelled) return;

        if (data?.weather_readings) {
          setStation(data);
          setStatus("live");
        } else {
          setStatus("unavailable");
        }
      } catch (error) {
        console.error("Error fetching weather data:", error);
        if (!cancelled) setStatus("unavailable");
      }
    }

    // Initial fetch
    fetchWeatherData();

    // Set up interval to fetch every 10 minutes (600,000 ms)
    intervalId = setInterval(fetchWeatherData, 600000);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const isLive = status === "live";
  const readings = station?.weather_readings;

  // Calculate rain today (max of both gauges)
  const rainToday =
    readings?.rain?.gauge_1_today != null ||
    readings?.rain?.gauge_2_today != null
      ? Math.max(
          readings?.rain?.gauge_1_today ?? 0,
          readings?.rain?.gauge_2_today ?? 0,
        )
      : null;

  // Get the timestamp for display
  const displayTime = station?.time || "2026-07-28T07:08:28Z";

  return (
    <section className="bg-bg pb-16 pt-12 lg:pb-20 lg:pt-14">
      <div className="wrap grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        <div>
          <span className="mb-4 inline-block rounded-sm bg-accent-soft px-3 py-1.5 font-mono text-[0.72rem] font-semibold uppercase tracking-wider text-accent">
            Weather &amp; Agricultural Risk API
          </span>
          <h1 className="mb-5 max-w-[28ch] font-display text-[clamp(1.8rem,3.4vw,2.6rem)] font-semibold leading-[1.15] tracking-tight lg:max-w-[26ch]">
            Live weather, read straight off the instruments — turned into
            decisions farmers can act on.
          </h1>
          <p className="mb-7 max-w-[42ch] text-[1.02rem] text-ink-soft">
            Conduit streams real-time telemetry from IoT weather stations across
            the country. One key, one base URL.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <a
              href="/auth/sign-up"
              className="rounded-md bg-ink px-[22px] py-[13px] text-[0.92rem] font-medium tracking-wide text-white transition-colors hover:bg-[#2a2c1f]"
            >
              Get a free API key
            </a>
            <a
              href="/documentation"
              className="rounded-md border border-line px-[22px] py-3 text-[0.92rem] font-medium transition-colors hover:border-ink-soft"
            >
              Read the docs
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-card-line bg-card px-[22px] py-4">
            <div className="mb-3 flex gap-1.5">
              <span className="h-[9px] w-[9px] rounded-full bg-[#e0605a]" />
              <span className="h-[9px] w-[9px] rounded-full bg-[#e0b552]" />
              <span className="h-[9px] w-[9px] rounded-full bg-[#5aa66b]" />
            </div>
            <pre className="whitespace-pre-wrap break-words font-mono text-[0.8rem] leading-relaxed text-[#d7d8c8]">
              <code>{`curl https://conduit-core-domain-u66z.onrender.com/api/v1/stations/jkuat/current \\
  -H "X-API-KEY: YOUR_SECRET_KEY"`}</code>
            </pre>
          </div>

          <div className="rounded-lg border border-line bg-white px-[22px] py-4 shadow-[0_12px_30px_-18px_rgba(20,20,15,0.35)]">
            <div className="mb-3.5 flex flex-col gap-1 border-b border-line pb-3.5">
              <div className="flex items-center justify-between font-mono text-[0.72rem] uppercase tracking-wide text-muted">
                <span>
                  {isLive ? "Current Weather — JKUAT Station" : "Site JKUAT"}
                </span>
                {isLive ? (
                  <span className="inline-flex items-center gap-1.5 text-green">
                    <i className="inline-block h-1.5 w-1.5 rounded-full bg-green" />{" "}
                    Live
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-muted">
                    <i className="inline-block h-1.5 w-1.5 rounded-full bg-muted" />{" "}
                    {status === "loading" ? "Connecting…" : "Example data"}
                  </span>
                )}
              </div>
              <div className="text-[0.65rem] font-mono text-muted">
                {formatTimestamp(displayTime)} · {timeAgo(displayTime)}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-x-3 gap-y-4">
              <Reading
                label="Air Temp"
                value={
                  isLive
                    ? formatValue(readings?.temperature?.bmx, "°C")
                    : "17.3°C"
                }
              />
              <Reading
                label="Humidity"
                value={
                  isLive ? formatValue(readings?.humidity_pct, "%") : "78.5%"
                }
              />
              <Reading
                label="Pressure"
                value={
                  isLive
                    ? formatValue(readings?.pressure_bmx, "hPa", 1)
                    : "852.3 hPa"
                }
              />
              <Reading
                label="Wind"
                value={
                  isLive
                    ? formatValue(readings?.wind?.speed, "m/s", 1)
                    : "0.6 m/s"
                }
              />
              <Reading
                label="Heat Index"
                value={
                  isLive
                    ? formatValue(readings?.indices?.heat_index, "°C", 1)
                    : "17.8°C"
                }
              />
              <Reading
                label="Rain Today"
                value={isLive ? formatValue(rainToday, "mm", 1) : "0.0 mm"}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
