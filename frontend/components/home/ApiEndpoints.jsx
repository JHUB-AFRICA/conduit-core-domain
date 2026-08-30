import ENDPOINTS from "../../data/endpoints";

export default function ApiEndpoints() {
  return (
    <section id="docs" className="border-t border-line bg-bg py-24">
      <div className="wrap">
        <span className="mb-3.5 inline-block rounded-sm bg-red-50 px-3 py-1.5 font-mono text-[0.72rem] font-semibold uppercase tracking-wider text-red-600">
          Developer-First Weather API
        </span>
        <h2 className="mb-11 font-display text-[clamp(1.7rem,3vw,2.3rem)] font-semibold tracking-tight">
          Secure, scalable, and easy-to-integrate weather data for modern
          applications.
        </h2>

        <div className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {ENDPOINTS.map((e) => (
            <div key={e.path} className="bg-bg px-[26px] py-[30px]">
              <div className="mb-4.5 flex items-center gap-2.5">
                <span
                  className={`rounded-sm px-2 py-[3px] font-mono text-[0.68rem] font-semibold ${
                    e.method === "POST"
                      ? "bg-accent-soft text-accent"
                      : "bg-green-bg text-green"
                  }`}
                >
                  {e.method}
                </span>
                <code className="break-all font-mono text-[0.76rem] text-muted">
                  {e.path}
                </code>
              </div>
              <h3 className="mb-2 font-display text-[1.05rem] font-semibold">
                {e.title}
              </h3>
              <p className="text-[0.88rem] leading-relaxed text-ink-soft">
                {e.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
