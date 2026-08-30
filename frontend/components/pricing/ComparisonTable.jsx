export default function ComparisonTable() {
  const features = [
    ["API requests / month", "1,000", "50,000", "Unlimited"],
    ["Weather stations", "1", "10", "Unlimited"],
    ["Risk horizon", "48 hours", "48 hours", "Custom"],
    ["Hydrology API", "✓", "✓", "✓"],
    ["Livestock alerts", "✓", "✓", "✓"],
    ["Webhooks", "—", "✓", "✓"],
    ["Custom risk models", "—", "—", "✓"],
    ["Dedicated support", "—", "—", "✓"],
    ["SLA guarantee", "—", "—", "99.99%"],
  ];

  return (
    <section className="border-t border-line bg-bg py-20">
      <div className="wrap mx-auto max-w-wrap px-5">
        <div className="mb-12 text-center">
          <h2 className="font-display text-[clamp(1.5rem,2.6vw,1.9rem)] font-semibold text-ink">
            Compare plans
          </h2>
          <p className="mt-3 text-[0.98rem] text-ink-soft">
            Everything you need to make the right choice for your operation.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-line">
                <th className="p-4 text-left font-body text-[0.78rem] font-semibold uppercase tracking-wider text-muted">
                  Feature
                </th>
                <th className="p-4 text-center font-body text-[0.78rem] font-semibold uppercase tracking-wider text-muted">
                  Developer
                </th>
                <th className="p-4 text-center font-body text-[0.78rem] font-semibold uppercase tracking-wider text-accent">
                  Pro
                </th>
                <th className="p-4 text-center font-body text-[0.78rem] font-semibold uppercase tracking-wider text-muted">
                  Enterprise
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map(([feature, dev, pro, ent]) => (
                <tr key={feature} className="border-b border-line">
                  <td className="p-4 text-[0.88rem] font-medium text-ink">
                    {feature}
                  </td>
                  <td className="p-4 text-center text-[0.88rem] text-ink-soft">
                    {dev}
                  </td>
                  <td className="p-4 text-center text-[0.88rem] font-medium text-ink">
                    {pro}
                  </td>
                  <td className="p-4 text-center text-[0.88rem] text-ink-soft">
                    {ent}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
