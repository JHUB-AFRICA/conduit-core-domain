export default function MethodPill({ method }) {
  const colors = {
    GET: "bg-green-bg text-green",
    POST: "bg-accent-soft text-accent",
    PUT: "bg-blue-100 text-blue-600",
    DELETE: "bg-red-100 text-red-600",
    PATCH: "bg-orange-100 text-orange-600",
  };

  return (
    <span
      className={`
        font-mono text-[0.65rem] font-bold uppercase tracking-wider
        px-2.5 py-1 rounded-md
        ${colors[method] || "bg-bg-soft text-ink-soft"}
      `}
    >
      {method}
    </span>
  );
}
