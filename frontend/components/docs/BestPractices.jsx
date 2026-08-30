export default function BestPractices({ bestPractices }) {
  return (
    <section
      id="best-practices"
      className="scroll-mt-10 py-12 border-b border-line"
    >
      <h2 className="font-display text-3xl text-ink mb-6">Best Practices</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {bestPractices.map((p, i) => (
          <div
            key={i}
            className="flex items-start gap-3 bg-bg-soft border border-line rounded-lg px-4 py-3"
          >
            <span className="text-green text-lg mt-0.5">✓</span>
            <span className="text-sm text-ink-soft">{p}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
