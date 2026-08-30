export const metadata = {
  title: "Smart Hydrology & Fertilizer Safety API — Conduit",
  description:
    "Predictive runoff risk scores using real-time rainfall and barometric pressure data for fertilizer safety.",
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

function TrendingDownIcon({ className }) {
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
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  );
}

function CloudLightningIcon({ className }) {
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
      <path d="M6 16.326A7 7 0 1 1 15.71 9h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="m13 12-3 5h4l-3 5" />
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
              Predictive Agriculture API
            </span>
            <h1 className="font-display text-4xl font-semibold text-ink leading-tight">
              Smart Hydrology &amp; Fertilizer Safety API
            </h1>
            <p className="mt-4 text-lg text-ink-soft max-w-3xl">
              Predict fertilizer runoff risk using real-time rainfall and
              barometric pressure data.
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
              This system predicts fertilizer runoff risk using real-time
              rainfall and barometric pressure data to protect smallholder
              farmers from financial loss caused by heavy storms.
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
                Farmers lose fertilizer due to unexpected rainfall shortly after
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
                A predictive hydrology API that evaluates rainfall and
                atmospheric pressure trends to generate real-time runoff risk
                scores.
              </p>
              <div className="mt-4 rounded-md bg-white/50 p-3">
                <p className="flex items-center gap-2 text-sm font-medium text-green-700">
                  <TargetIcon className="h-4 w-4 shrink-0" />
                  Predictive • Real-time • Actionable
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
                  Hydrology Sensors
                </h4>
                <ul className="space-y-2 text-sm text-ink-soft">
                  <li className="flex items-start gap-2">
                    <span className="text-accent">•</span>
                    <span>
                      <strong className="text-ink">Rain Gauge A</strong> —
                      instant rainfall rate
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent">•</span>
                    <span>
                      <strong className="text-ink">Rain Gauge B</strong> — daily
                      accumulation
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
                      — hPa
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* ============================================ */}
          {/* DETECTION LOGIC */}
          {/* ============================================ */}
          <section className="mb-12">
            <h2 className="mb-4 font-display text-2xl font-semibold text-ink">
              Detection Logic
            </h2>
            <div className="rounded-lg border border-line bg-bg-soft p-6">
              <p className="mb-4 text-ink-soft">
                The system identifies the following patterns:
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-md bg-bg border border-line px-4 py-3 text-center">
                  <CloudRainIcon className="mx-auto mb-1 h-6 w-6 text-accent" />
                  <p className="text-sm font-medium text-ink">Rainfall Onset</p>
                  <p className="text-xs text-ink-soft">
                    Detection of initial rainfall
                  </p>
                </div>
                <div className="rounded-md bg-bg border border-line px-4 py-3 text-center">
                  <TrendingDownIcon className="mx-auto mb-1 h-6 w-6 text-accent" />
                  <p className="text-sm font-medium text-ink">
                    Rapid Pressure Drops
                  </p>
                  <p className="text-xs text-ink-soft">
                    Atmospheric pressure decline
                  </p>
                </div>
                <div className="rounded-md bg-bg border border-line px-4 py-3 text-center">
                  <CloudLightningIcon className="mx-auto mb-1 h-6 w-6 text-accent" />
                  <p className="text-sm font-medium text-ink">
                    Storm Formation
                  </p>
                  <p className="text-xs text-ink-soft">
                    Weather pattern analysis
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================ */}
          {/* PREDICTIVE MODEL */}
          {/* ============================================ */}
          <section className="mb-12">
            <h2 className="mb-4 font-display text-2xl font-semibold text-ink">
              Predictive Model
            </h2>
            <div className="rounded-lg border border-line bg-bg p-6">
              <p className="mb-4 text-ink-soft">
                The API computes a runoff risk score (0–100) using:
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-md bg-bg-soft border border-line px-4 py-3">
                  <p className="text-xs text-muted">Factor 1</p>
                  <p className="text-sm font-semibold text-ink">
                    Rainfall Intensity
                  </p>
                  <p className="text-xs text-ink-soft">Rate of precipitation</p>
                </div>
                <div className="rounded-md bg-bg-soft border border-line px-4 py-3">
                  <p className="text-xs text-muted">Factor 2</p>
                  <p className="text-sm font-semibold text-ink">
                    Rolling Precipitation Trends
                  </p>
                  <p className="text-xs text-ink-soft">
                    Historical rain patterns
                  </p>
                </div>
                <div className="rounded-md bg-bg-soft border border-line px-4 py-3">
                  <p className="text-xs text-muted">Factor 3</p>
                  <p className="text-sm font-semibold text-ink">
                    Barometric Pressure Drop Rate
                  </p>
                  <p className="text-xs text-ink-soft">
                    Threshold: &gt;2 hPa/hour
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================ */}
          {/* OUTPUT LAYER */}
          {/* ============================================ */}
          <section className="mb-12">
            <h2 className="mb-4 font-display text-2xl font-semibold text-ink">
              Output Layer
            </h2>
            <div className="rounded-lg border border-line bg-bg p-6">
              <div className="mb-4">
                <p className="text-sm text-muted">Endpoint</p>
                <code className="block rounded-md bg-bg-soft px-3 py-2 font-mono text-sm text-accent border border-line mt-1">
                  /V1/AGRI/HYDROLOGY/RUNOFF-PREDICTION
                </code>
              </div>
              <div>
                <p className="text-sm text-muted mb-2">Response Includes</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="rounded-md border border-line px-4 py-2 text-center">
                    <p className="text-xs text-muted">Score</p>
                    <p className="text-sm font-semibold text-ink">
                      Runoff Risk (0–100)
                    </p>
                  </div>
                  <div className="rounded-md border border-line px-4 py-2 text-center">
                    <p className="text-xs text-muted">Likelihood</p>
                    <p className="text-sm font-semibold text-ink">
                      Storm Likelihood
                    </p>
                  </div>
                  <div className="rounded-md border border-line px-4 py-2 text-center">
                    <p className="text-xs text-muted">Recommendation</p>
                    <p className="text-sm font-semibold text-ink">
                      Apply / Delay Fertilizer
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
                <span>GET /V1/AGRI/HYDROLOGY/RUNOFF-PREDICTION</span>
                <span className="text-accent">● LIVE</span>
              </div>
              <pre className="whitespace-pre-wrap break-words font-mono text-[0.8rem] leading-relaxed text-[#d7d8c8]">
                <code>{`{
  "location": "Mola_Ridge_04",
  "prediction": {
    "runoff_risk_score": 82,
    "storm_likelihood": "HIGH",
    "confidence_interval": 0.05,
    "recommendation": "DELAY_APPLICATION",
    "risk_factors": ["imminent_heavy_rain", "high_soil_saturation"]
  },
  "inputs": {
    "rainfall_rate_mmh": 12.4,
    "pressure_drop_hpa": 3.1,
    "soil_moisture_pct": 78
  },
  "timestamp": "2026-07-09T14:20:11Z"
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
                  Ingestion Layer
                </span>
                <span className="text-muted">→</span>
                <span className="whitespace-nowrap font-medium text-ink">
                  Time-Series Analysis
                </span>
                <span className="text-muted">→</span>
                <span className="whitespace-nowrap font-medium text-ink">
                  Prediction Engine
                </span>
                <span className="text-muted">→</span>
                <span className="whitespace-nowrap font-medium text-ink">
                  API
                </span>
                <span className="text-muted">→</span>
                <span className="whitespace-nowrap font-medium text-ink">
                  Farmers
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
                The system transforms raw hydrological data into
                <strong className="text-ink">
                  {" "}
                  actionable agricultural decision intelligence
                </strong>
                , preventing financial loss through predictive storm analysis.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-bg px-4 py-1.5 text-sm text-green">
                  <CheckIcon className="h-3.5 w-3.5" />
                  Predictive
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
                  This is not a weather API
                </p>
                <p className="flex items-center justify-center gap-2 text-lg font-bold text-ink">
                  <ArrowRightIcon className="h-5 w-5 shrink-0" />
                  This is a{" "}
                  <span className="text-red-600">
                    financial risk prediction system
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
                Start receiving real-time runoff risk predictions for your farm
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
