import Link from "next/link";
import { Building2, ChevronRight, MapPin } from "lucide-react";

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
    <footer className="border-t border-[var(--admin-border)] bg-[linear-gradient(180deg,var(--admin-background),white)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.8fr_0.8fr_1.15fr]">
          <div className="space-y-5">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 text-[var(--admin-text)]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--admin-primary)] text-white shadow-[0_18px_34px_-22px_var(--admin-primary)] transition group-hover:-translate-y-0.5">
                <Building2 className="h-5 w-5" />
              </span>

              <span className="min-w-0">
                <span className="block text-xl font-black tracking-tight">
                  AnganStay
                </span>
                <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--admin-muted)]">
                  Verified rentals
                </span>
              </span>
            </Link>

            <p className="max-w-sm text-sm leading-7 text-[var(--admin-muted)]">
              Curated rental discovery across Pakistan for verified houses,
              apartments, hostels, shops, and offices.
            </p>

            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-white px-4 py-2 text-xs font-bold text-[var(--admin-muted)] shadow-sm">
              <MapPin className="h-4 w-4 text-[var(--admin-primary)]" />
              Pakistan rental marketplace
            </div>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title} className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.22em] text-[var(--admin-text)]">
                {group.title}
              </h2>

              <nav className="grid gap-2.5 text-sm text-[var(--admin-muted)]">
                {group.links.map((link) => (
                  <Link
                    key={`${group.title}-${link.label}`}
                    href={link.href}
                    className="group inline-flex w-fit items-center gap-2 rounded-full py-1 font-medium transition hover:text-[var(--admin-primary)]"
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="h-3.5 w-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </Link>
                ))}
              </nav>
            </div>
          ))}

          <div className="rounded-[2rem] border border-[var(--admin-border)] bg-white p-5 shadow-[0_24px_70px_-52px_var(--admin-shadow)]">
            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--admin-primary)]">
                Stay updated
              </p>

              <h2 className="text-xl font-black tracking-tight text-[var(--admin-text)]">
                Browse live rental inventory
              </h2>

              <p className="text-sm leading-7 text-[var(--admin-muted)]">
                Fresh verified listings and popular market areas, updated from
                live inventory.
              </p>
            </div>

            <Link
              href="/"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--admin-primary)] px-5 py-3 text-sm font-bold text-white shadow-[0_18px_34px_-24px_var(--admin-primary)] transition hover:-translate-y-0.5 hover:opacity-95"
            >
              Explore listings
              <ChevronRight className="h-4 w-4" />
            </Link>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link
                href="/popular-locations"
                className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-background)] px-3 py-3 text-center text-xs font-bold text-[var(--admin-muted)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
              >
                Popular areas
              </Link>

              <Link
                href="/apartments"
                className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-background)] px-3 py-3 text-center text-xs font-bold text-[var(--admin-muted)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
              >
                Apartments
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-[var(--admin-border)] pt-6 text-xs text-[var(--admin-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 AnganStay. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/popular-locations"
              className="font-medium transition hover:text-[var(--admin-primary)]"
            >
              Popular Locations
            </Link>

            <Link
              href="/apartments"
              className="font-medium transition hover:text-[var(--admin-primary)]"
            >
              Apartments
            </Link>

            <Link
              href="/"
              className="font-medium transition hover:text-[var(--admin-primary)]"
            >
              All Properties
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
