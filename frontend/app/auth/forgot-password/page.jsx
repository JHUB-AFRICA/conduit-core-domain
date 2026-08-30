"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <a id="top" />

      {/* ============================================ */}
      {/* FORGOT PASSWORD SECTION */}
      {/* ============================================ */}
      <section className="min-h-[70vh] border-t border-line py-20">
        <div className="wrap mx-auto max-w-wrap px-5">
          <div className="mx-auto max-w-md">
            {/* Header */}
            <div className="mb-8 text-center">
              <span className="mb-4 inline-block rounded-sm bg-accent-soft px-3 py-1.5 font-mono text-[0.72rem] font-semibold uppercase tracking-wider text-accent">
                Reset password
              </span>
              <h1 className="font-display text-[clamp(1.8rem,3.6vw,2.2rem)] font-semibold leading-[1.15] tracking-tight text-ink">
                Forgot your password?
              </h1>
              <p className="mt-3 text-[0.98rem] text-ink-soft">
                No worries! Enter your email address and we'll send you a link
                to reset your password.
              </p>
            </div>

            {/* This backend doesn't expose a password-reset endpoint yet
                (accounts/urls.py only has signup/login/refresh/me and
                api-keys). Rather than silently failing, the form says so
                plainly instead of pretending an email was sent. */}
            {submitted ? (
              <div className="mb-6 rounded-md bg-bg-soft border border-line px-4 py-3 text-sm text-ink-soft">
                Password reset isn&apos;t available on this deployment yet.
                In the meantime, reach out to support to have your password
                reset manually.
              </div>
            ) : (
              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
              >
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-[0.85rem] font-medium text-ink"
                  >
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="you@example.com"
                    className="w-full rounded-md border border-line bg-bg px-4 py-3 text-[0.95rem] text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    required
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full rounded-md bg-ink px-4 py-3.5 text-[0.95rem] font-medium text-white transition-colors hover:bg-[#2a2c1f]"
                >
                  Send reset link
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="my-8 flex items-center gap-4">
              <div className="flex-1 border-t border-line"></div>
              <span className="text-[0.78rem] uppercase tracking-wider text-muted">
                Or
              </span>
              <div className="flex-1 border-t border-line"></div>
            </div>

            {/* Back to login */}
            <div className="text-center">
              <p className="text-[0.88rem] text-ink-soft">
                Remember your password?{" "}
                <a
                  href="/auth/sign-in"
                  className="font-medium text-accent transition-colors hover:text-ink"
                >
                  Sign in
                </a>
              </p>
              <p className="mt-2 text-[0.82rem] text-muted">
                Don't have an account?{" "}
                <a
                  href="/auth/sign-up"
                  className="text-accent transition-colors hover:text-ink"
                >
                  Create one
                </a>
              </p>
            </div>

            {/* Security note */}
            <div className="mt-8 rounded-md border border-line bg-bg-soft px-4 py-3">
              <p className="flex items-start gap-2 text-[0.78rem] text-muted">
                <span className="mt-0.5">🔒</span>
                <span>
                  We'll send a password reset link to this email address. The
                  link will expire in 24 hours for security reasons.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
