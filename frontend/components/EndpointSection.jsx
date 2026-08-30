import MethodPill from "./MethodPill";
import CodePanel from "./CodePanel";

export default function EndpointSection({ ep }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MethodPill method={ep.method} />
        <code className="font-mono text-sm text-ink bg-bg-soft px-3 py-1 rounded border border-line">
          {ep.path}
        </code>
      </div>

      <h3 className="font-display text-2xl text-ink">{ep.title}</h3>
      <p className="text-ink-soft max-w-3xl">{ep.desc}</p>

      {ep.params && ep.params.length > 0 && (
        <div className="bg-bg-soft rounded-lg border border-line overflow-hidden max-w-3xl">
          <div className="px-4 py-2 bg-bg border-b border-line">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
              Parameters
            </span>
          </div>

          <div className="divide-y divide-line">
            {ep.params.map((p) => (
              <div key={p.name} className="flex gap-6 px-4 py-3">
                <span className="font-mono text-sm text-ink w-32 shrink-0">
                  {p.name}
                </span>

                <span className="text-sm text-ink-soft w-24 shrink-0">
                  {p.type}
                </span>

                <span className="text-sm text-ink-soft">{p.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {ep.response && (
        <div className="max-w-3xl">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted mb-2">
            Response
          </p>
          <CodePanel>{ep.response}</CodePanel>
        </div>
      )}
    </div>
  );
}
