import Link from "next/link";
import Script from "next/script";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import FilterSidebar from "@/app/components/properties/FilterSidebar";
import ListingToolbar from "@/app/components/properties/ListingToolbar";
import PopularLocationsSection from "@/app/components/properties/PopularLocationsSection";
import PropertyCard from "@/app/components/properties/PropertyCard";
import PropertyModal from "@/app/components/properties/PropertyModal";
import { PropertyService } from "@/app/lib/PropertyService";
import type {
  PopularLocationSummary,
  PropertyCategory,
  PropertySearchFilters,
  PropertySearchResponse,
} from "@/app/lib/property-types";
import {
  buildPropertyBrowserQuery,
  buildPropertyHref,
  buildPropertySearchQuery,
  getCategoryLabel,
  getPropertyTitle,
} from "@/app/lib/property-utils";
import { parseSeoListingSlug } from "@/app/lib/property-seo";
import { toAbsoluteUrl } from "@/app/lib/site-config";

interface PublicListingPageProps {
  category: PropertyCategory;
  filters: PropertySearchFilters;
  pathname: string;
  pageUrl: string;
  title: string;
  description: string;
}

const buildPreviewHref = (
  pathname: string,
  filters: PropertySearchFilters,
  propertyId: string,
) => {
  const isSeoPath = Boolean(parseSeoListingSlug(pathname.replace(/^\//, "")));
  const params = new URLSearchParams(
    buildPropertyBrowserQuery(filters, {
      omitCity: isSeoPath,
      omitPurpose: isSeoPath,
      omitLocation: isSeoPath,
    }),
  );
  params.set("preview", propertyId);
  return `${pathname}?${params.toString()}`;
};

const buildPaginationHref = (
  pathname: string,
  filters: PropertySearchFilters,
  page: number,
) => {
  const isSeoPath = Boolean(parseSeoListingSlug(pathname.replace(/^\//, "")));
  const query = buildPropertyBrowserQuery(
    {
      ...filters,
      page,
    },
    {
      omitCity: isSeoPath,
      omitPurpose: isSeoPath,
      omitLocation: isSeoPath,
    },
  );

  return query ? `${pathname}?${query}` : pathname;
};

const resolvePopularLocationsCity = (
  filters: PropertySearchFilters,
  response: PropertySearchResponse,
) => {
  const directCity = (filters.city || "").trim();
  if (directCity) {
    return directCity;
  }

  const firstPropertyCity = response.data
    .flatMap((property) =>
      Array.isArray(property.address) ? property.address : [property.address],
    )
    .find((address) => address?.city)?.city;

  return firstPropertyCity?.trim() || "";
};

export default async function PublicListingPage({
  category,
  filters,
  pathname,
  pageUrl,
  title,
  description,
}: PublicListingPageProps) {
  let fetchError: string | null = null;
  let popularLocations: PopularLocationSummary[] = [];
  let response: PropertySearchResponse = {
    data: [],
    total: 0,
    page: filters.page || 1,
    limit: filters.limit || 12,
    totalPages: 0,
  };

  try {
    if (process.env.NODE_ENV !== "production") {
      console.info("[public-listing-query]", {
        category,
        pathname,
        filters,
        apiQuery: buildPropertySearchQuery(filters),
      });
    }

    response = await PropertyService.searchProperties(filters);
  } catch (error) {
    fetchError =
      error instanceof Error
        ? error.message
        : "Unable to load property listings right now.";
  }

  try {
    const popularLocationsCity = resolvePopularLocationsCity(filters, response);
    if (popularLocationsCity) {
      popularLocations = await PropertyService.getPopularLocations({
        city: popularLocationsCity,
        propertyType: category === "property" ? undefined : category,
        purpose: filters.purpose || "rent",
        limit: 9,
      });
    }
  } catch {
    popularLocations = [];
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: pageUrl,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: response.total,
      itemListElement: response.data.map((property, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: getPropertyTitle(property),
        url: toAbsoluteUrl(buildPropertyHref(property)),
      })),
    },
  };
  const serializedJsonLd = JSON.stringify(jsonLd)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
  const currentPage = response.page || 1;
  const totalPages = response.totalPages || 1;
  const pages = Array.from(
    new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]),
  )
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);
  const inventoryDescription =
    category === "property"
      ? "Verified houses, apartments, hostels, shops, and offices with real-time availability updates."
      : `Verified ${getCategoryLabel(category, true).toLowerCase()} available in ${filters.city || "your area"} with real-time availability updates.`;
  const popularLocationsTitle =
    category === "property"
      ? "Most Popular Locations Across Pakistan"
      : `Most Popular Locations for ${getCategoryLabel(category, true)}`;
  const popularLocationsPrefix =
    category === "property"
      ? `Properties for ${filters.purpose === "sale" ? "sale" : "rent"}`
      : `${getCategoryLabel(category, true)} for ${filters.purpose === "sale" ? "sale" : "rent"}`;
  const popularLocationsBrowseLabel =
    category === "property"
      ? "properties"
      : getCategoryLabel(category, true).toLowerCase();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--admin-primary-soft),_transparent_35%),linear-gradient(180deg,_var(--admin-card)_0%,_var(--admin-surface)_52%,_var(--admin-background)_100%)]">
      <Script
        id={`category-jsonld-${category}-${currentPage}`}
        type="application/ld+json"
        strategy="beforeInteractive"
      >
        {serializedJsonLd}
      </Script>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-10 grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
          <div className="space-y-5">
            <span className="inline-flex rounded-full border border-[var(--admin-primary-strong)] bg-[color:color-mix(in_srgb,var(--admin-background)_88%,transparent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--admin-primary)]">
              Public property discovery
            </span>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-[var(--admin-text)] sm:text-5xl">
                {title}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[var(--admin-muted)] sm:text-lg">
                {description}
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--admin-border)] bg-[color:color-mix(in_srgb,var(--admin-background)_92%,transparent)] p-6 shadow-[0_18px_40px_-28px_var(--admin-shadow)] backdrop-blur">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--admin-muted)]">
              Live inventory
            </p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <p className="text-4xl font-semibold tracking-tight text-[var(--admin-text)]">
                {response.total}
              </p>
              <p className="max-w-[14rem] text-right text-sm leading-6 text-[var(--admin-muted)]">
                {inventoryDescription}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <FilterSidebar category={category} totalResults={response.total} />
          </aside>

          <section className="space-y-6">
            {fetchError && (
              <div className="rounded-[2rem] border border-[var(--admin-warning-soft)] bg-[var(--admin-warning-soft)] px-5 py-4 text-sm text-[var(--admin-warning)] shadow-sm">
                We couldn&apos;t load live listings right now. The page is still
                available, and you can retry in a moment.
              </div>
            )}

            <ListingToolbar
              category={category}
              totalOnPage={response.data.length}
              currentPage={currentPage}
              totalPages={totalPages}
            />

            {(filters.category !== "property" ||
              filters.city ||
              filters.location ||
              filters.hostelType) && (
              <div className="flex flex-wrap gap-2 text-xs font-medium text-[var(--admin-muted)]">
                {filters.category !== "property" && (
                  <span className="rounded-full border border-[var(--admin-border)] bg-white px-3 py-2 shadow-sm">
                    Category: {getCategoryLabel(filters.category, true)}
                  </span>
                )}
                {filters.city && (
                  <span className="rounded-full border border-[var(--admin-border)] bg-white px-3 py-2 shadow-sm">
                    City: {filters.city}
                  </span>
                )}
                {filters.location && (
                  <span className="rounded-full border border-[var(--admin-border)] bg-white px-3 py-2 shadow-sm">
                    Area: {filters.location}
                  </span>
                )}
                {filters.hostelType && (
                  <span className="rounded-full border border-[var(--admin-border)] bg-white px-3 py-2 shadow-sm">
                    Hostel type: {filters.hostelType}
                  </span>
                )}
              </div>
            )}

            {response.data.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-[var(--admin-border)] bg-[color:color-mix(in_srgb,var(--admin-background)_76%,transparent)] px-6 py-16 text-center shadow-inner">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--admin-surface)]">
                  <Search
                    className="text-[var(--admin-placeholder)]"
                    size={32}
                  />
                </div>
                <h2 className="text-2xl font-semibold text-[var(--admin-text)]">
                  No properties matched these filters
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-[var(--admin-muted)]">
                  {fetchError
                    ? `We couldn't reach the property service. Please try again in a moment for ${filters.city || "Pakistan"} listings.`
                    : `Try widening the price range or changing the locality filter to surface more results in ${filters.city || "Pakistan"}.`}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {response.data.map((property) => (
                  <PropertyCard
                    key={property._id}
                    property={property}
                    previewHref={buildPreviewHref(
                      pathname,
                      filters,
                      property._id,
                    )}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <nav
                aria-label="Pagination"
                className="flex flex-wrap items-center justify-center gap-2 pt-4"
              >
                <Link
                  href={buildPaginationHref(
                    pathname,
                    filters,
                    Math.max(1, currentPage - 1),
                  )}
                  aria-disabled={currentPage === 1}
                  className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition ${
                    currentPage === 1
                      ? "pointer-events-none border-[var(--admin-border)] bg-white text-[var(--admin-placeholder)]"
                      : "border-[var(--admin-border)] bg-white text-[var(--admin-muted)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
                  }`}
                >
                  <ChevronLeft size={16} />
                  Previous
                </Link>

                {pages.map((page) => (
                  <Link
                    key={page}
                    href={buildPaginationHref(pathname, filters, page)}
                    className={`inline-flex h-11 min-w-11 items-center justify-center rounded-full px-4 text-center text-sm font-medium transition ${
                      page === currentPage
                        ? "bg-[var(--admin-primary)] text-[var(--admin-background)] shadow-[0_14px_28px_-18px_var(--admin-primary)]"
                        : "border border-[var(--admin-border)] bg-white text-[var(--admin-muted)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
                    }`}
                  >
                    {page}
                  </Link>
                ))}

                <Link
                  href={buildPaginationHref(
                    pathname,
                    filters,
                    Math.min(totalPages, currentPage + 1),
                  )}
                  aria-disabled={currentPage === totalPages}
                  className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition ${
                    currentPage === totalPages
                      ? "pointer-events-none border-[var(--admin-border)] bg-white text-[var(--admin-placeholder)]"
                      : "border-[var(--admin-border)] bg-white text-[var(--admin-muted)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
                  }`}
                >
                  Next
                  <ChevronRight size={16} />
                </Link>
              </nav>
            )}

            <PopularLocationsSection
              title={popularLocationsTitle}
              itemLabelPrefix={popularLocationsPrefix}
              browseLabel={popularLocationsBrowseLabel}
              items={popularLocations}
            />
          </section>
        </div>
      </section>

      <PropertyModal properties={response.data} pathname={pathname} />
    </main>
  );
}
