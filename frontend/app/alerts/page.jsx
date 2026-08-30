export const metadata = {
  title: "Smart Hydrology & Fertilizer Safety API — Conduit",
  description:
    "Real-time runoff risk scores using rainfall and barometric pressure data for fertilizer safety.",
};

function CloudRainIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="M16 14v6" />
      <path d="M8 14v6" />
      <path d="M12 16v6" />
    </svg>
  );
}

function BanknoteIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="12" x="2" y="6" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

function LightbulbIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

function TargetIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function DropletIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
    </svg>
  );
}

function ThermometerIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
    </svg>
  );
}

function RocketIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

function FlameIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

function ArrowRightIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function CheckIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function HydrologyAlertsPage() {
  return (
    <>
      <div className="min-h-screen border-t border-line bg-bg">
        <div className="mx-auto max-w-4xl px-4 py-12">
          {/* ============================================ */}
          {/* PAGE HEADER */}
          {/* ============================================ */}
          <div className="mb-12">
            <span className="mb-4 inline-block rounded-sm bg-accent-soft px-3 py-1.5 font-mono text-[0.72rem] font-semibold uppercase tracking-wider text-accent">
              Agricultural Risk API
            </span>
            <h1 className="font-display text-4xl font-semibold text-ink leading-tight">
              Smart Hydrology &amp; Fertilizer Safety API
            </h1>
            <p className="mt-4 text-lg text-ink-soft max-w-3xl">
              Score fertilizer runoff risk in real time from rolling rainfall
              totals and barometric pressure trend.
            </p>
          </div>

          {/* ============================================ */}
          {/* OVERVIEW */}
          {/* ============================================ */}
          <section className="mb-12">
            <h2 className="mb-4 font-display text-2xl font-semibold text-ink">
              Overview
            </h2>
            <p className="text-ink-soft leading-relaxed">
              Every time new telemetry lands for a station, the system re-scores
              runoff risk for that station using a rolling 6-hour window of
              rainfall and pressure readings — no request needed. When the score
              crosses the alert threshold, an alert is created (and a webhook
              fires, if you've subscribed to one).
            </p>
          </section>

          {/* ============================================ */}
          {/* PROBLEM & SOLUTION */}
          {/* ============================================ */}
          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Problem */}
            <div className="rounded-lg border border-red-200 bg-red-50 p-6">
              <CloudRainIcon className="mb-3 h-7 w-7 text-red-600" />
              <h3 className="mb-2 font-display text-lg font-semibold text-red-700">
                Problem
              </h3>
              <p className="text-sm text-red-600">
                Farmers lose fertilizer to unexpected rainfall shortly after
                application. These losses are invisible until crop yield
                reduction occurs.
              </p>
              <div className="mt-4 rounded-md bg-white/50 p-3">
                <p className="flex items-center gap-2 text-sm font-medium text-red-700">
                  <BanknoteIcon className="h-4 w-4 shrink-0" />
                  Financial loss • Invisible damage • Crop yield reduction
                </p>
              </div>
            </div>

            {/* Solution */}
            <div className="rounded-lg border border-green-200 bg-green-50 p-6">
              <LightbulbIcon className="mb-3 h-7 w-7 text-green-700" />
              <h3 className="mb-2 font-display text-lg font-semibold text-green-700">
                Solution
              </h3>
              <p className="text-sm text-green-700">
                A rule-based hydrology score that combines recent rainfall with
                barometric pressure trend into a single 0–100 runoff risk
                number, recalculated on every ingest.
              </p>
              <div className="mt-4 rounded-md bg-white/50 p-3">
                <p className="flex items-center gap-2 text-sm font-medium text-green-700">
                  <TargetIcon className="h-4 w-4 shrink-0" />
                  Automatic • Real-time • Actionable
                </p>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* DATA INPUTS */}
          {/* ============================================ */}
          <section className="mb-12">
            <h2 className="mb-4 font-display text-2xl font-semibold text-ink">
              Data Inputs
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-line bg-bg p-5">
                <h4 className="mb-3 flex items-center gap-2 font-semibold text-ink">
                  <DropletIcon className="h-5 w-5 text-accent" />
                  Rain Gauges
                </h4>
                <ul className="space-y-2 text-sm text-ink-soft">
                  <li className="flex items-start gap-2">
                    <span className="text-accent">•</span>
                    <span>
                      <strong className="text-ink">Rain Gauge A &amp; B</strong>{" "}
                      — two redundant gauges on the same station. The higher of
                      the two totals for the window is used, so a dry or
                      malfunctioning gauge can't mask real rainfall.
                    </span>
                  </li>
                </ul>
              </div>
              <div className="rounded-lg border border-line bg-bg p-5">
                <h4 className="mb-3 flex items-center gap-2 font-semibold text-ink">
                  <ThermometerIcon className="h-5 w-5 text-accent" />
                  Atmospheric Sensor
                </h4>
                <ul className="space-y-2 text-sm text-ink-soft">
                  <li className="flex items-start gap-2">
                    <span className="text-accent">•</span>
                    <span>
                      <strong className="text-ink">
                        BMX Barometric Pressure
                      </strong>{" "}
                      — first vs. last reading in the window determines whether
                      pressure is rising, falling, or steady.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* ============================================ */}
          {/* SCORING MODEL */}
          {/* ============================================ */}
          <section className="mb-12">
            <h2 className="mb-4 font-display text-2xl font-semibold text-ink">
              Scoring Model
            </h2>
            <div className="rounded-lg border border-line bg-bg p-6">
              <p className="mb-4 text-ink-soft">
                The score (0–100) is two weighted, bucketed components added
                together — intentionally simple thresholds rather than a
                machine-learning model, so it's easy to read and tune:
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-md bg-bg-soft border border-line px-4 py-3">
                  <p className="text-xs text-muted">Up to 70 points</p>
                  <p className="text-sm font-semibold text-ink">
                    Rainfall in the last 6 hours
                  </p>
                  <p className="text-xs text-ink-soft">
                    Bucketed: ≥40mm scores 70, down to any measurable rain below
                    5mm scoring 5
                  </p>
                </div>
                <div className="rounded-md bg-bg-soft border border-line px-4 py-3">
                  <p className="text-xs text-muted">Up to 30 points</p>
                  <p className="text-sm font-semibold text-ink">
                    Pressure trend
                  </p>
                  <p className="text-xs text-ink-soft">
                    Falling (≥1 hPa drop) scores 30, steady scores 10, rising
                    scores 0
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================ */}
          {/* RISK TIERS */}
          {/* ============================================ */}
          <section className="mb-12">
            <h2 className="mb-4 font-display text-2xl font-semibold text-ink">
              Risk Tiers
            </h2>
            <p className="mb-4 text-ink-soft leading-relaxed">
              An alert is only created once the score reaches{" "}
              <span className="font-mono text-accent">50</span> — below that,
              the score still runs internally but nothing is surfaced via the
              API or a webhook.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-line bg-bg-soft p-5">
                <span className="rounded-md bg-accent-soft px-2.5 py-1 text-[0.68rem] font-medium text-accent">
                  High · 50–74
                </span>
                <p className="mt-2 text-sm text-ink-soft">
                  "Delay fertilizer application"
                </p>
              </div>
              <div className="rounded-lg border border-line bg-bg-soft p-5">
                <span className="rounded-md bg-red-50 px-2.5 py-1 text-[0.68rem] font-medium text-red-600">
                  Extreme · 75–100
                </span>
                <p className="mt-2 text-sm text-ink-soft">
                  "Do not apply fertilizer"
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted">
              Scores below 50 are classified Low (0–24, "Safe to apply
              fertilizer") or Moderate (25–49, "Monitor weather"), but stay
              internal since they don't cross the alert threshold.
            </p>
          </section>

          {/* ============================================ */}
          {/* API RESPONSE EXAMPLE */}
          {/* ============================================ */}
          <section className="mb-12">
            <h2 className="mb-4 font-display text-2xl font-semibold text-ink">
              API Response Example
            </h2>
            <div className="rounded-lg border border-card-line bg-card px-6 py-4">
              <div className="mb-3.5 flex justify-between border-b border-card-line pb-3.5 font-mono text-[0.68rem] tracking-wide text-[#9a9c8a]">
                <span>GET /alerts/?type=hydrology</span>
                <span className="text-accent">● LIVE</span>
              </div>
              <pre className="whitespace-pre-wrap break-words font-mono text-[0.8rem] leading-relaxed text-[#d7d8c8]">
                <code>{`{
  "id": "6f1c9e2a-2b0e-4b7a-9b7a-5a1f2c3d4e5f",
  "station_name": "Site JKUAT",
  "station_slug": "kenya-kiambu-jkuat-iot-aws-conduitempathy1",
  "alert_type": "hydrology",
  "severity": "high",
  "message": "Runoff risk is high (68/100) at Site JKUAT: 24.5mm rainfall in the last 6h, pressure falling.",
  "is_active": true,
  "resolved_at": null,
  "runoff_risk_score": 68,
  "rainfall_summary": {
    "rain_gauge_a_mm": 22.1,
    "rain_gauge_b_mm": 24.5,
    "effective_rainfall_mm": 24.5,
    "window_hours": 6
  },
  "pressure_trend": "falling",
  "recommendation": "Delay fertilizer application",
  "created_at": "2026-07-09T14:20:11Z",
  "updated_at": "2026-07-09T14:20:11Z"
}`}</code>
              </pre>
            </div>
          </section>

          {/* ============================================ */}
          {/* DATA FLOW */}
          {/* ============================================ */}
          <section className="mb-12">
            <h2 className="mb-4 font-display text-2xl font-semibold text-ink">
              Data Flow
            </h2>
            <div className="overflow-x-auto">
              <div className="flex items-center gap-2 rounded-lg border border-line bg-bg p-4 text-sm">
                <span className="whitespace-nowrap rounded-full bg-accent/10 px-3 py-1 font-mono text-xs text-accent">
                  Step 1
                </span>
                <span className="whitespace-nowrap font-medium text-ink">
                  Weather Station
                </span>
                <span className="text-muted">→</span>
                <span className="whitespace-nowrap font-medium text-ink">
                  Ingestion
                </span>
                <span className="text-muted">→</span>
                <span className="whitespace-nowrap font-medium text-ink">
                  Hydrology Scoring
                </span>
                <span className="text-muted">→</span>
                <span className="whitespace-nowrap font-medium text-ink">
                  Alert (if ≥50)
                </span>
                <span className="text-muted">→</span>
                <span className="whitespace-nowrap font-medium text-ink">
                  API + Webhook
                </span>
              </div>
            </div>
          </section>

          {/* ============================================ */}
          {/* KEY INSIGHT */}
          {/* ============================================ */}
          <section className="mb-12">
            <div className="rounded-lg border-2 border-accent bg-accent/5 p-8 text-center">
              <RocketIcon className="mx-auto mb-3 h-8 w-8 text-accent" />
              <h2 className="font-display text-2xl font-semibold text-ink">
                Key Insight
              </h2>
              <p className="mt-3 text-lg text-ink-soft max-w-2xl mx-auto">
                The system turns raw rainfall and pressure readings into
                <strong className="text-ink">
                  {" "}
                  actionable agricultural decision intelligence
                </strong>
                , automatically, on every ingest — no prediction request
                required.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-bg px-4 py-1.5 text-sm text-green">
                  <CheckIcon className="h-3.5 w-3.5" />
                  Automatic
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-bg px-4 py-1.5 text-sm text-green">
                  <CheckIcon className="h-3.5 w-3.5" />
                  Real-time
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-bg px-4 py-1.5 text-sm text-green">
                  <CheckIcon className="h-3.5 w-3.5" />
                  Actionable
                </span>
              </div>
            </div>
          </section>

          {/* ============================================ */}
          {/* FINAL TAKEAWAY */}
          {/* ============================================ */}
          <section className="mb-12">
            <div className="rounded-lg border-2 border-red-500/30 bg-red-50 p-8 text-center">
              <FlameIcon className="mx-auto mb-3 h-8 w-8 text-red-600" />
              <h2 className="font-display text-2xl font-semibold text-ink">
                Final Takeaway
              </h2>
              <div className="mt-4 space-y-3">
                <p className="flex items-center justify-center gap-2 text-lg font-semibold text-red-700">
                  <ArrowRightIcon className="h-5 w-5 shrink-0" />
                  This is not just a weather API
                </p>
                <p className="flex items-center justify-center gap-2 text-lg font-bold text-ink">
                  <ArrowRightIcon className="h-5 w-5 shrink-0" />
                  This is a{" "}
                  <span className="text-red-600">
                    financial risk signal
                  </span>{" "}
                  for agriculture
                </p>
              </div>
            </div>
          </section>

          {/* ============================================ */}
          {/* GET STARTED CTA */}
          {/* ============================================ */}
          <section className="border-t border-line pt-12">
            <div className="rounded-lg border border-line bg-bg-soft p-8 text-center">
              <h3 className="font-display text-xl font-semibold text-ink">
                Ready to protect your fertilizer investment?
              </h3>
              <p className="mt-2 text-ink-soft">
                Start receiving real-time runoff risk alerts for your farm
                today.
              </p>
              <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <a
                  href="/signup"
                  className="rounded-md bg-ink px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2a2c1f]"
                >
                  Get Started
                </a>
                <a
                  href="/documentation"
                  className="rounded-md border border-line px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-bg-soft"
                >
                  View Documentation
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
