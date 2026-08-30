export default function WeatherDataPortal() {
  return (
    <section className="border-t border-line bg-bg-soft py-24">
      <div className="wrap mx-auto max-w-wrap px-5">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="mb-4 inline-block rounded-sm bg-accent-soft px-3 py-1.5 font-mono text-[0.72rem] font-semibold uppercase tracking-wider text-accent">
              Data Portal
            </span>
            <h2 className="mb-5 font-display text-[clamp(1.8rem,3.4vw,2.5rem)] font-semibold leading-[1.15] tracking-tight text-ink">
              Explore weather data without writing code.
            </h2>
            <p className="mb-5 max-w-[42ch] text-[1.02rem] text-ink-soft">
              The Weather Data Portal is designed for researchers, students,
              Data Analysts, and anyone who needs access to weather data without
              using the API. Browse stations, view current conditions, preview
              datasets, and download historical weather data in just a few
              clicks.
            </p>

            <ul className="mb-7 flex flex-col gap-2.5">
              {[
                "Browse all weather stations across the country",
                "View current conditions with live metric cards",
                "Preview datasets before downloading",
                "Export historical data in CSV or JSON format",
              ].map((item) => (
                <li
                  key={item}
                  className="relative pl-[22px] text-[0.88rem] text-ink-soft"
                >
                  <span className="absolute left-0 font-bold text-green">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-5">
              <a
                href="/data-portal"
                className="rounded-md bg-ink px-[26px] py-[14px] text-[0.95rem] font-medium tracking-wide text-white transition-colors hover:bg-[#2a2c1f]"
              >
                Visit Data Portal
              </a>
              <a
                href="/data-portal#export"
                className="rounded-md border border-line px-[22px] py-3 text-[0.92rem] font-medium transition-colors hover:border-ink-soft"
              >
                Export Data →
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-line bg-bg p-5 transition-shadow hover:shadow-md">
              <div className="flex items-center gap-3">
                <span className="text-xl">📤</span>
                <div>
                  <h4 className="font-display text-base font-semibold text-ink">
                    Export Historical Data
                  </h4>
                  <p className="text-sm text-ink-soft">
                    Select station, date range, and format
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                <span className="rounded-md border border-line px-3 py-1 text-xs text-ink-soft">
                  CSV
                </span>
                <span className="rounded-md border border-line px-3 py-1 text-xs text-ink-soft">
                  JSON
                </span>
                <span className="rounded-md border border-line px-3 py-1 text-xs text-ink-soft">
                  Date Range
                </span>
                <span className="rounded-md border border-line px-3 py-1 text-xs text-ink-soft">
                  Preview
                </span>
              </div>

              <div className="mt-4 rounded-md bg-ink p-4">
                <pre className="whitespace-pre-wrap break-words font-mono text-[0.65rem] leading-relaxed text-[#d7d8c8]">
                  <code>{`time,temperature,humidity,pressure,wind_speed,rain,heat_index
2026-07-28 07:00:00,17.3,78.5,852.3,0.6,0.0,17.8
2026-07-28 06:45:00,17.1,79.2,852.5,0.8,0.0,17.6
2026-07-28 06:30:00,16.8,80.1,852.8,0.5,0.0,17.2
2026-07-28 06:15:00,16.5,81.0,853.0,0.7,0.0,16.9
2026-07-28 06:00:00,16.2,81.8,853.2,0.9,0.0,16.5`}</code>
                </pre>
              </div>
              <p className="mt-2 text-[0.65rem] text-muted font-mono">
                CSV preview · 5 rows of 10,000 available
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
