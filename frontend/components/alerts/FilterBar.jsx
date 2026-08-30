export default function FilterBar({ filters, stations, onChange }) {
  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border border-line bg-bg-soft p-4">
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[0.68rem] uppercase tracking-wider text-muted">
          Type
        </label>
        <select
          value={filters.type}
          onChange={(e) => onChange({ ...filters, type: e.target.value })}
          className="rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="">All types</option>
          <option value="hydrology">Hydrology</option>
          <option value="livestock">Livestock</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[0.68rem] uppercase tracking-wider text-muted">
          Station
        </label>
        <select
          value={filters.station}
          onChange={(e) => onChange({ ...filters, station: e.target.value })}
          className="rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="">All stations</option>
          {stations.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.site_name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[0.68rem] uppercase tracking-wider text-muted">
          Status
        </label>
        <select
          value={filters.active}
          onChange={(e) => onChange({ ...filters, active: e.target.value })}
          className="rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="">All</option>
          <option value="true">Active only</option>
          <option value="false">Resolved only</option>
        </select>
      </div>

      {(filters.type || filters.station || filters.active) && (
        <button
          onClick={() => onChange({ type: "", station: "", active: "" })}
          className="rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-bg-soft hover:text-ink"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
