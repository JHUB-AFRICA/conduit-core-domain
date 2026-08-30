export default function TagFilter({ tags, activeTag, onSelect }) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`rounded-full border px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
          !activeTag
            ? "border-ink bg-ink text-white"
            : "border-line text-ink-soft hover:border-ink-soft hover:text-ink"
        }`}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onSelect(tag)}
          className={`rounded-full border px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
            activeTag === tag
              ? "border-ink bg-ink text-white"
              : "border-line text-ink-soft hover:border-ink-soft hover:text-ink"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
