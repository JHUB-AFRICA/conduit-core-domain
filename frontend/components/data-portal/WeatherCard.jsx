export default function WeatherCard({ label, value }) {
  return (
    <div className="rounded-lg border border-line bg-bg px-3 py-3 text-center">
      <p className="text-[0.6rem] uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="font-display text-base font-semibold text-ink">{value}</p>
    </div>
  );
}
