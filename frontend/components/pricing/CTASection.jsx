export default function CTASection() {
  return (
    <section className="border-t border-line bg-[#e8e4d8] py-[100px]">
      <div className="wrap mx-auto max-w-wrap px-5">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
            💳 Start Free
          </div>
          <h2 className="mb-4 font-display text-[clamp(1.8rem,3.4vw,2.5rem)] font-semibold leading-[1.15] tracking-tight text-ink">
            Start reading the weather in five minutes.
          </h2>
          <p className="mx-auto mb-8 max-w-[42ch] text-[1.02rem] text-ink-soft">
            Join hundreds of farmers and agritech developers already using
            Conduit. No credit card required to start.
          </p>

          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <a
                href="#signup"
                className="rounded-md bg-ink px-8 py-4 text-[1rem] font-medium tracking-wide text-white transition-colors hover:bg-[#2a2c1f]"
              >
                Create your account
              </a>
              <a
                href="#pricing"
                className="rounded-md border border-line bg-bg px-8 py-4 text-[1rem] font-medium text-ink transition-colors hover:bg-bg-soft"
              >
                View all plans
              </a>
            </div>
            <div className="flex items-center gap-2 text-[0.85rem] text-muted">
              <span className="text-green">✓</span>
              No credit card required for developer tier
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
