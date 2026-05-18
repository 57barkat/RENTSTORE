import type { Metadata } from "next";
import {
  notFound,
  permanentRedirect,
} from "next/navigation";

import PublicListingPage from "@/app/components/properties/PublicListingPage";
import AboutPage, {
  metadata as aboutMetadata,
} from "@/app/(public)/about/page";
import FaqPage, { metadata as faqMetadata } from "@/app/(public)/faq/page";
import GuidesPage, {
  metadata as guidesMetadata,
} from "@/app/(public)/guides/page";
import HowItWorksPage, {
  metadata as howItWorksMetadata,
} from "@/app/(public)/how-it-works/page";
import SafetyPage, {
  metadata as safetyMetadata,
} from "@/app/(public)/safety/page";
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
  parseSeoListingSlug,
} from "@/app/lib/property-seo";
import { toAbsoluteUrl } from "@/app/lib/site-config";

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const revalidate = 300;

const staticFooterPages = {
  about: {
    Component: AboutPage,
    metadata: aboutMetadata,
  },
  faq: {
    Component: FaqPage,
    metadata: faqMetadata,
  },
  guides: {
    Component: GuidesPage,
    metadata: guidesMetadata,
  },
  "how-it-works": {
    Component: HowItWorksPage,
    metadata: howItWorksMetadata,
  },
  safety: {
    Component: SafetyPage,
    metadata: safetyMetadata,
  },
} as const;

const getStaticFooterPage = (segment: string) =>
  staticFooterPages[segment as keyof typeof staticFooterPages];

const getCategoryRouteContext = async (
  paramsPromise: Promise<{ category: string }>,
  searchParamsPromise: Promise<{
    [key: string]: string | string[] | undefined;
  }>,
) => {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
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
    canonicalPath,
    canonicalQuery,
    filters,
  };
};

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const staticFooterPage = getStaticFooterPage(resolvedParams.category);

  if (staticFooterPage) {
    return staticFooterPage.metadata;
  }

  const { canonicalPath, canonicalQuery, filters } =
    await getCategoryRouteContext(Promise.resolve(resolvedParams), searchParams);
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
  const initialParams = await params;
  const staticFooterPage = getStaticFooterPage(initialParams.category);

  if (staticFooterPage) {
    const { Component } = staticFooterPage;
    return <Component />;
  }

  const {
    params: resolvedParams,
    category,
    canonicalPath,
    canonicalQuery,
    filters,
  } = await getCategoryRouteContext(Promise.resolve(initialParams), searchParams);

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
