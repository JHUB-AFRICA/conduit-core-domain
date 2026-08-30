export default function PageHeader() {
  return (
    <section className="bg-bg pb-14 pt-16">
      <div className="wrap mx-auto max-w-wrap px-5">
        <span className="mb-4 inline-block rounded-sm bg-accent-soft px-3 py-1.5 font-mono text-[0.72rem] font-semibold uppercase tracking-wider text-accent">
          Alerts &amp; Webhooks
        </span>
        <h1 className="max-w-[26ch] font-display text-[clamp(1.8rem,3.6vw,2.6rem)] font-semibold leading-[1.15] tracking-tight text-ink">
          Two risk systems, one live feed.
        </h1>
        <p className="mt-5 max-w-[52ch] text-[1.02rem] text-ink-soft">
          Every alert Conduit fires is derived from the same instrument
          telemetry that powers the rest of the API — no separate data source,
          no drift between what you read and what you&apos;re warned about.
        </p>
      </div>
    </section>
  );
}
