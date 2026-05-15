import Link from "next/link";
import Script from "next/script";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import BrowseByCategorySection from "@/app/components/properties/BrowseByCategorySection";
import ListingToolbar from "@/app/components/properties/ListingToolbar";
import PopularLocationsSection from "@/app/components/properties/PopularLocationsSection";
import PublicListingTrustBanner from "@/app/components/properties/PublicListingTrustBanner";
import PropertyCard from "@/app/components/properties/PropertyCard";
import PropertyModal from "@/app/components/properties/PropertyModal";
import PublicSearchHero from "@/app/components/properties/PublicSearchHero";
import { PropertyService } from "@/app/lib/PropertyService";
import {
  buildBreadcrumbJsonLd,
  buildListingSeoContent,
  buildListingBreadcrumbs,
  serializeJsonLd,
} from "@/app/lib/seo";
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
  DEFAULT_PROPERTY_IMAGE,
  getCategoryLabel,
  getPropertyCategory,
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
    limit: filters.limit || 10,
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

  const breadcrumbs = buildListingBreadcrumbs(filters);
  const showBreadcrumbs = breadcrumbs.length > 1;
  const breadcrumbJsonLd = showBreadcrumbs
    ? buildBreadcrumbJsonLd(breadcrumbs)
    : null;
  const currentPage = response.page || 1;
  const totalPages = response.totalPages || 1;
  const seoContent = buildListingSeoContent(filters);

  const faqJsonLd = seoContent
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: seoContent.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }
    : null;

  const pages = Array.from(
    new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]),
  )
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);

  const popularLocationsTitle =
    category === "property"
      ? "Most Popular Locations in Islamabad "
      : `Most Popular Locations for ${getCategoryLabel(category, true)}`;

  const popularLocationsPrefix =
    category === "property"
      ? `Properties for ${filters.purpose === "sale" ? "sale" : "rent"}`
      : `${getCategoryLabel(category, true)} for ${
          filters.purpose === "sale" ? "sale" : "rent"
        }`;

  const popularLocationsBrowseLabel =
    category === "property"
      ? "properties"
      : getCategoryLabel(category, true).toLowerCase();

  const categoryCounts = response.data.reduce<
    Partial<Record<PropertyCategory, number>>
  >((counts, property) => {
    const propertyCategory = getPropertyCategory(property);
    counts[propertyCategory] = (counts[propertyCategory] || 0) + 1;
    return counts;
  }, {});

  return (
    <main className="has-sticky-filters min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_top,_var(--admin-primary-soft),_transparent_35%),linear-gradient(180deg,_var(--admin-card)_0%,_var(--admin-surface)_52%,_var(--admin-background)_100%)]">
      <Script
        id={`category-jsonld-${category}-${currentPage}`}
        type="application/ld+json"
        strategy="beforeInteractive"
      >
        {serializeJsonLd(jsonLd)}
      </Script>

      {breadcrumbJsonLd && (
        <Script
          id={`category-breadcrumbs-jsonld-${category}-${currentPage}`}
          type="application/ld+json"
          strategy="beforeInteractive"
        >
          {serializeJsonLd(breadcrumbJsonLd)}
        </Script>
      )}

      {faqJsonLd && (
        <Script
          id={`category-faq-jsonld-${category}-${currentPage}`}
          type="application/ld+json"
          strategy="beforeInteractive"
        >
          {serializeJsonLd(faqJsonLd)}
        </Script>
      )}

      <PublicSearchHero
        category={category}
        filters={filters}
        total={response.total}
        backgroundImage={DEFAULT_PROPERTY_IMAGE}
      />

      <section className="mx-auto w-full min-w-0 max-w-[1500px] px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        {showBreadcrumbs && (
          <nav
            aria-label="Breadcrumb"
            className="mb-5 flex flex-wrap items-center gap-2 text-xs text-[var(--admin-muted)] sm:text-sm"
          >
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;

              return (
                <div
                  key={`${item.href}-${item.name}`}
                  className="flex items-center gap-2"
                >
                  {isLast ? (
                    <span className="font-semibold text-[var(--admin-text)]">
                      {item.name}
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      className="transition hover:text-[var(--admin-primary)]"
                    >
                      {item.name}
                    </Link>
                  )}

                  {!isLast && (
                    <span className="text-[var(--admin-muted)]">/</span>
                  )}
                </div>
              );
            })}
          </nav>
        )}

        <div className="space-y-6">
          <section className="min-w-0 space-y-6">
            {fetchError && (
              <div className="rounded-[1.25rem] border border-[var(--admin-warning-soft)] bg-[var(--admin-warning-soft)] px-5 py-4 text-sm text-[var(--admin-warning)] shadow-sm">
                We couldn&apos;t load live listings right now. The page is still
                available, and you can retry in a moment.
              </div>
            )}

            <ListingToolbar
              category={category}
              total={response.total}
              currentPage={currentPage}
              totalPages={totalPages}
            />

            {response.data.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-[var(--admin-border)] bg-white px-6 py-16 text-center shadow-inner">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--admin-surface)]">
                  <Search
                    className="text-[var(--admin-placeholder)]"
                    size={32}
                  />
                </div>

                <h2 className="text-2xl font-black text-[var(--admin-text)]">
                  No properties matched these filters
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-[var(--admin-muted)]">
                  {fetchError
                    ? `We couldn't reach the property service. Please try again in a moment for ${
                        filters.city || "Islamabad "
                      } listings.`
                    : `Try widening the price range or changing the locality filter to surface more results in ${
                        filters.city || filters.location || "the selected area"
                      }.`}
                </p>
              </div>
            ) : (
              <div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
                className="flex flex-wrap items-center justify-center gap-2 pt-3"
              >
                <Link
                  href={buildPaginationHref(
                    pathname,
                    filters,
                    Math.max(1, currentPage - 1),
                  )}
                  aria-disabled={currentPage === 1}
                  className={`inline-flex h-10 items-center justify-center rounded-xl border px-3 text-sm font-black transition ${
                    currentPage === 1
                      ? "pointer-events-none border-[var(--admin-border)] bg-white text-[var(--admin-placeholder)]"
                      : "border-[var(--admin-border)] bg-white text-[var(--admin-muted)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
                  }`}
                >
                  <ChevronLeft size={16} />
                </Link>

                {pages.map((page) => (
                  <Link
                    key={page}
                    href={buildPaginationHref(pathname, filters, page)}
                    className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-center text-sm font-black transition ${
                      page === currentPage
                        ? "bg-[var(--admin-primary)] text-white shadow-[0_14px_28px_-18px_var(--admin-primary)]"
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
                  className={`inline-flex h-10 items-center justify-center rounded-xl border px-3 text-sm font-black transition ${
                    currentPage === totalPages
                      ? "pointer-events-none border-[var(--admin-border)] bg-white text-[var(--admin-placeholder)]"
                      : "border-[var(--admin-border)] bg-white text-[var(--admin-muted)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
                  }`}
                >
                  <ChevronRight size={16} />
                </Link>
              </nav>
            )}

            <PublicListingTrustBanner total={response.total} />

            {/* <BrowseByCategorySection counts={categoryCounts} /> */}

            <PopularLocationsSection
              title={popularLocationsTitle}
              itemLabelPrefix={popularLocationsPrefix}
              browseLabel={popularLocationsBrowseLabel}
              items={popularLocations}
            />

            {seoContent && (
              <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.86fr)]">
                <div className="rounded-[1.5rem] border border-[var(--admin-border)] bg-white p-5 shadow-sm sm:p-6">
                  <p className="text-xs font-black uppercase text-[var(--admin-primary)]">
                    Rental Guides & Tips
                  </p>

                  <h2 className="mt-3 text-xl font-black text-[var(--admin-text)]">
                    {seoContent.introTitle}
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-[var(--admin-muted)]">
                    {seoContent.introBody}
                  </p>
                </div>

                {seoContent.faqs.length > 0 && (
                  <div className="rounded-[1.5rem] border border-[var(--admin-border)] bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-4 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase text-[var(--admin-primary)]">
                          FAQ
                        </p>
                        <h2 className="mt-2 text-xl font-black text-[var(--admin-text)]">
                          Frequently Asked Questions
                        </h2>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      {seoContent.faqs.map((faq) => (
                        <details
                          key={faq.question}
                          className="group/faq overflow-hidden rounded-xl border border-[var(--admin-border)] bg-white"
                        >
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 transition hover:bg-[var(--admin-background)]">
                            <h3 className="text-sm font-black leading-6 text-[var(--admin-text)]">
                              {faq.question}
                            </h3>

                            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--admin-background)] text-sm font-black text-[var(--admin-muted)] transition group-open/faq:rotate-45 group-open/faq:bg-[var(--admin-primary)] group-open/faq:text-white">
                              +
                            </span>
                          </summary>

                          <div className="border-t border-[var(--admin-border)] px-4 py-3">
                            <p className="text-sm leading-7 text-[var(--admin-muted)]">
                              {faq.answer}
                            </p>
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}
          </section>
        </div>
      </section>

      <PropertyModal properties={response.data} pathname={pathname} />
    </main>
  );
}
