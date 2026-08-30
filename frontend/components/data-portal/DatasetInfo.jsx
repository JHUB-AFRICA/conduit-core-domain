export default function DatasetInfo({
  station,
  startDate,
  endDate,
  totalRecords,
  exportFormat,
}) {
  return (
    <div className="rounded-lg border border-line bg-bg p-6">
      <h4 className="mb-4 font-display text-base font-semibold text-ink">
        Dataset Information
      </h4>

      <div className="space-y-3">
        <div className="flex justify-between border-b border-line pb-2">
          <span className="text-sm text-ink-soft">Station</span>
          <span className="text-sm font-medium text-ink">{station.name}</span>
        </div>
        <div className="flex justify-between border-b border-line pb-2">
          <span className="text-sm text-ink-soft">Date Range</span>
          <span className="text-sm font-medium text-ink">
            {startDate} to {endDate}
          </span>
        </div>
        <div className="flex justify-between border-b border-line pb-2">
          <span className="text-sm text-ink-soft">Total Records</span>
          <span className="text-sm font-medium text-ink">
            {totalRecords.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-ink-soft">Format</span>
          <span className="text-sm font-medium text-ink">{exportFormat}</span>
        </div>
      </div>
    </div>
  );
}
