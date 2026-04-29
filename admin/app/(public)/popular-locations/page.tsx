import type { Metadata } from "next";
import Link from "next/link";

import { PropertyService } from "@/app/lib/PropertyService";
import type { PropertyCategory } from "@/app/lib/property-types";
import {
  BRAND_NAME,
  getCategoryLabel,
} from "@/app/lib/property-utils";
import { toAbsoluteUrl } from "@/app/lib/site-config";

const CATEGORY_SECTIONS: PropertyCategory[] = [
  "apartment",
  "home",
  "hostel",
  "shop",
  "office",
];

export const metadata: Metadata = {
  title: `Popular Property Locations | ${BRAND_NAME}`,
  description:
    "Browse popular property locations across Pakistan and jump directly into live rental listing pages by category and area.",
  alternates: {
    canonical: toAbsoluteUrl("/popular-locations"),
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

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--admin-primary-soft),_transparent_35%),linear-gradient(180deg,_var(--admin-card)_0%,_var(--admin-surface)_52%,_var(--admin-background)_100%)]">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-[var(--admin-primary-strong)] bg-[color:color-mix(in_srgb,var(--admin-background)_88%,transparent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--admin-primary)]">
            Popular Locations
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[var(--admin-text)] sm:text-5xl">
            Browse popular rental locations across every property category
          </h1>
          <p className="mt-4 text-base leading-7 text-[var(--admin-muted)] sm:text-lg">
            Discover the areas people search most, grouped by city and powered by
            live listing data from the property database.
          </p>
        </div>

        <div className="space-y-8">
          {sections.map(({ category, groups }) => (
            <section
              key={category}
              className="rounded-[2rem] border border-[var(--admin-border)] bg-[color:color-mix(in_srgb,var(--admin-background)_88%,transparent)] p-6 shadow-sm backdrop-blur"
            >
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--admin-primary)]">
                    {getCategoryLabel(category, true)}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--admin-text)]">
                    Most Popular Locations for {getCategoryLabel(category, true)}
                  </h2>
                </div>
                <p className="text-sm text-[var(--admin-muted)]">
                  Live DB-backed location counts, grouped by city.
                </p>
              </div>

              {groups.length === 0 ? (
                <p className="text-sm text-[var(--admin-muted)]">
                  No popular location data is available right now.
                </p>
              ) : (
                <div className="space-y-6">
                  {groups.map((group) => (
                    <div key={`${category}-${group.city}`} className="space-y-3">
                      <h3 className="text-lg font-semibold text-[var(--admin-text)]">
                        {group.city}
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {group.locations.map((item) => (
                          <Link
                            key={`${category}-${group.city}-${item.slug}`}
                            href={`/${item.slug}`}
                            className="group rounded-[1.5rem] border border-[var(--admin-border)] bg-[var(--admin-background)] px-5 py-4 transition hover:border-[var(--admin-primary)] hover:shadow-md"
                          >
                            <p className="text-sm font-medium text-[var(--admin-text)] group-hover:text-[var(--admin-primary)]">
                              {getCategoryLabel(category, true)} for rent in {item.area} ({item.count})
                            </p>
                            <p className="mt-2 text-xs text-[var(--admin-muted)]">
                              View {getCategoryLabel(category, true).toLowerCase()} in {item.area}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
