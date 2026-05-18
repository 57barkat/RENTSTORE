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
  getPropertyPrimaryPhoto,
} from "@/app/lib/property-utils";
import { parsePropertyDetailSlug } from "@/app/lib/property-seo";
import { toAbsoluteUrl } from "@/app/lib/site-config";

export interface ResolvedPropertyDetail {
  category: PropertyCategory;
  property: PublicProperty;
  canonicalHref: string;
}

export const resolvePropertyDetail = async (
  routeValue: string,
): Promise<ResolvedPropertyDetail> => {
  const parsedSlug = parsePropertyDetailSlug(routeValue);
  const propertyId = parsedSlug?.propertyId || extractPropertyId(routeValue);

  console.log("[property-detail-debug] resolving property detail", {
    routeValue,
    parsedSlug,
    extractedPropertyId: propertyId,
  });

  if (!propertyId) {
    console.log("[property-detail-debug] missing property id", { routeValue });
    notFound();
  }

  const property = await PropertyService.getPropertyByRouteId(propertyId);

  if (!property) {
    console.log("[property-detail-debug] property not found", {
      routeValue,
      propertyId,
      parsedSlug,
    });
    notFound();
  }

  const category = getPropertyCategory(property);
  const canonicalHref = buildPropertyHref(property);

  console.log("[property-detail-debug] property resolved", {
    routeValue,
    propertyId,
    resolvedId: property._id,
    category,
    canonicalHref,
  });

  return {
    category,
    property,
    canonicalHref,
  };
};

export const buildPropertyDetailMetadata = async (routeValue: string) => {
  const { category, property, canonicalHref } = await resolvePropertyDetail(routeValue);
  const title = buildPropertyMetadataTitle(category, property);
  const description = buildPropertyMetadataDescription(category, property);
  const image = getPropertyPrimaryPhoto(property) || DEFAULT_PROPERTY_IMAGE;
  const canonicalUrl = toAbsoluteUrl(canonicalHref);
  const imageUrl = toAbsoluteUrl(image);

  return {
    title,
    description,
    canonicalUrl,
    imageUrl,
  };
};
