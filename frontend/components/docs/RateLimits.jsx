export default function RateLimits() {
  return (
    <section
      id="rate-limits"
      className="scroll-mt-10 py-12 border-b border-line"
    >
      <h2 className="font-display text-3xl text-ink mb-4">Rate Limits</h2>
      <p className="text-ink-soft max-w-3xl mb-6">
        Every API key has usage limits to keep the network stable and ensure
        fair access for all developers. These are the defaults assigned to
        new keys — check{" "}
        <code className="font-mono text-xs bg-bg-soft px-1.5 py-0.5 rounded">
          GET /auth/api-usage/
        </code>{" "}
        for your key&apos;s exact numbers.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
        <div className="border border-line rounded-lg p-5 bg-bg-soft text-center">
          <p className="font-mono text-[10px] uppercase text-muted mb-1">
            Requests / Minute
          </p>
          <p className="font-display text-3xl text-ink">60</p>
        </div>
        <div className="border border-line rounded-lg p-5 bg-bg-soft text-center">
          <p className="font-mono text-[10px] uppercase text-muted mb-1">
            Daily Quota
          </p>
          <p className="font-display text-3xl text-ink">10,000</p>
        </div>
      </div>
      <ul className="mt-6 space-y-1.5 text-sm text-ink-soft">
        <li className="flex items-start gap-3">
          <span className="text-accent mt-1">·</span>
          Exceeding either limit returns a{" "}
          <code className="font-mono text-ink">401 Unauthorized</code> with a
          message of <code className="font-mono text-ink">
            &quot;Rate limit exceeded (per minute)&quot;
          </code>{" "}
          or <code className="font-mono text-ink">
            &quot;Daily quota exceeded&quot;
          </code>
          .
        </li>
        <li className="flex items-start gap-3">
          <span className="text-accent mt-1">·</span>
          Rate limits are tracked per API key, not per account — separate
          keys have independent limits.
        </li>
        <li className="flex items-start gap-3">
          <span className="text-accent mt-1">·</span>
          Cache responses where appropriate to stay within your limits.
        </li>
      </ul>
    </section>
  );
}
