import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Search } from "lucide-react";

import FilterSidebar from "@/app/components/properties/FilterSidebar";
import PropertyCard from "@/app/components/properties/PropertyCard";
import PropertyModal from "@/app/components/properties/PropertyModal";
import { PropertyService } from "@/app/lib/PropertyService";
import type {
  PropertySearchFilters,
  PropertySearchResponse,
} from "@/app/lib/property-types";
import {
  BRAND_NAME,
  buildListingDescription,
  buildListingTitle,
  buildPropertyBrowserQuery,
  buildPropertyHref,
  getCanonicalCategorySegment,
  getCategoryLabel,
  getPropertyTitle,
  normalizeCategorySegment,
  parsePropertySearchParams,
} from "@/app/lib/property-utils";
import { toAbsoluteUrl } from "@/app/lib/site-config";

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const getCategoryRouteContext = async (
  paramsPromise: Promise<{ category: string }>,
  searchParamsPromise: Promise<{
    [key: string]: string | string[] | undefined;
  }>,
) => {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const category = normalizeCategorySegment(params.category);

  if (!category) {
    notFound();
  }

  const filters = parsePropertySearchParams(category, searchParams);
  const canonicalCategory = getCanonicalCategorySegment(category);

  return {
    params,
    category,
    canonicalCategory,
    filters,
  };
};

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { canonicalCategory, filters } = await getCategoryRouteContext(
    params,
    searchParams,
  );
  const title = buildListingTitle(filters);
  const description = buildListingDescription(filters);
  const query = buildPropertyBrowserQuery(filters);
  const canonicalPath = `/${canonicalCategory}${query ? `?${query}` : ""}`;
  const canonicalUrl = toAbsoluteUrl(canonicalPath);

  return {
    title: `${title} | ${BRAND_NAME}`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | ${BRAND_NAME}`,
      description,
      type: "website",
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${BRAND_NAME}`,
      description,
    },
  };
}

const buildPreviewHref = (
  pathname: string,
  filters: PropertySearchFilters,
  propertyId: string,
) => {
  const params = new URLSearchParams(buildPropertyBrowserQuery(filters));
  params.set("preview", propertyId);
  return `${pathname}?${params.toString()}`;
};

const buildPaginationHref = (
  pathname: string,
  filters: PropertySearchFilters,
  page: number,
) => {
  const query = buildPropertyBrowserQuery({
    ...filters,
    page,
  });

  return `${pathname}?${query}`;
};

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  const {
    params: resolvedParams,
    category,
    canonicalCategory,
    filters,
  } = await getCategoryRouteContext(params, searchParams);

  if (resolvedParams.category !== canonicalCategory) {
    const query = buildPropertyBrowserQuery(filters);
    redirect(`/${canonicalCategory}${query ? `?${query}` : ""}`);
  }

  let fetchError: string | null = null;
  let response: PropertySearchResponse = {
    data: [],
    total: 0,
    page: filters.page || 1,
    limit: filters.limit || 12,
    totalPages: 0,
  };
  try {
    response = await PropertyService.searchProperties(filters);
  } catch (error) {
    fetchError =
      error instanceof Error
        ? error.message
        : "Unable to load property listings right now.";
  }

  const pathname = `/${canonicalCategory}`;
  const title = buildListingTitle(filters);
  const description = buildListingDescription(filters, response.total);
  const pageUrl = toAbsoluteUrl(pathname);
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
  const currentPage = response.page || 1;
  const totalPages = response.totalPages || 1;
  const pages = Array.from(
    new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]),
  )
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--admin-primary-soft),_transparent_35%),linear-gradient(180deg,_var(--admin-card)_0%,_var(--admin-surface)_52%,_var(--admin-background)_100%)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
                Verified {getCategoryLabel(category, true).toLowerCase()}{" "}
                available in {filters.city || "your area"} with real-time
                availability updates.
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

            <div className="flex flex-col gap-3 rounded-[2rem] border border-[var(--admin-border)] bg-[color:color-mix(in_srgb,var(--admin-background)_88%,transparent)] p-5 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--admin-text)]">
                  {response.data.length} listings on this page
                </p>
                <p className="text-sm text-[var(--admin-muted)]">
                  Page {currentPage} of {Math.max(totalPages, 1)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-medium text-[var(--admin-muted)]">
                {(filters.city || filters.location || filters.hostelType) && (
                  <>
                    {filters.city && (
                      <span className="rounded-full bg-[var(--admin-surface)] px-3 py-2">
                        City: {filters.city}
                      </span>
                    )}
                    {filters.location && (
                      <span className="rounded-full bg-[var(--admin-surface)] px-3 py-2">
                        Location: {filters.location}
                      </span>
                    )}
                    {filters.hostelType && (
                      <span className="rounded-full bg-[var(--admin-surface)] px-3 py-2">
                        Hostel type: {filters.hostelType}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            {response.data.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-[var(--admin-border)] bg-[color:color-mix(in_srgb,var(--admin-background)_76%,transparent)] px-6 py-16 text-center shadow-inner">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--admin-surface)]">
                  <Search className="text-[var(--admin-placeholder)]" size={32} />
                </div>
                <h2 className="text-2xl font-semibold text-[var(--admin-text)]">
                  No properties matched these filters
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-[var(--admin-muted)]">
                  {fetchError
                    ? `We couldn't reach the property service. Please try again in a moment for ${filters.city || "Islamabad"} listings.`
                    : `Try widening the price range or changing the locality filter to surface more results in ${filters.city || "Islamabad"}.`}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    currentPage === 1
                      ? "pointer-events-none border-[var(--admin-border)] bg-[var(--admin-background)] text-[var(--admin-placeholder)]"
                      : "border-[var(--admin-border)] bg-[var(--admin-background)] text-[var(--admin-muted)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
                  }`}
                >
                  Previous
                </Link>

                {pages.map((page) => (
                  <Link
                    key={page}
                    href={buildPaginationHref(pathname, filters, page)}
                    className={`h-11 min-w-11 rounded-full px-4 text-center text-sm font-medium leading-[2.75rem] transition ${
                      page === currentPage
                        ? "bg-[var(--admin-primary)] text-[var(--admin-background)]"
                        : "border border-[var(--admin-border)] bg-[var(--admin-background)] text-[var(--admin-muted)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
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
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    currentPage === totalPages
                      ? "pointer-events-none border-[var(--admin-border)] bg-[var(--admin-background)] text-[var(--admin-placeholder)]"
                      : "border-[var(--admin-border)] bg-[var(--admin-background)] text-[var(--admin-muted)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
                  }`}
                >
                  Next
                </Link>
              </nav>
            )}
          </section>
        </div>
      </section>

      <PropertyModal properties={response.data} pathname={pathname} />
    </main>
  );
}
