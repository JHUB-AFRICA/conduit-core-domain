export default function FilteringPagination() {
  return (
    <section id="filtering" className="scroll-mt-10 py-12 border-b border-line">
      <h2 className="font-display text-3xl text-ink mb-6">
        Filtering &amp; Pagination
      </h2>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="border border-line rounded-lg p-5 bg-bg-soft">
          <h3 className="font-mono text-xs uppercase text-accent mb-3">
            Filtering
          </h3>
          <p className="text-sm text-ink-soft mb-3">
            Filtering behaves differently depending on the endpoint.
          </p>
          <div className="space-y-2">
            <div className="bg-bg rounded border border-line p-3">
              <code className="font-mono text-xs text-ink">/timeline/</code>
              <ul className="mt-2 space-y-1 text-sm text-ink-soft">
                <li>
                  <code className="font-mono text-ink">resolution</code> —
                  minutely, hourly, or daily
                </li>
                <li>
                  <code className="font-mono text-ink">start</code> — window
                  start
                </li>
                <li>
                  <code className="font-mono text-ink">end</code> — window end
                </li>
              </ul>
            </div>
            <div className="bg-bg rounded border border-line p-3">
              <code className="font-mono text-xs text-ink">/history/</code>
              <ul className="mt-2 space-y-1 text-sm text-ink-soft">
                <li>
                  <code className="font-mono text-ink">start_date</code> —
                  earliest date
                </li>
                <li>
                  <code className="font-mono text-ink">end_date</code> — latest
                  date
                </li>
                <li>
                  <code className="font-mono text-ink">page_size</code> —
                  results per page (default 100, max 1000)
                </li>
              </ul>
            </div>
            <div className="bg-bg rounded border border-line p-3">
              <code className="font-mono text-xs text-ink">/alerts/</code>
              <ul className="mt-2 space-y-1 text-sm text-ink-soft">
                <li>
                  <code className="font-mono text-ink">type</code> —
                  hydrology or livestock
                </li>
                <li>
                  <code className="font-mono text-ink">station</code> —
                  station slug
                </li>
                <li>
                  <code className="font-mono text-ink">active</code> — true
                  or false
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border border-line rounded-lg p-5 bg-bg-soft">
          <h3 className="font-mono text-xs uppercase text-accent mb-3">
            Pagination
          </h3>
          <p className="text-sm text-ink-soft mb-3">
            Historical observations are paginated. Each page includes:
          </p>
          <div className="bg-bg rounded border border-line divide-y divide-line">
            {[
              ["count", "Total number of matching records"],
              ["next", "URL of the next page, or null"],
              ["previous", "URL of the previous page, or null"],
              ["results", "Array of observations for this page"],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-4 px-3 py-2">
                <span className="font-mono text-sm text-ink w-20 shrink-0">
                  {k}
                </span>
                <span className="text-sm text-ink-soft">{v}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-soft mt-3">
            Follow the <code className="font-mono text-ink">next</code> URL
            until it returns <code className="font-mono text-ink">null</code>.
          </p>
        </div>
      </div>
    </section>
  );
}
