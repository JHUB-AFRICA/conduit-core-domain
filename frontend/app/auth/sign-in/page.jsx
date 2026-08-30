"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import useAuthStore from "../../../store";

const metadata = {
  title: "Sign In — Conduit",
  description:
    "Sign in to your Conduit account to access real-time weather telemetry and agricultural alert systems.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, error, isAuthenticated, clearError } =
    useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState("");

  // Only ever redirect to a relative in-app path — never follow an
  // external URL from the query string.
  const getRedirectTarget = () => {
    const next = searchParams.get("next");
    return next && next.startsWith("/") ? next : "/dashboard";
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(getRedirectTarget());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, router]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    // Basic validation
    if (!email || !password) {
      setLocalError("Please fill in all fields");
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      router.push(getRedirectTarget());
    } else {
      setLocalError(result.error || "Invalid credentials. Please try again.");
    }
  };

  return (
    <>
      <a id="top" />
      <section className="min-h-[70vh] border-t border-line py-20">
        <div className="wrap mx-auto max-w-wrap px-5">
          <div className="mx-auto max-w-md">
            {/* Header */}
            <div className="mb-8 text-center">
              <span className="mb-4 inline-block rounded-sm bg-accent-soft px-3 py-1.5 font-mono text-[0.72rem] font-semibold uppercase tracking-wider text-accent">
                Welcome back
              </span>
              <h1 className="font-display text-[clamp(1.8rem,3.6vw,2.2rem)] font-semibold leading-[1.15] tracking-tight text-ink">
                Sign in to Conduit
              </h1>
              <p className="mt-3 text-[0.98rem] text-ink-soft">
                Access your weather telemetry and alert systems.
              </p>
            </div>

            {/* Error Message */}
            {(error || localError) && (
              <div className="mb-6 rounded-md bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-600">{localError || error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-md border border-line bg-bg px-4 py-3 text-[0.95rem] text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-[0.85rem] font-medium text-ink"
                  >
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-[0.82rem] text-accent transition-colors hover:text-ink"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-md border border-line bg-bg px-4 py-3 text-[0.95rem] text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-line text-accent focus:ring-accent"
                />
                <label
                  htmlFor="remember"
                  className="text-[0.88rem] text-ink-soft"
                >
                  Remember me
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-ink px-4 py-3.5 text-[0.95rem] font-medium text-white transition-colors hover:bg-[#2a2c1f] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            {/* Sign up link */}
            <p className="mt-8 text-center text-[0.88rem] text-ink-soft">
              Don't have an account?{" "}
              <Link
                href="/auth/sign-up"
                className="font-medium text-accent transition-colors hover:text-ink"
              >
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
