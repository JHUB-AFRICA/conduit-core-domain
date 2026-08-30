"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useAuthStore from "../../../store";

const metadata = {
  title: "Sign Up — Conduit",
  description:
    "Create your Conduit account to access real-time weather telemetry and agricultural alert systems.",
};

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading, error, isAuthenticated, clearError } =
    useAuthStore();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [localError, setLocalError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const validatePassword = (pass) => {
    if (pass.length < 8) {
      return "Password must be at least 8 characters long";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setPasswordError("");

    // Validate passwords
    const passError = validatePassword(password);
    if (passError) {
      setPasswordError(passError);
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    if (!termsAccepted) {
      setLocalError("Please accept the Terms of Service");
      return;
    }

    const result = await signup(email, username, password);

    if (result.success) {
      router.push("/dashboard");
    } else {
      setLocalError(result.error || "Signup failed. Please try again.");
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
                Get started
              </span>
              <h1 className="font-display text-[clamp(1.8rem,3.6vw,2.2rem)] font-semibold leading-[1.15] tracking-tight text-ink">
                Create your account
              </h1>
              <p className="mt-3 text-[0.98rem] text-ink-soft">
                Start building with Conduit in five minutes.
              </p>
            </div>

            {/* Error Message */}
            {(error || localError || passwordError) && (
              <div className="mb-6 rounded-md bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-600">
                  {localError || error || passwordError}
                </p>
              </div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="mb-1.5 block text-[0.85rem] font-medium text-ink"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  className="w-full rounded-md border border-line bg-bg px-4 py-3 text-[0.95rem] text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  required
                  disabled={isLoading}
                />
              </div>

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
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-[0.85rem] font-medium text-ink"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full rounded-md border border-line bg-bg px-4 py-3 text-[0.95rem] text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  required
                  disabled={isLoading}
                />
                <p className="mt-1.5 text-[0.75rem] text-muted">
                  Must be at least 8 characters long.
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-1.5 block text-[0.85rem] font-medium text-ink"
                >
                  Confirm password
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  name="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full rounded-md border border-line bg-bg px-4 py-3 text-[0.95rem] text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-line text-accent focus:ring-accent"
                  required
                  disabled={isLoading}
                />
                <label htmlFor="terms" className="text-[0.85rem] text-ink-soft">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-accent transition-colors hover:text-ink"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-accent transition-colors hover:text-ink"
                  >
                    Privacy Policy
                  </Link>
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
                    Creating account...
                  </span>
                ) : (
                  "Create account"
                )}
              </button>
            </form>

            {/* Login link */}
            <p className="mt-8 text-center text-[0.88rem] text-ink-soft">
              Already have an account?{" "}
              <Link
                href="/auth/sign-in"
                className="font-medium text-accent transition-colors hover:text-ink"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
