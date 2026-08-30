export default function FAQ() {
  const faqs = [
    {
      q: "Can I upgrade or downgrade my plan at any time?",
      a: "Yes. You can change your plan at any time from your dashboard. Upgrades take effect immediately; downgrades take effect at the start of the next billing cycle.",
    },
    {
      q: "What happens if I exceed my API request limit?",
      a: "We'll notify you when you reach 80% and 100% of your limit. Exceeding requests will be throttled until the next billing cycle, or you can upgrade to a higher plan.",
    },
    {
      q: "Do you offer discounts for non-profits or research?",
      a: "Yes. We offer a 50% discount for registered non-profits and academic research institutions. Contact our team with your documentation for approval.",
    },
    {
      q: "Is there a long-term contract?",
      a: "No. All plans are month-to-month with no lock-in. Enterprise plans can opt for annual billing with a 15% discount.",
    },
    {
      q: "What data sources do you integrate with?",
      a: "Conduit works with any IoT weather station that supports HTTP/HTTPS telemetry. We provide SDKs for Davis, Campbell Scientific, and custom sensors.",
    },
    {
      q: "Is my data private and secure?",
      a: "Absolutely. All data is encrypted in transit and at rest. We never share or sell your farm data. Enterprise plans include private cloud deployment options.",
    },
  ];

  return (
    <section className="border-t border-line bg-bg-soft py-20">
      <div className="wrap mx-auto max-w-wrap px-5">
        <div className="mb-12 text-center">
          <h2 className="font-display text-[clamp(1.5rem,2.6vw,1.9rem)] font-semibold text-ink">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-[0.98rem] text-ink-soft">
            Everything you need to know about pricing and getting started.
          </p>
        </div>

        <div className="mx-auto max-w-3xl space-y-6">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group rounded-lg border border-line bg-bg px-6 py-4 transition-all hover:border-accent"
            >
              <summary className="flex cursor-pointer items-center justify-between font-body text-[0.95rem] font-medium text-ink hover:text-accent">
                {faq.q}
                <span className="ml-4 text-ink-soft transition-transform group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <p className="mt-4 border-t border-line pt-4 text-[0.9rem] text-ink-soft">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
