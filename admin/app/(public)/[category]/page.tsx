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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eff6ff_52%,_#ffffff_100%)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-10 grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
          <div className="space-y-5">
            <span className="inline-flex rounded-full border border-sky-200 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
              Public property discovery
            </span>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                {title}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                {description}
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-200/60 backdrop-blur">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
              Live inventory
            </p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <p className="text-4xl font-semibold tracking-tight text-slate-950">
                {response.total}
              </p>
              <p className="max-w-[14rem] text-right text-sm leading-6 text-slate-500">
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
              <div className="rounded-[2rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 shadow-sm">
                We couldn&apos;t load live listings right now. The page is still
                available, and you can retry in a moment.
              </div>
            )}

            <div className="flex flex-col gap-3 rounded-[2rem] border border-slate-200 bg-white/85 p-5 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {response.data.length} listings on this page
                </p>
                <p className="text-sm text-slate-500">
                  Page {currentPage} of {Math.max(totalPages, 1)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                {(filters.city || filters.location || filters.hostelType) && (
                  <>
                    {filters.city && (
                      <span className="rounded-full bg-slate-100 px-3 py-2">
                        City: {filters.city}
                      </span>
                    )}
                    {filters.location && (
                      <span className="rounded-full bg-slate-100 px-3 py-2">
                        Location: {filters.location}
                      </span>
                    )}
                    {filters.hostelType && (
                      <span className="rounded-full bg-slate-100 px-3 py-2">
                        Hostel type: {filters.hostelType}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            {response.data.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 px-6 py-16 text-center shadow-inner">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                  <Search className="text-slate-400" size={32} />
                </div>
                <h2 className="text-2xl font-semibold text-slate-950">
                  No properties matched these filters
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-slate-500">
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
                      ? "pointer-events-none border-slate-200 bg-white text-slate-300"
                      : "border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:text-sky-700"
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
                        ? "bg-slate-950 text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:text-sky-700"
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
                      ? "pointer-events-none border-slate-200 bg-white text-slate-300"
                      : "border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:text-sky-700"
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
