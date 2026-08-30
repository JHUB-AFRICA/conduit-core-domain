import MethodPill from "../MethodPill";
import CodePanel from "../CodePanel";

// Base URL shown in examples matches the same env var the app itself uses
// (see libs/api.js) so copy-pasted snippets actually work against whatever
// backend this deployment is pointed at.
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export default function CodeExamples() {
  return (
    <section id="code-examples" className="scroll-mt-10 py-12">
      <h2 className="font-display text-3xl text-ink mb-6">Code Examples</h2>

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <MethodPill method="GET" />
            <span className="font-mono text-sm text-ink-soft bg-bg-soft px-3 py-1 rounded border border-line">
              /stations/{"{slug}"}/current/
            </span>
          </div>
          <CodePanel label="cURL">
            {`curl -X GET "${BASE_URL}/stations/kenya-kiambu-jkuat-iot-aws-conduitempathy1/current/" \\
  -H "X-API-KEY: YOUR_API_KEY"`}
          </CodePanel>
        </div>

        <CodePanel label="JavaScript — Fetch API">
          {`const res = await fetch(
  "${BASE_URL}/stations/kenya-kiambu-jkuat-iot-aws-conduitempathy1/current/",
  { headers: { "X-API-KEY": "YOUR_API_KEY" } }
);

const data = await res.json();
console.log(data);`}
        </CodePanel>

        <CodePanel label="Python — requests">
          {`import requests

url = "${BASE_URL}/stations/kenya-kiambu-jkuat-iot-aws-conduitempathy1/current/"
headers = { "X-API-KEY": "YOUR_API_KEY" }

response = requests.get(url, headers=headers)
data = response.json()
print(data)`}
        </CodePanel>

        <CodePanel label="Python — verifying a webhook signature">
          {`import hashlib
import hmac

def verify_signature(raw_body: bytes, signature_header: str, secret: str) -> bool:
    expected = "sha256=" + hmac.new(
        secret.encode(), raw_body, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature_header)

# In your webhook receiver:
# signature = request.headers["X-Conduit-Signature"]
# verify_signature(request.body, signature, YOUR_WEBHOOK_SECRET)`}
        </CodePanel>
      </div>
    </section>
  );
}
