import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, MapPin, TrendingUp } from "lucide-react";

import { PropertyService } from "@/app/lib/PropertyService";
import type { PropertyCategory } from "@/app/lib/property-types";
import { BRAND_NAME, getCategoryLabel } from "@/app/lib/property-utils";
import { toAbsoluteUrl } from "@/app/lib/site-config";

const CATEGORY_SECTIONS: PropertyCategory[] = [
  "apartment",
  "home",
  "hostel",
  "shop",
  "office",
];

export const revalidate = 1800;

export const metadata: Metadata = {
  title: `Popular Rental Locations in Pakistan | ${BRAND_NAME}`,
  description:
    "Explore popular rental areas across Pakistan for apartments, houses, hostels, shops, and offices. Browse live location pages by city, area, and property type.",
  alternates: {
    canonical: toAbsoluteUrl("/popular-locations"),
  },
  openGraph: {
    title: `Popular Rental Locations in Pakistan | ${BRAND_NAME}`,
    description:
      "Explore popular rental areas across Pakistan for apartments, houses, hostels, shops, and offices. Browse live location pages by city, area, and property type.",
    type: "website",
    url: toAbsoluteUrl("/popular-locations"),
  },
  twitter: {
    card: "summary_large_image",
    title: `Popular Rental Locations in Pakistan | ${BRAND_NAME}`,
    description:
      "Explore popular rental areas across Pakistan for apartments, houses, hostels, shops, and offices. Browse live location pages by city, area, and property type.",
  },
};

export default async function PopularLocationsPage() {
  const sections = await Promise.all(
    CATEGORY_SECTIONS.map(async (category) => ({
      category,
      groups: await PropertyService.getPopularLocationsOverview({
        propertyType: category,
        purpose: "rent",
        limit: 8,
      }),
    })),
  );

  const totalCities = new Set(
    sections.flatMap(({ groups }) => groups.map((group) => group.city)),
  ).size;

  const totalAreas = sections.reduce(
    (total, section) =>
      total +
      section.groups.reduce(
        (groupTotal, group) => groupTotal + group.locations.length,
        0,
      ),
    0,
  );

  const totalListings = sections.reduce(
    (total, section) =>
      total +
      section.groups.reduce(
        (groupTotal, group) =>
          groupTotal +
          group.locations.reduce(
            (locationTotal, location) => locationTotal + location.count,
            0,
          ),
        0,
      ),
    0,
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--admin-primary-soft),_transparent_35%),linear-gradient(180deg,_var(--admin-card)_0%,_var(--admin-surface)_52%,_var(--admin-background)_100%)]">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="overflow-hidden rounded-[2.25rem] border border-[var(--admin-border)] bg-white/82 shadow-[0_30px_90px_-60px_var(--admin-shadow)] backdrop-blur">
          <div className="relative border-b border-[var(--admin-border)] bg-[linear-gradient(135deg,rgba(56,86,255,0.08),rgba(255,255,255,1),rgba(16,185,129,0.07))] px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
            <div className="absolute right-8 top-8 hidden h-28 w-28 rounded-full bg-[var(--admin-primary)]/10 blur-2xl sm:block" />
            <div className="absolute bottom-4 right-28 hidden h-20 w-20 rounded-full bg-emerald-300/20 blur-2xl lg:block" />

            <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
              <div className="max-w-4xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-white/85 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--admin-primary)] shadow-sm backdrop-blur sm:text-xs">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Popular rental areas
                </span>

                <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight text-[var(--admin-text)] sm:text-5xl">
                  Find where people are renting across Pakistan
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--admin-muted)] sm:text-lg">
                  Explore popular areas by property type and city. Each link
                  takes you directly to live rental listings for that location.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 rounded-[2rem] border border-[var(--admin-border)] bg-white/88 p-4 shadow-[0_24px_70px_-55px_var(--admin-shadow)] backdrop-blur">
                <div className="rounded-[1.35rem] bg-[var(--admin-background)] px-3 py-4 text-center">
                  <p className="text-2xl font-black text-[var(--admin-text)]">
                    {totalCities}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--admin-muted)]">
                    Cities
                  </p>
                </div>

                <div className="rounded-[1.35rem] bg-[var(--admin-background)] px-3 py-4 text-center">
                  <p className="text-2xl font-black text-[var(--admin-text)]">
                    {totalAreas}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--admin-muted)]">
                    Areas
                  </p>
                </div>

                <div className="rounded-[1.35rem] bg-[var(--admin-background)] px-3 py-4 text-center">
                  <p className="text-2xl font-black text-[var(--admin-text)]">
                    {totalListings}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--admin-muted)]">
                    Listings
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
            {sections.map(({ category, groups }) => {
              const categoryLabel = getCategoryLabel(category, true);
              const categoryTotal = groups.reduce(
                (total, group) =>
                  total +
                  group.locations.reduce(
                    (locationTotal, location) => locationTotal + location.count,
                    0,
                  ),
                0,
              );

              return (
                <section
                  key={category}
                  className="overflow-hidden rounded-[2rem] border border-[var(--admin-border)] bg-white shadow-[0_20px_60px_-52px_var(--admin-shadow)]"
                >
                  <div className="flex flex-col gap-4 border-b border-[var(--admin-border)] bg-[var(--admin-background)]/55 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
                        <Building2 className="h-5 w-5" />
                      </span>

                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--admin-primary)]">
                          {categoryLabel}
                        </p>

                        <h2 className="mt-1 text-xl font-black tracking-tight text-[var(--admin-text)] sm:text-2xl">
                          Popular areas for {categoryLabel.toLowerCase()}
                        </h2>
                      </div>
                    </div>

                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--admin-border)] bg-white px-4 py-2 text-xs font-bold text-[var(--admin-muted)]">
                      <MapPin className="h-4 w-4 text-[var(--admin-primary)]" />
                      {categoryTotal} live listings
                    </div>
                  </div>

                  {groups.length === 0 ? (
                    <div className="px-5 py-8 sm:px-6">
                      <p className="rounded-[1.5rem] border border-dashed border-[var(--admin-border)] bg-[var(--admin-background)] px-5 py-6 text-sm text-[var(--admin-muted)]">
                        We do not have enough location activity for this
                        category yet. Please check back as more listings are
                        added.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6 px-5 py-5 sm:px-6 sm:py-6">
                      {groups.map((group) => (
                        <div
                          key={`${category}-${group.city}`}
                          className="space-y-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-lg font-black text-[var(--admin-text)]">
                              {group.city}
                            </h3>

                            <span className="rounded-full bg-[var(--admin-background)] px-3 py-1 text-xs font-bold text-[var(--admin-muted)]">
                              {group.locations.length} areas
                            </span>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {group.locations.map((item) => (
                              <Link
                                key={`${category}-${group.city}-${item.slug}`}
                                href={`/${item.slug}`}
                                className="group rounded-[1.5rem] border border-[var(--admin-border)] bg-[var(--admin-background)] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--admin-primary)] hover:bg-white hover:shadow-[0_20px_50px_-42px_var(--admin-shadow)]"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-black text-[var(--admin-text)] group-hover:text-[var(--admin-primary)]">
                                      {item.area}
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-[var(--admin-muted)]">
                                      {categoryLabel} for rent in {group.city}
                                    </p>
                                  </div>

                                  <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-white px-2 text-xs font-black text-[var(--admin-primary)] shadow-sm">
                                    {item.count}
                                  </span>
                                </div>

                                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[var(--admin-primary)] opacity-80 transition group-hover:gap-2 group-hover:opacity-100">
                                  View listings
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
