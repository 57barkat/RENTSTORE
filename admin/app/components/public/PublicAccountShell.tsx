"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  Heart,
  Home,
  Plus,
  UploadCloud,
  UserRound,
} from "lucide-react";

const navigationItems = [
  { href: "/account/dashboard", label: "Dashboard", icon: Home },
  { href: "/account/properties", label: "My Listings", icon: Plus },
  { href: "/account/favorites", label: "Favorites", icon: Heart },
  { href: "/account/profile", label: "Profile", icon: UserRound },
] as const;

function matchesRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function PublicAccountShell({
  title,
  description,
  children,
  primaryActionHref = "/upload-property",
  primaryActionLabel = "Upload property",
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  primaryActionHref?: string;
  primaryActionLabel?: string;
}) {
  const pathname = usePathname();

  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="rounded-[2rem] border border-[var(--admin-border)] bg-white/90 p-5 shadow-[0_28px_60px_-48px_var(--admin-shadow)] backdrop-blur sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--admin-muted)]">
          <Link href="/" className="transition hover:text-[var(--admin-primary)]">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span>Account</span>
        </div>

        <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-black tracking-tight text-[var(--admin-text)] sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-sm leading-7 text-[var(--admin-muted)] sm:text-[15px]">
              {description}
            </p>
          </div>
          <Link
            href={primaryActionHref}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--admin-primary)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_-24px_var(--admin-primary-strong)] transition hover:opacity-95"
          >
            <UploadCloud className="h-4 w-4" />
            {primaryActionLabel}
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[272px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-24 xl:self-start">
          <div className="hidden rounded-[1.75rem] border border-[var(--admin-border)] bg-white p-3 shadow-[0_18px_36px_-30px_var(--admin-shadow)] xl:block">
            <nav className="grid gap-1.5">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = matchesRoute(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? "bg-[var(--admin-primary)] text-white shadow-[0_18px_36px_-28px_var(--admin-primary-strong)]"
                        : "text-[var(--admin-muted)] hover:bg-[var(--admin-surface)] hover:text-[var(--admin-primary)]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="xl:hidden">
            <nav className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = matchesRoute(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? "border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white"
                        : "border-[var(--admin-border)] bg-white text-[var(--admin-muted)] hover:border-[var(--admin-primary)]/35 hover:text-[var(--admin-primary)]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <div className="min-w-0 space-y-6">{children}</div>
      </div>
    </section>
  );
}
