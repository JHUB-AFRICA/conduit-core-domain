export default function DataModel({ dataModel }) {
  return (
    <section
      id="data-model"
      className="scroll-mt-10 py-12 border-b border-line"
    >
      <h2 className="font-display text-3xl text-ink mb-2">
        Weather Data Model
      </h2>
      <p className="text-ink-soft max-w-3xl mb-8">
        Every measurement returned by the API, grouped by category.
      </p>
      <div className="space-y-6">
        {dataModel.map((g) => (
          <div
            key={g.group}
            className="bg-bg-soft rounded-lg border border-line overflow-hidden"
          >
            <div className="px-4 py-2 bg-bg border-b border-line">
              <h3 className="font-mono text-xs uppercase tracking-wide text-accent">
                {g.group}
              </h3>
            </div>
            <div className="divide-y divide-line">
              {g.fields.map(([name, desc]) => (
                <div
                  key={name}
                  className="flex gap-6 px-4 py-3 hover:bg-bg/50 transition-colors"
                >
                  <span className="font-mono text-sm text-ink w-48 shrink-0">
                    {name}
                  </span>
                  <span className="text-sm text-ink-soft">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
