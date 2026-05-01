import Link from "next/link";

import { PUBLIC_CATEGORY_LINKS } from "@/app/lib/route-constants";

const footerGroups = [
  {
    title: "Explore",
    links: [
      { href: "/", label: "All Properties" },
      ...PUBLIC_CATEGORY_LINKS.map((item) => ({
        href: item.href,
        label: item.label,
      })),
      { href: "/popular-locations", label: "Popular Locations" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/", label: "Home" },
      { href: "/popular-locations", label: "Popular Locations" },
      { href: "/houses", label: "House Listings" },
    ],
  },
] as const;

export default function PublicFooter() {
  return (
    <footer className="border-t border-[var(--admin-border)] bg-[var(--admin-background)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-[1.1fr_0.9fr_0.9fr_1fr]">
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-[var(--admin-text)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--admin-primary)] text-sm font-semibold text-white shadow-[0_16px_30px_-18px_var(--admin-primary)]">
                A
              </span>
              <span className="text-xl font-semibold tracking-tight">
                AnganStay
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-7 text-[var(--admin-muted)]">
              Curated rental discovery across Pakistan for verified houses,
              apartments, hostels, shops, and offices.
            </p>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title} className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--admin-text)]">
                {group.title}
              </h2>
              <div className="flex flex-col gap-3 text-sm text-[var(--admin-muted)]">
                {group.links.map((link) => (
                  <Link
                    key={`${group.title}-${link.label}`}
                    href={link.href}
                    className="transition hover:text-[var(--admin-primary)]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--admin-text)]">
              Stay Updated
            </h2>
            <p className="text-sm leading-7 text-[var(--admin-muted)]">
              Fresh verified listings and popular market areas, updated directly
              from live inventory.
            </p>
            <div className="rounded-[1.75rem] border border-[var(--admin-border)] bg-[var(--admin-card)] p-4">
              <p className="text-sm font-medium text-[var(--admin-text)]">
                Browse live rental inventory
              </p>
              <p className="mt-2 text-sm text-[var(--admin-muted)]">
                Use category navigation above or start with all properties.
              </p>
              <Link
                href="/"
                className="mt-4 inline-flex rounded-full bg-[var(--admin-primary)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                Explore listings
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[var(--admin-border)] pt-6 text-xs text-[var(--admin-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>2026 AnganStay. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/popular-locations"
              className="transition hover:text-[var(--admin-primary)]"
            >
              Popular Locations
            </Link>
            <Link
              href="/apartments"
              className="transition hover:text-[var(--admin-primary)]"
            >
              Apartments
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
