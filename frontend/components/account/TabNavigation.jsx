import Link from "next/link";

export default function TabNavigation({ activeTab, onTabChange }) {
  return (
    <div className="mb-8 flex flex-wrap items-center gap-1 border-b border-line">
      <button
        onClick={() => onTabChange("account")}
        className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
          activeTab === "account"
            ? "border-accent text-ink"
            : "border-transparent text-ink-soft hover:text-ink hover:border-line"
        }`}
      >
        Account
      </button>
      <button
        onClick={() => onTabChange("api")}
        className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
          activeTab === "api"
            ? "border-accent text-ink"
            : "border-transparent text-ink-soft hover:text-ink hover:border-line"
        }`}
      >
        API Access
      </button>
      <Link
        href="/webhooks"
        className="px-4 py-2 text-sm font-medium transition-colors border-b-2 border-transparent text-ink-soft hover:text-ink hover:border-line"
      >
        Webhooks ↗
      </Link>
    </div>
  );
}
