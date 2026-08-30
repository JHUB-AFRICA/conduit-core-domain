"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import useAuthStore from "../store";
import { apiClient } from "../libs/api";

// Base navigation links (shown to all users)
const BASE_NAV_LINKS = [
  { label: "Documentation", href: "/documentation" },
  { label: "Alerts", href: "/alerts" },
  { label: "Blog", href: "/blog" },
];

// Protected navigation links (only shown when logged in)
const PROTECTED_NAV_LINKS = [
  { label: "Data Portal", href: "/data-portal" },
  { label: "Webhooks", href: "/webhooks" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Get auth state from store
  const { user, isAuthenticated, logout, setUser } = useAuthStore();

  // The persisted `user` object in the store is only ever set at login
  // time. If someone is already logged in from before is_staff was
  // added to /auth/me/ (or their staff status changed server-side
  // since), the cached object won't reflect it and the Admin link
  // would silently never appear. Refresh it once, quietly, whenever
  // we have a session but no is_staff field on the cached user yet.
  useEffect(() => {
    if (!isAuthenticated) return;
    if (user && typeof user.is_staff !== "undefined") return;

    apiClient
      .get("/auth/me/")
      .then((me) => setUser(me))
      .catch(() => {});
  }, [isAuthenticated, user, setUser]);

  // Build navigation links based on authentication status
  const NAV_LINKS = isAuthenticated
    ? [...BASE_NAV_LINKS, ...PROTECTED_NAV_LINKS]
    : BASE_NAV_LINKS;

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "U";
    return user.username ? user.username.slice(0, 2).toUpperCase() : "U";
  };

  // Get user display name
  const getUserName = () => {
    if (!user) return "User";
    return user.username || "User";
  };

  // Get user email
  const getUserEmail = () => {
    if (!user) return "";
    return user.email || "";
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuOpen && !e.target.closest(".user-menu-container")) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [userMenuOpen]);

  // Check if link is active
  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Handle logout
  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setOpen(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="wrap grid h-[68px] grid-cols-[1fr_auto_1fr] items-center">
        {/* Logo */}
        <Link
          href="/"
          className="justify-self-start font-display text-xl font-semibold tracking-tight"
        >
          Conduit
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="col-start-2 hidden justify-self-center gap-10 sm:flex"
          aria-label="Primary"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative text-[0.9rem] transition-colors ${
                isActive(link.href)
                  ? "text-ink font-medium"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute -bottom-[1px] left-0 right-0 h-0.5 bg-accent" />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth / User Menu */}
        <div className="col-start-3 hidden items-center justify-self-end gap-5 sm:flex">
          {isAuthenticated ? (
            <div className="relative user-menu-container">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm text-ink transition-colors hover:bg-bg-soft"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-accent font-medium">
                  {getUserInitials()}
                </span>
                <span className="text-sm font-medium">{getUserName()}</span>
                <svg
                  className={`h-4 w-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-line bg-bg shadow-lg py-1">
                  <div className="px-4 py-2 border-b border-line">
                    <p className="text-sm font-medium text-ink">
                      {getUserName()}
                    </p>
                    <p className="text-xs text-ink-soft">{getUserEmail()}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-sm text-ink-soft hover:bg-bg-soft hover:text-ink transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/webhooks"
                    className="block px-4 py-2 text-sm text-ink-soft hover:bg-bg-soft hover:text-ink transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Webhooks
                  </Link>
                  {user?.is_staff && (
                    <Link
                      href="/admin/ingestion"
                      className="block px-4 py-2 text-sm text-ink-soft hover:bg-bg-soft hover:text-ink transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Admin · Ingestion
                    </Link>
                  )}
                  <div className="border-t border-line my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-bg-soft transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/auth/sign-in"
                className="text-[0.9rem] text-ink-soft hover:text-ink"
              >
                Log in
              </Link>
              <Link
                href="/auth/sign-up"
                className="rounded-md bg-ink px-[18px] py-[9px] text-[0.85rem] font-medium tracking-wide text-white transition-colors hover:bg-[#2a2c1f]"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="col-start-3 flex h-5 w-7 flex-col justify-between justify-self-end bg-transparent sm:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="block h-0.5 bg-ink" />
          <span className="block h-0.5 bg-ink" />
          <span className="block h-0.5 bg-ink" />
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="flex flex-col gap-4 border-t border-line px-5 pb-6 pt-4 sm:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`${
                isActive(link.href) ? "text-ink font-medium" : "text-ink-soft"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-line pt-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent font-medium">
                    {getUserInitials()}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {getUserName()}
                    </p>
                    <p className="text-xs text-ink-soft">{getUserEmail()}</p>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  className="block py-2 text-ink-soft hover:text-ink"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
                {user?.is_staff && (
                  <Link
                    href="/admin/ingestion"
                    className="block py-2 text-ink-soft hover:text-ink"
                    onClick={() => setOpen(false)}
                  >
                    Admin · Ingestion
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                  className="block w-full text-left py-2 text-red-500"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/sign-in"
                  className="block py-2 text-ink-soft hover:text-ink"
                  onClick={() => setOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="block rounded-md bg-ink px-4 py-2.5 text-center text-white"
                  onClick={() => setOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
