import type { Metadata } from "next";

import PublicListingPage from "@/app/components/properties/PublicListingPage";
import {
  BRAND_NAME,
  buildListingDescription,
  buildListingTitle,
  buildPropertyBrowserQuery,
  parsePropertySearchParams,
} from "@/app/lib/property-utils";
import { toAbsoluteUrl } from "@/app/lib/site-config";

interface HomePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  searchParams,
}: HomePageProps): Promise<Metadata> {
  const filters = parsePropertySearchParams("property", await searchParams);
  const title =
    !filters.city && !filters.location && filters.purpose !== "sale"
      ? `Properties for Rent in Pakistan | ${BRAND_NAME}`
      : `${buildListingTitle(filters)} | ${BRAND_NAME}`;
  const description = buildListingDescription(filters);
  const query = buildPropertyBrowserQuery(filters);
  const canonicalUrl = toAbsoluteUrl(query ? `/?${query}` : "/");

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const filters = parsePropertySearchParams("property", await searchParams);
  const query = buildPropertyBrowserQuery(filters);
  const pathname = "/";
  const pageUrl = toAbsoluteUrl(query ? `/?${query}` : pathname);
  const title = buildListingTitle(filters);
  const description = buildListingDescription(filters);

  return (
    <PublicListingPage
      category="property"
      filters={filters}
      pathname={pathname}
      pageUrl={pageUrl}
      title={title}
      description={description}
    />
  );
}
