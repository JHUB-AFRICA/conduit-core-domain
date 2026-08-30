export default function PricingCards() {
  const tiers = [
    {
      name: "Developer",
      price: "$0",
      period: "/month",
      description:
        "Perfect for testing, prototyping, and small-scale deployment.",
      cta: "Start free",
      ctaClass: "border border-line bg-white hover:bg-bg-soft",
      popular: false,
      features: [
        "1,000 API requests / month",
        "1 weather station",
        "48-hour risk horizon",
        "Hydrology & livestock alerts",
        "Email support",
      ],
    },
    {
      name: "Pro",
      price: "$49",
      period: "/month",
      description:
        "For active farmers and small cooperatives with multiple sites.",
      cta: "Get started",
      ctaClass: "bg-ink text-white hover:bg-[#2a2c1f]",
      popular: true,
      features: [
        "50,000 API requests / month",
        "Up to 10 weather stations",
        "48-hour risk horizon",
        "Hydrology & livestock alerts",
        "Webhook support",
        "Slack community",
        "Email + priority support",
      ],
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description:
        "For large-scale operations, cooperatives, and research institutions.",
      cta: "Contact sales",
      ctaClass: "border border-line bg-white hover:bg-bg-soft",
      popular: false,
      features: [
        "Unlimited API requests",
        "Unlimited weather stations",
        "Custom risk models",
        "Dedicated success manager",
        "SLA guarantee (99.99%)",
        "On-premise deployment options",
        "24/7 phone + priority support",
      ],
    },
  ];

  return (
    <section className="border-t border-line bg-bg-soft py-20">
      <div className="wrap mx-auto max-w-wrap px-5">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-lg border ${tier.popular ? "border-2 border-accent" : "border-line"} bg-bg px-7 py-9 transition-all hover:shadow-lg`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-block rounded-full bg-accent px-4 py-0.5 font-mono text-[0.6rem] font-semibold uppercase tracking-wider text-white">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-4">
                <span className="inline-block rounded-sm bg-accent-soft px-3 py-1 font-mono text-[0.6rem] font-semibold uppercase tracking-wider text-accent">
                  {tier.name}
                </span>
              </div>
              <div className="mb-1.5 flex items-baseline gap-1">
                <span className="font-display text-[2.6rem] font-semibold text-ink">
                  {tier.price}
                </span>
                {tier.period && (
                  <span className="text-[0.95rem] text-muted">
                    {tier.period}
                  </span>
                )}
              </div>
              <p className="mb-6 text-[0.88rem] text-ink-soft">
                {tier.description}
              </p>
              <a
                href="#signup"
                className={`mb-7 block rounded-md px-4 py-3 text-center text-[0.92rem] font-medium transition-colors ${tier.ctaClass}`}
              >
                {tier.cta}
              </a>
              <ul className="flex flex-col gap-3">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="relative pl-[22px] text-[0.85rem] text-ink-soft"
                  >
                    <span className="absolute left-0 font-bold text-green">
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-[0.82rem] text-muted">
          All plans include access to both the Hydrology &amp; Fertilizer Safety
          API and the Livestock Thermal Comfort Alert System.
        </p>
      </div>
    </section>
  );
}
