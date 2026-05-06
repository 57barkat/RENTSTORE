import type { Metadata } from "next";
import {
  notFound,
  permanentRedirect,
} from "next/navigation";

import PublicListingPage from "@/app/components/properties/PublicListingPage";
import { buildListingRobots } from "@/app/lib/seo";
import type { PropertySearchFilters } from "@/app/lib/property-types";
import {
  BRAND_NAME,
  buildListingDescription,
  buildListingPath,
  buildListingTitle,
  buildPropertyBrowserQuery,
  canUseSeoListingPath,
  getCanonicalCategorySegment,
  normalizeCategorySegment,
  parsePropertySearchParams,
} from "@/app/lib/property-utils";
import {
  getLegacyCategoryAliasPath,
  parseSeoListingSlug,
} from "@/app/lib/property-seo";
import { toAbsoluteUrl } from "@/app/lib/site-config";

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const revalidate = 300;

const getCategoryRouteContext = async (
  paramsPromise: Promise<{ category: string }>,
  searchParamsPromise: Promise<{
    [key: string]: string | string[] | undefined;
  }>,
) => {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const legacyAliasPath = getLegacyCategoryAliasPath(params.category);
  const seoRoute = parseSeoListingSlug(params.category);
  const category =
    seoRoute?.category || normalizeCategorySegment(params.category);

  if (!category) {
    notFound();
  }

  const filters = parsePropertySearchParams(category, searchParams);
  if (seoRoute) {
    filters.city = seoRoute.city;
    filters.location = seoRoute.area || "";
    filters.purpose = seoRoute.purpose;
  }

  const canonicalCategory = getCanonicalCategorySegment(category);
  const canonicalPath = buildListingPath(filters, {
    preferSeo: Boolean(seoRoute) || canUseSeoListingPath(filters),
  });
  const canonicalQuery = buildPropertyBrowserQuery(filters, {
    omitCity: canonicalPath !== `/${canonicalCategory}`,
    omitPurpose: canonicalPath !== `/${canonicalCategory}`,
    omitLocation: canonicalPath !== `/${canonicalCategory}`,
  });

  return {
    params,
    category,
    canonicalCategory,
    legacyAliasPath,
    canonicalPath,
    canonicalQuery,
    filters,
  };
};

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { canonicalPath, canonicalQuery, filters } =
    await getCategoryRouteContext(params, searchParams);
  const title = buildListingTitle(filters);
  const description = buildListingDescription(filters);
  const canonicalUrl = toAbsoluteUrl(
    `${canonicalPath}${canonicalQuery ? `?${canonicalQuery}` : ""}`,
  );

  return {
    title: `${title} | ${BRAND_NAME}`,
    description,
    robots: buildListingRobots(filters),
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

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  const {
    params: resolvedParams,
    category,
    canonicalPath,
    canonicalQuery,
    legacyAliasPath,
    filters,
  } = await getCategoryRouteContext(params, searchParams);

  if (
    legacyAliasPath &&
    resolvedParams.category !== legacyAliasPath.replace(/^\//, "")
  ) {
    const aliasQuery = buildPropertyBrowserQuery(filters, {
      omitCity: false,
      omitPurpose: false,
    });
    permanentRedirect(
      `${legacyAliasPath}${aliasQuery ? `?${aliasQuery}` : ""}`,
    );
  }

  const canonicalSegment = canonicalPath.replace(/^\//, "");
  const redirectTarget = `${canonicalPath}${canonicalQuery ? `?${canonicalQuery}` : ""}`;

  if (resolvedParams.category !== canonicalSegment) {
    permanentRedirect(redirectTarget);
  }

  const title = buildListingTitle(filters);
  const description = buildListingDescription(filters);

  return (
    <PublicListingPage
      category={category}
      filters={filters as PropertySearchFilters}
      pathname={canonicalPath}
      pageUrl={toAbsoluteUrl(redirectTarget)}
      title={title}
      description={description}
    />
  );
}
