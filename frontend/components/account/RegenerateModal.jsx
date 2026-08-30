export default function RegenerateModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-lg bg-bg p-6">
        <h3 className="font-display text-xl font-semibold text-ink">
          Regenerate API Key?
        </h3>
        <div className="mt-4 space-y-3">
          <p className="text-sm text-ink-soft">
            This will permanently deactivate your current API key.
          </p>
          <p className="text-sm text-ink-soft">
            Any applications using the old key will stop working immediately.
          </p>
          <p className="text-sm font-medium text-accent">
            Make sure you update your applications with the new key.
          </p>
        </div>

        <div className="mt-4 rounded-md bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-700">
            ⚠️ This action cannot be undone. All integrations using the current
            key will break.
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#a84d24] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Generating..." : "Generate New API Key"}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-md border border-line px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-bg-soft disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
