export default function Authentication() {
  return (
    <section
      id="authentication"
      className="scroll-mt-10 py-12 border-b border-line"
    >
      <h2 className="font-display text-3xl text-ink mb-4">Authentication</h2>
      <p className="text-ink-soft leading-relaxed max-w-3xl mb-6">
        Every request to the API is authenticated with an API key, sent in
        the <code className="font-mono text-sm">X-API-KEY</code> header.
        Generate one from your dashboard once you&apos;ve signed up.
      </p>

      <div className="rounded-lg border border-line bg-bg-soft p-5 max-w-xl mb-6">
        <div className="rounded-md bg-ink px-4 py-3 font-mono text-xs text-white overflow-x-auto">
          X-API-KEY: your_api_key_here
        </div>
      </div>

      <p className="text-sm text-ink-soft max-w-3xl">
        Requests missing a valid key return{" "}
        <code className="font-mono text-xs bg-bg-soft px-1.5 py-0.5 rounded">
          401 Unauthorized
        </code>
        . Webhook subscriptions are managed separately from the Webhooks
        page in your dashboard while signed in.
      </p>
    </section>
  );
}
