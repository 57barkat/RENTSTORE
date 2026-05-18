import type { Metadata } from "next";
import Link from "next/link";

import { PUBLIC_CATEGORY_LINKS } from "@/app/lib/route-constants";

export const metadata: Metadata = {
  title: "Page Not Found | AnganStay",
  description: "The requested public property page could not be found.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function PublicNotFoundPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--admin-primary-soft),_transparent_35%),linear-gradient(180deg,_var(--admin-card)_0%,_var(--admin-surface)_52%,_var(--admin-background)_100%)]">
      <section className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
        <span className="inline-flex rounded-full border border-[var(--admin-primary-strong)] bg-[color:color-mix(in_srgb,var(--admin-background)_88%,transparent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--admin-primary)]">
          Page not found
        </span>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[var(--admin-text)] sm:text-5xl">
          This property page or listing URL is no longer available
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--admin-muted)] sm:text-lg">
          The link may be outdated, the listing may have been removed, or the URL may be incorrect. You can continue browsing verified rental pages from the links below.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-[var(--admin-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Browse all properties
          </Link>
          <Link
            href="/popular-locations"
            className="inline-flex items-center justify-center rounded-full border border-[var(--admin-border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--admin-text)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
          >
            Popular locations
          </Link>
        </div>

        <div className="mt-10 grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PUBLIC_CATEGORY_LINKS.filter((item) =>
            ["home", "apartment", "hostel", "shop"].includes(item.category),
          ).map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="rounded-[1.5rem] border border-[var(--admin-border)] bg-white px-5 py-4 text-sm font-semibold text-[var(--admin-text)] shadow-sm transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
