import type { Metadata } from "next";
import { redirect } from "next/navigation";

import PropertyDetailContent from "@/app/components/properties/PropertyDetailContent";
import {
  buildPropertyDetailMetadata,
  resolvePropertyDetail,
} from "@/app/lib/property-detail";
import { BRAND_NAME } from "@/app/lib/property-utils";

interface PropertySlugPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PropertySlugPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const metadata = await buildPropertyDetailMetadata(resolvedParams.slug);

  return {
    title: `${metadata.title} | ${BRAND_NAME}`,
    description: metadata.description,
    alternates: {
      canonical: metadata.canonicalUrl,
    },
    openGraph: {
      title: `${metadata.title} | ${BRAND_NAME}`,
      description: metadata.description,
      type: "article",
      url: metadata.canonicalUrl,
      images: [{ url: metadata.imageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${metadata.title} | ${BRAND_NAME}`,
      description: metadata.description,
      images: [metadata.imageUrl],
    },
  };
}

export default async function PropertySlugPage({
  params,
}: PropertySlugPageProps) {
  const resolvedParams = await params;
  const detail = await resolvePropertyDetail(resolvedParams.slug);
  const currentPath = `/${resolvedParams.slug}`;

  if (detail.canonicalHref !== currentPath) {
    redirect(detail.canonicalHref);
  }

  return (
    <PropertyDetailContent
      category={detail.category}
      property={detail.property}
      canonicalHref={detail.canonicalHref}
    />
  );
}
