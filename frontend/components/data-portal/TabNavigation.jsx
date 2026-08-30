export default function TabNavigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: "stations", label: "📍 Weather Stations" },
    { id: "export", label: "📤 Export Data" },
  ];

  return (
    <div className="mb-8 flex gap-2 border-b border-line pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? "bg-accent text-white"
              : "text-ink-soft hover:bg-bg-soft"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
