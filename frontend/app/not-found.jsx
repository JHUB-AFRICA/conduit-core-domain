import Link from "next/link";

export const metadata = {
  title: "Page Not Found — Conduit",
  description: "The page you are looking for could not be found.",
};

export default function NotFound() {
  return (
    <>
      <div className="min-h-[70vh] border-t border-line bg-bg flex items-center justify-center py-20">
        <div className="wrap mx-auto max-w-wrap px-5 text-center">
          {/* 404 Illustration */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="text-[8rem] leading-none font-display font-bold text-ink/5 select-none">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl">🔍</div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="mb-4 font-display text-4xl font-semibold text-ink">
            Page Not Found
          </h1>
          <p className="mx-auto max-w-md text-[1.02rem] text-ink-soft">
            The page you are looking for doesn't exist or has been moved.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/"
              className="rounded-md bg-ink px-6 py-3 text-[0.95rem] font-medium text-white transition-colors hover:bg-[#2a2c1f]"
            >
              Go to Homepage
            </Link>
            <Link
              href="/documentation"
              className="rounded-md border border-line px-6 py-3 text-[0.95rem] font-medium text-ink transition-colors hover:border-ink-soft"
            >
              View Documentation
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 border-t border-line pt-8">
            <p className="mb-4 text-sm text-ink-soft">
              You might find these helpful:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
              <Link
                href="/"
                className="text-ink-soft hover:text-ink transition-colors"
              >
                Home
              </Link>
              <span className="text-line">•</span>
              <Link
                href="/documentation"
                className="text-ink-soft hover:text-ink transition-colors"
              >
                Documentation
              </Link>
              <span className="text-line">•</span>
              <Link
                href="/data-portal"
                className="text-ink-soft hover:text-ink transition-colors"
              >
                Data Portal
              </Link>
              <span className="text-line">•</span>
              <Link
                href="/alerts"
                className="text-ink-soft hover:text-ink transition-colors"
              >
                Alerts
              </Link>
              <span className="text-line">•</span>
              <Link
                href="/pricing"
                className="text-ink-soft hover:text-ink transition-colors"
              >
                Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
