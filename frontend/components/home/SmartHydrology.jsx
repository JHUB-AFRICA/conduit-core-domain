export default function SmartHydrology() {
  return (
    <section className="border-t border-line bg-bg-soft py-24">
      <div className="wrap grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <div className="mb-4.5 text-[1.6rem]">💧</div>
          <a href="/alerts#hydrology" className="group inline-block">
            <h2 className="mb-4.5 font-display text-[clamp(1.5rem,2.6vw,1.9rem)] font-semibold leading-snug text-ink underline decoration-line decoration-2 underline-offset-4 transition-colors group-hover:text-accent group-hover:decoration-accent">
              Smart Hydrology &amp; Fertilizer Safety API
            </h2>
          </a>
          <p className="mb-5.5 max-w-[42ch] text-[0.98rem] text-ink-soft">
            Our hydrology model scores localized runoff risk in real time from
            rainfall totals and barometric pressure trend. Don&apos;t waste
            fertilizer on a field that&apos;s about to be washed out.
          </p>
          <ul className="flex flex-col gap-2.5">
            {[
              "6-hour rolling rainfall window",
              "Dual rain-gauge cross-check",
              "0–100 score across four risk tiers",
            ].map((item) => (
              <li
                key={item}
                className="relative pl-[22px] text-[0.88rem] text-ink-soft"
              >
                <span className="absolute left-0 font-bold text-green">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <a
            href="/alerts/smart-hydrology"
            className="mt-6 inline-flex items-center gap-1.5 text-[0.88rem] font-medium text-accent hover:underline"
          >
            View hydrology alerts &rarr;
          </a>
        </div>

        <div className="rounded-lg border border-card-line bg-card px-[22px] py-4">
          <div className="mb-3.5 flex justify-between border-b border-card-line pb-3.5 font-mono text-[0.68rem] tracking-wide text-[#9a9c8a]">
            RESPONSE 200 OK
          </div>
          <pre className="whitespace-pre-wrap break-words font-mono text-[0.8rem] leading-relaxed text-[#d7d8c8]">
            <code>{`{
  "station_name": "Site JKUAT",
  "severity": "high",
  "runoff_risk_score": 68,
  "recommendation": "Delay fertilizer application",
  "rainfall_summary": {
    "effective_rainfall_mm": 24.5,
    "window_hours": 6
  },
  "pressure_trend": "falling"
}`}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
