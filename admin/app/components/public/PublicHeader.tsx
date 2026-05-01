"use client";

import Link from "next/link";
import { Building2, Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

import {
  PUBLIC_CATEGORY_LINKS,
  getPublicCategoryFromPath,
} from "@/app/lib/route-constants";

export default function PublicHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeCategory = getPublicCategoryFromPath(pathname);

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
