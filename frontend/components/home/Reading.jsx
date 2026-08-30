export default function Reading({ label, value }) {
  return (
    <div>
      <div className="mb-1.5 font-mono text-[0.68rem] uppercase tracking-wide text-muted">
        {label}
      </div>
      <div className="font-mono text-[1.05rem] font-medium text-ink">
        {value}
      </div>
    </div>
  );
}
