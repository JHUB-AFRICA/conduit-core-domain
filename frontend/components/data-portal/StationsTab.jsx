// import StationCard from "./StationCard";

// export default function StationsTab({ stations, onSelectStation }) {
//   return (
//     <div>
//       <h2 className="mb-4 font-display text-lg font-semibold text-ink">
//         Available Weather Stations
//       </h2>
//       <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
//         {stations.map((station) => (
//           <StationCard
//             key={station.id}
//             station={station}
//             onSelect={() => onSelectStation(station)}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

import StationCard from "./StationCard";

export default function StationsTab({ stations, onSelectStation }) {
  if (stations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-ink-soft">No weather stations available.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-semibold text-ink">
        Available Weather Stations
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stations.map((station) => (
          <StationCard
            key={station.id}
            station={station}
            onSelect={() => onSelectStation(station)}
          />
        ))}
      </div>
    </div>
  );
}
