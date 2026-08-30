export default function ApiAccessSection({
  apiKey,
  apiKeyStatus,
  apiKeyCreated,
  requestsToday,
  dailyQuota,
  rateLimit,
  requestsThisMinute,
  totalRequests,
  onCopy,
  onRegenerate,
  onGenerate,
  copied,
  hasApiKey = true,
  isLoading = false,
}) {
  const remaining = dailyQuota - requestsToday;
  const percentage = (requestsToday / dailyQuota) * 100;

  // If no API key exists, show the generate view
  if (!hasApiKey) {
    return (
      <div className="rounded-lg border border-line bg-bg p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink">
          API Access
        </h2>

        <div className="text-center py-8">
          <div className="mb-4 text-5xl">🔑</div>
          <h3 className="mb-2 font-display text-xl font-semibold text-ink">
            No API Key Found
          </h3>
          <p className="mb-6 max-w-md mx-auto text-ink-soft">
            You don't have an API key yet. Generate one to start making requests
            to the Conduit API.
          </p>
          <button
            onClick={onGenerate}
            disabled={isLoading}
            className="rounded-md bg-ink px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2a2c1f] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Generating..." : "Generate API Key"}
          </button>
        </div>

        {/* Authentication Help */}
        <div className="mt-6 border-t border-line pt-6">
          <h3 className="mb-2 font-display text-base font-semibold text-ink">
            Authentication
          </h3>
          <p className="text-sm text-ink-soft">
            Once you generate an API key, include it in the{" "}
            <code className="rounded bg-bg-soft px-1.5 py-0.5 font-mono text-xs text-ink">
              X-API-KEY
            </code>{" "}
            request header when making requests to the API.
          </p>
          <div className="mt-3">
            <a
              href="/documentation"
              className="text-sm font-medium text-accent hover:underline"
            >
              View API Documentation →
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Existing API key display
  return (
    <div className="rounded-lg border border-line bg-bg p-6">
      <h2 className="mb-4 font-display text-lg font-semibold text-ink">
        API Access
      </h2>

      {/* API Key Section */}
      <div className="space-y-4">
        <div>
          <p className="mb-1 text-sm text-muted">API Key</p>
          <div className="flex items-center gap-3">
            <code className="flex-1 rounded-md bg-bg-soft px-3 py-2 font-mono text-sm text-ink border border-line">
              {apiKey}
            </code>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted">Status</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-green"></span>
              <span className="text-sm font-medium text-green">
                {apiKeyStatus}
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted">Created</p>
            <p className="mt-1 text-sm text-ink">{apiKeyCreated}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCopy}
            className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-bg-soft"
          >
            {copied ? "✓ Copied" : "Copy API Key"}
          </button>
          <button
            onClick={onRegenerate}
            className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-bg-soft"
          >
            Regenerate API Key
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="my-6 border-t border-line"></div>

      {/* Usage Section */}
      <div>
        <h3 className="mb-4 font-display text-base font-semibold text-ink">
          Usage
        </h3>

        {/* Requests Today with Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-soft">Requests Today</span>
            <span className="text-sm font-medium text-ink">
              {requestsToday.toLocaleString()} / {dailyQuota.toLocaleString()}
            </span>
          </div>
          <div className="mt-1.5 h-2 w-full rounded-full bg-line">
            <div
              className={`h-2 rounded-full transition-all ${
                percentage > 80 ? "bg-accent" : "bg-green"
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
          </div>
          <p className="mt-1 text-right text-xs text-muted">
            {Math.round(percentage)}% used
          </p>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted">Requests Remaining</p>
            <p className="mt-1 text-sm font-semibold text-ink">
              {remaining.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Requests This Minute</p>
            <p className="mt-1 text-sm font-semibold text-ink">
              {requestsThisMinute} / {rateLimit}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Total Requests</p>
            <p className="mt-1 text-sm font-semibold text-ink">
              {totalRequests.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Rate Limit</p>
            <p className="mt-1 text-sm font-semibold text-ink">
              {rateLimit} requests/min
            </p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs text-muted">Daily Quota</p>
          <p className="mt-1 text-sm font-semibold text-ink">
            {dailyQuota.toLocaleString()} requests
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="my-6 border-t border-line"></div>

      {/* Authentication Help */}
      <div>
        <h3 className="mb-2 font-display text-base font-semibold text-ink">
          Authentication
        </h3>
        <p className="text-sm text-ink-soft">
          Include your API key in the{" "}
          <code className="rounded bg-bg-soft px-1.5 py-0.5 font-mono text-xs text-ink">
            X-API-KEY
          </code>{" "}
          request header when making requests to the API.
        </p>
        <div className="mt-3">
          <a
            href="/documentation"
            className="text-sm font-medium text-accent hover:underline"
          >
            View API Documentation →
          </a>
        </div>
      </div>
    </div>
  );
}
