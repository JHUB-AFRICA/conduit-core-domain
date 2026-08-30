export default function AlertsIntro() {
  return (
    <section className="border-t border-line bg-bg py-16">
      <div className="wrap mx-auto max-w-wrap px-5">
        <div className="max-w-3xl">
          <span className="mb-4 inline-block rounded-sm bg-accent-soft px-3 py-1.5 font-mono text-[0.72rem] font-semibold uppercase tracking-wider text-accent">
            Smart Alert Systems
          </span>
          <h2 className="font-display text-[clamp(1.8rem,3.4vw,2.5rem)] font-semibold leading-[1.15] tracking-tight text-ink">
            Two risk systems, one live feed.
          </h2>
          <p className="mt-4 max-w-[52ch] text-[1.02rem] text-ink-soft">
            Every alert Conduit fires is derived from the same instrument
            telemetry that powers the rest of the API — no separate data source,
            no drift between what you read and what you&apos;re warned about.
          </p>
        </div>
      </div>
    </section>
  );
}
