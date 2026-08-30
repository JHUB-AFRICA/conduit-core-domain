"use client";

import { useState } from "react";

export default function SecretRevealModal({ secret, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!secret) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-lg border border-line bg-bg p-6">
        <h2 className="mb-2 font-display text-lg font-semibold text-ink">
          Webhook created
        </h2>
        <p className="mb-4 text-sm text-ink-soft">
          Save this signing secret now — it&apos;s only shown this once and
          isn&apos;t returned by any later API call.
        </p>

        <div className="mb-4 flex items-center gap-2 rounded-md border border-line bg-bg-soft px-3 py-2.5">
          <code className="flex-1 truncate font-mono text-xs text-ink">
            {secret}
          </code>
          <button
            onClick={handleCopy}
            className="shrink-0 rounded-md bg-ink px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#2a2c1f]"
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>

        <p className="mb-6 text-xs text-muted">
          Use it to verify the{" "}
          <code className="font-mono">X-Conduit-Signature</code> header on
          every delivery — see the Code Examples section of the docs.
        </p>

        <button
          onClick={onClose}
          className="w-full rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2a2c1f]"
        >
          Done
        </button>
      </div>
    </div>
  );
}
