export default function GetStarted() {
  return (
    <section className="border-t border-line bg-[#e8e4d8] py-24">
      <div className="wrap mx-auto max-w-wrap px-5">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="mb-4 inline-block rounded-sm bg-accent-soft px-3 py-1.5 font-mono text-[0.72rem] font-semibold uppercase tracking-wider text-accent">
              Get Started
            </span>
            <h2 className="mb-5 font-display text-[clamp(1.8rem,3.4vw,2.5rem)] font-semibold leading-[1.15] tracking-tight text-ink">
              Start reading the weather in five minutes.
            </h2>
            <p className="mb-7 max-w-[42ch] text-[1.02rem] text-ink-soft">
              Join hundreds of farmers and agritech developers already using
              Conduit to make data-driven decisions. No credit card required to
              start.
            </p>

            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <a
                href="/auth/sign-up"
                className="rounded-md bg-ink px-[26px] py-[14px] text-[0.95rem] font-medium tracking-wide text-white transition-colors hover:bg-[#2a2c1f]"
              >
                Create your account
              </a>
              <a
                href="/documentation"
                className="rounded-md border border-line px-[22px] py-3 text-[0.92rem] font-medium transition-colors hover:border-ink-soft"
              >
                View documentation
              </a>
            </div>
            <p className="mt-4 text-[0.82rem] text-muted">
              ✨ Free developer tier included • No credit card required
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-line bg-bg px-6 py-5 transition-shadow hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="text-[1.8rem]">🔑</div>
                <div>
                  <h3 className="font-body text-[0.95rem] font-semibold text-ink">
                    Get your free API key
                  </h3>
                  <p className="mt-1 text-[0.85rem] text-ink-soft">
                    Instant access to all endpoints. No credit card required for
                    the developer tier. Start building immediately.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-line bg-bg px-6 py-5 transition-shadow hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="text-[1.8rem]">📚</div>
                <div>
                  <h3 className="font-body text-[0.95rem] font-semibold text-ink">
                    Comprehensive documentation
                  </h3>
                  <p className="mt-1 text-[0.85rem] text-ink-soft">
                    Full API reference, quick start guides, example requests,
                    and best practices to get you up to speed quickly.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-line bg-bg px-6 py-5 transition-shadow hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="text-[1.8rem]">📊</div>
                <div>
                  <h3 className="font-body text-[0.95rem] font-semibold text-ink">
                    Weather Data Portal
                  </h3>
                  <p className="mt-1 text-[0.85rem] text-ink-soft">
                    Access weather data without writing code. Browse stations,
                    preview datasets, and export historical data in CSV or JSON
                    format — designed for researchers and non-technical users.
                  </p>
                  <a
                    href="/data-portal"
                    className="mt-2 inline-block text-sm text-accent hover:underline"
                  >
                    Visit Data Portal →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
