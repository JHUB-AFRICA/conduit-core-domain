// export default function StationCard({ station, onSelect }) {
//   const statusColors = {
//     Active: "bg-green",
//     Offline: "bg-red",
//     Maintenance: "bg-orange",
//   };

//   const statusColor = statusColors[station.status] || "bg-gray";

//   return (
//     <div className="rounded-lg border border-line bg-bg p-5 transition-all hover:shadow-md">
//       <div className="mb-3 flex items-start justify-between">
//         <div>
//           <h3 className="font-display text-base font-semibold text-ink">
//             {station.name}
//           </h3>
//           <p className="text-sm text-ink-soft">{station.location}</p>
//         </div>
//         <span
//           className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${statusColor}`}
//         >
//           {station.status}
//         </span>
//       </div>

//       <div className="mb-3 space-y-0.5 text-sm text-ink-soft">
//         <p>Coordinates: {station.coordinates}</p>
//         <p>Elevation: {station.elevation}</p>
//         <p className="text-xs text-muted">Updated: {station.lastUpdated}</p>
//       </div>

//       <button
//         onClick={onSelect}
//         className="w-full rounded-md border border-line px-4 py-2 text-sm text-ink-soft transition-colors hover:bg-bg-soft hover:text-ink"
//       >
//         Select Station →
//       </button>
//     </div>
//   );
// }

export default function StationCard({ station, onSelect }) {
  const statusColors = {
    Active: "bg-green",
    Offline: "bg-red",
    Maintenance: "bg-orange",
  };

  const statusColor = statusColors[station.status] || "bg-gray";

  return (
    <div className="rounded-lg border border-line bg-bg p-5 transition-all hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="font-display text-base font-semibold text-ink">
            {station.name}
          </h3>
          <p className="text-sm text-ink-soft">{station.location}</p>
        </div>
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${statusColor}`}
        >
          {station.status}
        </span>
      </div>

      <div className="mb-3 space-y-0.5 text-sm text-ink-soft">
        <p>Coordinates: {station.coordinates}</p>
        <p>Elevation: {station.elevation}</p>
        <p className="text-xs text-muted">Updated: {station.lastUpdated}</p>
      </div>

      {/* Current Weather Preview */}
      {station.current && (
        <div className="mb-3 grid grid-cols-3 gap-1 rounded-md bg-bg-soft p-2">
          <div className="text-center">
            <p className="text-[0.55rem] uppercase text-muted">Temp</p>
            <p className="text-sm font-semibold text-ink">
              {station.current.temperature}°C
            </p>
          </div>
          <div className="text-center">
            <p className="text-[0.55rem] uppercase text-muted">Humidity</p>
            <p className="text-sm font-semibold text-ink">
              {station.current.humidity}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-[0.55rem] uppercase text-muted">Wind</p>
            <p className="text-sm font-semibold text-ink">
              {station.current.windSpeed} m/s
            </p>
          </div>
        </div>
      )}

      <button
        onClick={onSelect}
        className="w-full rounded-md border border-line px-4 py-2 text-sm text-ink-soft transition-colors hover:bg-bg-soft hover:text-ink"
      >
        Select Station →
      </button>
    </div>
  );
}
