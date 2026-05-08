"use client";

import Link from "next/link";
import {
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  UserCircle2,
  X,
} from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

import { usePublicAuth } from "@/app/components/public/PublicAuthProvider";
import {
  PUBLIC_CATEGORY_LINKS,
  getPublicCategoryFromPath,
} from "@/app/lib/route-constants";

export default function PublicHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeCategory = getPublicCategoryFromPath(pathname);
  const { isAuthenticated, isLoading, logout, user } = usePublicAuth();
  const accountLinks = isAuthenticated
    ? [
        { href: "/account/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/account/profile", label: "Profile", icon: UserCircle2 },
      ]
    : [
        { href: "/account/login", label: "Login" },
        { href: "/account/signup", label: "Signup" },
      ];

  return (
    <header className="sticky top-0 z-50 border-b border-[color:color-mix(in_srgb,var(--admin-border)_86%,transparent)] bg-[rgba(255,255,255,0.94)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-5">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-[var(--admin-text)] transition hover:text-[var(--admin-primary)]"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--admin-primary)] text-white shadow-[0_18px_30px_-18px_var(--admin-primary)]">
              <Building2 size={20} />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-lg font-semibold tracking-tight">
                AnganStay
              </span>
              <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                Verified Rentals
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 xl:flex">
            {PUBLIC_CATEGORY_LINKS.map((item) => {
              const isActive = activeCategory === item.category;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-[var(--admin-primary)] text-[var(--admin-background)] shadow-[0_18px_40px_-24px_var(--admin-primary-strong)]"
                      : "text-[var(--admin-muted)] hover:bg-[var(--admin-surface)] hover:text-[var(--admin-primary)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden items-center gap-2 rounded-full border border-[var(--admin-border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--admin-muted)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)] lg:inline-flex"
          >
            <Search size={16} />
            All Properties
          </Link>

          {!isLoading && isAuthenticated ? (
            <>
              <Link
                href="/upload-property"
                className="hidden items-center gap-2 rounded-full bg-[var(--admin-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_18px_36px_-24px_var(--admin-primary)] transition hover:opacity-95 lg:inline-flex"
              >
                <Plus size={16} />
                Upload Property
              </Link>
              <Link
                href="/account/dashboard"
                className="hidden items-center gap-2 rounded-full border border-[var(--admin-border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--admin-text)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)] lg:inline-flex"
              >
                <LayoutDashboard size={16} />
                {user?.name?.split(" ")[0] || "Dashboard"}
              </Link>
              <button
                type="button"
                onClick={() => {
                  void logout();
                }}
                className="hidden items-center gap-2 rounded-full border border-[var(--admin-border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--admin-muted)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)] lg:inline-flex"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : !isLoading ? (
            <>
              <Link
                href="/account/login"
                className="hidden rounded-full border border-[var(--admin-border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--admin-muted)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)] lg:inline-flex"
              >
                Login
              </Link>
              <Link
                href="/account/signup"
                className="hidden rounded-full bg-[var(--admin-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_18px_36px_-24px_var(--admin-primary)] transition hover:opacity-95 lg:inline-flex"
              >
                Sign up
              </Link>
            </>
          ) : null}

          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--admin-border)] bg-white text-[var(--admin-icon)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)] xl:hidden"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[var(--admin-border)] bg-white px-4 py-4 shadow-[0_20px_40px_-30px_var(--admin-shadow)] xl:hidden">
        <div className="mb-3">
          <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-3 text-sm font-medium text-[var(--admin-text)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
            >
              Browse All Properties
            </Link>
          </div>
          {isAuthenticated ? (
            <div className="mb-3 grid gap-2">
              <Link
                href="/upload-property"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--admin-primary)] px-4 py-3 text-sm font-semibold text-white"
              >
                <Plus size={16} />
                Upload Property
              </Link>
              {accountLinks.map((item) => {
                const Icon = "icon" in item ? item.icon : null;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-3 text-sm font-medium text-[var(--admin-text)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
                  >
                    {Icon ? <Icon size={16} /> : null}
                    {item.label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  void logout();
                }}
                className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-3 text-sm font-medium text-[var(--admin-muted)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <div className="mb-3 grid gap-2">
              {accountLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    item.label === "Signup"
                      ? "bg-[var(--admin-primary)] text-white"
                      : "border border-[var(--admin-border)] bg-[var(--admin-card)] text-[var(--admin-text)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
          <nav className="flex flex-col gap-2">
            {PUBLIC_CATEGORY_LINKS.map((item) => {
              const isActive = activeCategory === item.category;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-[var(--admin-primary)] text-[var(--admin-background)]"
                      : "bg-[var(--admin-card)] text-[var(--admin-muted)] hover:bg-[var(--admin-surface)] hover:text-[var(--admin-primary)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
