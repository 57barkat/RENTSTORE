"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

import { PUBLIC_CATEGORY_LINKS } from "@/app/lib/route-constants";

export default function PublicHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--admin-border)] bg-[var(--admin-background)]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link
            href="/houses"
            className="text-lg font-semibold tracking-tight text-[var(--admin-text)] transition hover:text-[var(--admin-primary)]"
          >
            AnganStay
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {PUBLIC_CATEGORY_LINKS.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-[var(--admin-primary)] text-[var(--admin-background)] shadow-[0_18px_40px_-24px_rgba(0,0,128,0.35)]"
                      : "text-[var(--admin-muted)] hover:bg-[var(--admin-surface)] hover:text-[var(--admin-primary)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--admin-border)] bg-[var(--admin-background)] text-[var(--admin-icon)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)] lg:hidden"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-[var(--admin-border)] bg-[var(--admin-background)] px-4 py-4 shadow-[0_20px_40px_-30px_var(--admin-shadow)] lg:hidden">
          <nav className="flex flex-col gap-2">
            {PUBLIC_CATEGORY_LINKS.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

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
