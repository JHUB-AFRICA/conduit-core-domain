"use client";
import { useState } from "react";

const metadata = {
  title: "Reset Password — Conduit",
  description: "Create a new password for your Conduit account.",
};

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <a id="top" />

      <section className="min-h-[70vh] border-t border-line py-20">
        <div className="wrap mx-auto max-w-wrap px-5">
          <div className="mx-auto max-w-md">
            {/* Header */}
            <div className="mb-8 text-center">
              <span className="mb-4 inline-block rounded-sm bg-accent-soft px-3 py-1.5 font-mono text-[0.72rem] font-semibold uppercase tracking-wider text-accent">
                Reset password
              </span>
              <h1 className="font-display text-[clamp(1.8rem,3.6vw,2.2rem)] font-semibold leading-[1.15] tracking-tight text-ink">
                Create new password
              </h1>
              <p className="mt-3 text-[0.98rem] text-ink-soft">
                Your new password must be different from previous ones and at
                least 8 characters long.
              </p>
            </div>

            {submitted && (
              <div className="mb-6 rounded-md bg-bg-soft border border-line px-4 py-3 text-sm text-ink-soft">
                Password reset isn&apos;t available on this deployment yet.
                Please contact support to have your password reset manually.
              </div>
            )}

            {/* Success Message (shown after successful reset) */}
            {/*
            <div className="mb-6 rounded-md bg-green-bg px-4 py-3 text-sm text-green">
              <strong>Password reset successful!</strong> Your password has been updated.
              You can now <a href="/auth/sign-in" className="font-medium underline">sign in</a> with your new password.
            </div>
            */}

            {/* Error Message (shown for errors) */}
            {/*
            <div className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
              <strong>Error!</strong> Invalid or expired reset link. Please request a new password reset.
              <br />
              <a href="/auth/forgot-password" className="font-medium underline">
                Request new link
              </a>
            </div>
            */}

            {/* Password Strength Indicator (optional) */}
            {/*
            <div className="mb-4">
              <div className="flex h-1.5 w-full gap-0.5">
                <div className="h-full w-1/4 rounded-l-full bg-gray-200"></div>
                <div className="h-full w-1/4 bg-gray-200"></div>
                <div className="h-full w-1/4 bg-gray-200"></div>
                <div className="h-full w-1/4 rounded-r-full bg-gray-200"></div>
              </div>
              <div className="mt-1.5 text-right text-[0.68rem] text-muted">Weak password</div>
            </div>
            */}

            {/* Reset Password Form */}
            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
              {/* New Password */}
              <div>
                <label
                  htmlFor="new-password"
                  className="mb-1.5 block text-[0.85rem] font-medium text-ink"
                >
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="new-password"
                    name="new-password"
                    placeholder="Enter new password"
                    className="w-full rounded-md border border-line bg-bg px-4 py-3 text-[0.95rem] text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted hover:text-ink"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[0.72rem] text-muted">
                  <span className="inline-flex items-center gap-0.5">
                    <span className="text-green">✓</span> At least 8 characters
                  </span>
                  <span className="inline-flex items-center gap-0.5">
                    <span className="text-green">✓</span> Contains uppercase &
                    lowercase
                  </span>
                  <span className="inline-flex items-center gap-0.5">
                    <span className="text-green">✓</span> Contains numbers
                  </span>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-1.5 block text-[0.85rem] font-medium text-ink"
                >
                  Confirm new password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm-password"
                    name="confirm-password"
                    placeholder="Confirm your new password"
                    className="w-full rounded-md border border-line bg-bg px-4 py-3 text-[0.95rem] text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted hover:text-ink"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {/* Password mismatch message (shown when passwords don't match) */}
                {/*
                <p className="mt-1.5 text-[0.75rem] text-red-600">
                  Passwords do not match.
                </p>
                */}
              </div>

              {/* Password Requirements */}
              <div className="rounded-md border border-line bg-bg-soft px-4 py-3">
                <p className="mb-1.5 text-[0.75rem] font-medium text-ink">
                  Password requirements:
                </p>
                <ul className="space-y-0.5 text-[0.72rem] text-muted">
                  <li className="flex items-center gap-1.5">
                    <span className="text-green">✓</span> At least 8 characters
                    long
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-green">✓</span> Contains at least one
                    uppercase letter (A-Z)
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-green">✓</span> Contains at least one
                    lowercase letter (a-z)
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-green">✓</span> Contains at least one
                    number (0-9)
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-green">✓</span> Contains at least one
                    special character (!@#$%^&*)
                  </li>
                </ul>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full rounded-md bg-ink px-4 py-3.5 text-[0.95rem] font-medium text-white transition-colors hover:bg-[#2a2c1f]"
              >
                Reset password
              </button>
            </form>

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
            </div>

            {/* Security note */}
            <div className="mt-8 rounded-md border border-line bg-bg-soft px-4 py-3">
              <p className="flex items-start gap-2 text-[0.78rem] text-muted">
                <span className="mt-0.5">🔒</span>
                <span>
                  Your password is securely encrypted and never stored in plain
                  text. We use industry-standard encryption to protect your
                  data.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
