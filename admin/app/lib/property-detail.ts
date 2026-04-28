import { notFound } from "next/navigation";

import { PropertyService } from "@/app/lib/PropertyService";
import type { PropertyCategory, PublicProperty } from "@/app/lib/property-types";
import {
  DEFAULT_PROPERTY_IMAGE,
  buildPropertyHref,
  buildPropertyMetadataDescription,
  buildPropertyMetadataTitle,
  extractPropertyId,
  getPropertyCategory,
} from "@/app/lib/property-utils";
import { getCategoryForSeoPropertyType, parsePropertyDetailSlug } from "@/app/lib/property-seo";
import { toAbsoluteUrl } from "@/app/lib/site-config";

export interface ResolvedPropertyDetail {
  category: PropertyCategory;
  property: PublicProperty;
  canonicalHref: string;
}

const findPropertyFromShortSlug = async (
  routeValue: string,
  parsedSlug: NonNullable<ReturnType<typeof parsePropertyDetailSlug>>,
): Promise<PublicProperty | null> => {
  const normalizedRouteValue = routeValue.toLowerCase();
  const category =
    getCategoryForSeoPropertyType(parsedSlug.propertyType || "property") || "property";
  const candidateFilters = [
    {
      category,
      purpose: parsedSlug.purpose || "rent",
      location: parsedSlug.locationHint || "",
      city: "",
      page: 1,
      limit: 100,
      sortBy: "newest" as const,
    },
    {
      category,
      purpose: parsedSlug.purpose || "rent",
      location: "",
      city: "",
      page: 1,
      limit: 100,
      sortBy: "newest" as const,
    },
  ];

  for (const filters of candidateFilters) {
    const response = await PropertyService.searchProperties(filters);
    const canonicalMatch = response.data.find(
      (candidate) => buildPropertyHref(candidate).replace(/^\//, "").toLowerCase() === normalizedRouteValue,
    );

    if (canonicalMatch) {
      return canonicalMatch;
    }

    const prefixMatch = response.data.find((candidate) =>
      candidate._id.toLowerCase().startsWith(parsedSlug.propertyId.toLowerCase()),
    );

    if (prefixMatch) {
      return prefixMatch;
    }
  }

  return null;
};

export const resolvePropertyDetail = async (
  routeValue: string,
): Promise<ResolvedPropertyDetail> => {
  const parsedSlug = parsePropertyDetailSlug(routeValue);
  const propertyId = parsedSlug?.propertyId || extractPropertyId(routeValue);

  if (!propertyId) {
    notFound();
  }

  const property =
    parsedSlug?.isShortId && propertyId.length === 6
      ? await findPropertyFromShortSlug(routeValue, parsedSlug)
      : await PropertyService.getPropertyByRouteId(propertyId);

  if (!property) {
    notFound();
  }

  const category = getPropertyCategory(property);

  return {
    category,
    property,
    canonicalHref: buildPropertyHref(property),
  };
};

export const buildPropertyDetailMetadata = async (routeValue: string) => {
  const { category, property, canonicalHref } = await resolvePropertyDetail(routeValue);
  const title = buildPropertyMetadataTitle(category, property);
  const description = buildPropertyMetadataDescription(category, property);
  const image = property.photos?.[0] || DEFAULT_PROPERTY_IMAGE;
  const canonicalUrl = toAbsoluteUrl(canonicalHref);
  const imageUrl = toAbsoluteUrl(image);

  return {
    title,
    description,
    canonicalUrl,
    imageUrl,
  };
};
