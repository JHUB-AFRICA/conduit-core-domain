export default function DataPreview({
  previewData,
  totalRecords,
  station,
  exportFormat,
}) {
  // Only show first 10 records for preview
  const displayData = previewData.slice(0, 10);

  return (
    <div className="rounded-lg border border-line bg-bg p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display text-base font-semibold text-ink">
            Data Preview
          </h3>
          <p className="text-sm text-ink-soft">
            Showing first {Math.min(displayData.length, 10)} of{" "}
            {totalRecords.toLocaleString()} records
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-ink-soft">
          <span>{station.name}</span>
          <span>•</span>
          <span>{exportFormat}</span>
          <span>•</span>
          <span className="text-green">✓ Preview Ready</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-bg-soft">
            <tr>
              <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-medium text-muted">
                Timestamp
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-medium text-muted">
                Temp (°C)
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-medium text-muted">
                Humidity (%)
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-medium text-muted">
                Pressure (hPa)
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-medium text-muted">
                Wind (m/s)
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-medium text-muted">
                Wind Dir
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-medium text-muted">
                Rainfall (mm)
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-medium text-muted">
                Heat Index (°C)
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-medium text-muted">
                WBGT (°C)
              </th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, index) => (
              <tr
                key={index}
                className={`border-b border-line last:border-0 ${
                  index % 2 === 0 ? "bg-bg" : "bg-bg-soft"
                }`}
              >
                <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-ink-soft">
                  {row.timestamp}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-ink">
                  {row.temperature}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-ink">
                  {row.humidity}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-ink">
                  {row.pressure}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-ink">
                  {row.windSpeed}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-ink">
                  {row.windDirection}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-ink">
                  {row.rainfall}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-ink">
                  {row.heatIndex}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-ink">
                  {row.wbgt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-sm text-ink-soft">
        <span>
          Showing {Math.min(displayData.length, 10)} of{" "}
          {totalRecords.toLocaleString()} records
        </span>
        <span className="text-green">✓ Data preview ready</span>
      </div>
    </div>
  );
}
