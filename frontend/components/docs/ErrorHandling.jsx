export default function ErrorHandling({ errorCodes, commonErrors }) {
  return (
    <section id="errors" className="scroll-mt-10 py-12 border-b border-line">
      <h2 className="font-display text-3xl text-ink mb-6">Error Handling</h2>

      <h3 className="font-mono text-xs uppercase tracking-wide text-muted mb-3">
        HTTP Status Codes
      </h3>
      <div className="bg-bg-soft rounded-lg border border-line overflow-hidden mb-8">
        <div className="divide-y divide-line">
          {errorCodes.map(([code, label, desc]) => (
            <div
              key={code}
              className="flex gap-6 px-4 py-3 items-center hover:bg-bg/50 transition-colors"
            >
              <span
                className={`font-mono text-sm font-semibold w-10 shrink-0 ${
                  code.startsWith("2")
                    ? "text-green"
                    : code.startsWith("4")
                      ? "text-accent"
                      : "text-red"
                }`}
              >
                {code}
              </span>
              <span className="text-sm text-ink w-40 shrink-0">{label}</span>
              <span className="text-sm text-ink-soft">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      <h3 className="font-mono text-xs uppercase tracking-wide text-muted mb-3">
        Common API Errors
      </h3>
      <div className="bg-bg-soft rounded-lg border border-line overflow-hidden">
        <div className="divide-y divide-line">
          {commonErrors.map(([name, code, desc]) => (
            <div
              key={name}
              className="flex gap-4 px-4 py-3 items-center hover:bg-bg/50 transition-colors"
            >
              <span className="font-mono text-xs bg-ink text-white rounded px-2 py-0.5 w-10 text-center shrink-0">
                {code}
              </span>
              <span className="text-sm text-ink w-48 shrink-0 font-medium">
                {name}
              </span>
              <span className="text-sm text-ink-soft">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
