export default function PageHeader() {
  return (
    <section className="bg-bg pb-14 pt-16">
      <div className="wrap mx-auto max-w-wrap px-5">
        <span className="mb-4 inline-block rounded-sm bg-accent-soft px-3 py-1.5 font-mono text-[0.72rem] font-semibold uppercase tracking-wider text-accent">
          Pricing
        </span>
        <h1 className="max-w-[24ch] font-display text-[clamp(1.8rem,3.6vw,2.6rem)] font-semibold leading-[1.15] tracking-tight text-ink">
          Pay for what you measure.
        </h1>
        <p className="mt-5 max-w-[52ch] text-[1.02rem] text-ink-soft">
          Start free with full API access. Scale your plan as your farm network
          grows — no hidden fees, no per-seat pricing, no surprise bills.
        </p>
      </div>
    </section>
  );
}
