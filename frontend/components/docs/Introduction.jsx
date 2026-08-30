export default function Introduction() {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

  return (
    <section
      id="introduction"
      className="scroll-mt-10 pb-12 border-b border-line bg-bg"
    >
      <p className="font-mono text-xs uppercase tracking-wider text-accent mb-3">
        API Reference · v1.0
      </p>
      <h1 className="font-display text-5xl text-ink mb-5 leading-tight">
        Conduit Live Weather API
      </h1>
      <p className="text-ink-soft max-w-3xl mb-6 text-lg">
        A RESTful API providing secure access to real-time and historical
        weather observations collected from IoT weather stations across the
        country.
      </p>
      <div className="flex flex-wrap gap-3 mb-8">
        <span className="px-4 py-2 rounded-lg bg-bg-soft text-ink-soft font-mono text-xs border border-line">
          Base URL: {baseUrl}
        </span>
        <span className="px-4 py-2 rounded-lg bg-bg-soft text-ink-soft font-mono text-xs border border-line">
          Format: JSON
        </span>
        <span className="px-4 py-2 rounded-lg bg-bg-soft text-ink-soft font-mono text-xs border border-line">
          Units: Metric
        </span>
        <span className="px-4 py-2 rounded-lg bg-bg-soft text-ink-soft font-mono text-xs border border-line">
          Timestamps: ISO 8601 UTC
        </span>
      </div>
    </section>
  );
}
