"use client";

import { usePathname } from "next/navigation";

import PublicSearchHero from "@/app/components/properties/PublicSearchHero";
import type {
  PropertyCategory,
  PropertySearchFilters,
} from "@/app/lib/property-types";
import { getPublicCategoryFromPath } from "@/app/lib/route-constants";
import { DEFAULT_PROPERTY_IMAGE } from "@/app/lib/property-utils";

function PropertyCardSkeleton() {
  return (
    <article className="h-full overflow-hidden rounded-[1.1rem] border border-[var(--admin-border)] bg-white shadow-sm">
      <div className="aspect-[4/3] animate-pulse bg-[var(--admin-surface)]" />

      <div className="space-y-4 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded-full bg-slate-200" />
        <div className="h-3 w-full animate-pulse rounded-full bg-slate-100" />
        <div className="h-3 w-2/3 animate-pulse rounded-full bg-slate-100" />

        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="h-5 w-28 animate-pulse rounded-full bg-slate-200" />
          <div className="h-9 w-20 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    </article>
  );
}

export function PublicListingResultsSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading property results.</span>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <div className="h-9 w-48 animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-64 max-w-full animate-pulse rounded-full bg-slate-100" />
        </div>

        <div className="h-12 w-full animate-pulse rounded-2xl bg-slate-100 sm:w-[210px]" />
      </div>

      <div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <PropertyCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export default function PublicListingLoadingShell({
  category = "property",
}: {
  category?: PropertyCategory;
}) {
  const pathname = usePathname();
  const inferredCategory =
    pathname === "/"
      ? category
      : (getPublicCategoryFromPath(pathname) as PropertyCategory | null);
  const activeCategory = inferredCategory || category;

  if (pathname !== "/" && !inferredCategory) {
    return null;
  }

  const filters: PropertySearchFilters = {
    category: activeCategory,
    purpose: "rent",
    city: "Islamabad",
    location: "",
    page: 1,
    limit: 10,
    sortBy: "newest",
  };

  return (
    <main className="has-sticky-filters min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_top,_var(--admin-primary-soft),_transparent_35%),linear-gradient(180deg,_var(--admin-card)_0%,_var(--admin-surface)_52%,_var(--admin-background)_100%)]">
      <PublicSearchHero
        category={activeCategory}
        filters={filters}
        total={null}
        backgroundImage={DEFAULT_PROPERTY_IMAGE}
      />

      <section className="mx-auto w-full min-w-0 max-w-[1500px] px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        <PublicListingResultsSkeleton />
      </section>
    </main>
  );
}
