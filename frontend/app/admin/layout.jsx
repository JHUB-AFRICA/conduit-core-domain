"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import useAuthStore from "../../store";
import { apiClient } from "../../libs/api";

/**
 * Guards everything under /admin/*.
 *
 * We don't trust the persisted `user` object in the auth store on its
 * own — it may have been cached before `is_staff` was added to
 * /auth/me/, or the person's staff status may have changed server-side
 * since they last logged in. So on every mount we re-fetch /auth/me/
 * and gate on that fresh response, only falling back to the store for
 * the initial "are we logged in at all" check.
 */
export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, setUser } = useAuthStore();
  const [status, setStatus] = useState("checking"); // checking | allowed | denied

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (!isAuthenticated) {
        router.replace(`/auth/sign-in?next=${encodeURIComponent(pathname || "/admin/ingestion")}`);
        return;
      }

      try {
        const me = await apiClient.get("/auth/me/");
        if (cancelled) return;

        if (typeof setUser === "function") {
          setUser(me);
        }

        setStatus(me?.is_staff ? "allowed" : "denied");
      } catch (err) {
        if (cancelled) return;
        setStatus("denied");
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, pathname]);

  if (status === "checking") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center border-t border-line bg-bg">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-accent" />
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center border-t border-line bg-bg px-4">
        <div className="max-w-sm text-center">
          <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </span>
          <h1 className="font-display text-xl font-semibold text-ink">
            Staff access required
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            The ingestion console is restricted to staff accounts. If you
            believe this is a mistake, ask an administrator to grant your
            account staff access.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2a2c1f]"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
