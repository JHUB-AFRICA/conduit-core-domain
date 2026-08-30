export default function FAQ({ faq }) {
  return (
    <section id="faq" className="scroll-mt-10 py-12 border-b border-line">
      <h2 className="font-display text-3xl text-ink mb-6">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3 border-t border-line pt-4">
        {faq.map(([q, a]) => (
          <details key={q} className="group border-b border-line pb-3">
            <summary className="flex justify-between items-center cursor-pointer text-ink font-medium text-sm py-2 list-none hover:text-accent transition-colors">
              {q}
              <span className="text-muted group-open:rotate-45 transition-transform text-xl">
                +
              </span>
            </summary>
            <p className="text-sm text-ink-soft mt-2 max-w-3xl pb-2">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
