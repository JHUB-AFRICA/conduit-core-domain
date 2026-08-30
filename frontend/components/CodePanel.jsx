import { useState } from "react";

export default function CodePanel({ label, children }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-card-line rounded-lg overflow-hidden bg-card">
      {label && (
        <div className="flex items-center justify-between px-4 py-2 bg-[#0d0e0a] border-b border-card-line">
          <span className="font-mono text-[0.6rem] uppercase tracking-wider text-[#9a9c8a]">
            {label}
          </span>

          <button
            onClick={handleCopy}
            className="text-[#6f7160] hover:text-[#d7d8c8] transition-colors text-xs"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
      )}

      <pre className="p-4 overflow-x-auto">
        <code className="font-mono text-[0.8rem] leading-relaxed text-[#d7d8c8] whitespace-pre-wrap break-words">
          {children}
        </code>
      </pre>
    </div>
  );
}
