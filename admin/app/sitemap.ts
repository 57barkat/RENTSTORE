import type { MetadataRoute } from "next";

import { PropertyService } from "@/app/lib/PropertyService";
import type { PropertyCategory, PublicProperty } from "@/app/lib/property-types";
import {
  buildPropertyHref,
  getCanonicalCategorySegment,
  getPropertyCity,
} from "@/app/lib/property-utils";

const SITE_URL = (
  process.env.SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000"
).replace(/\/$/, "");

const CATEGORIES: PropertyCategory[] = ["hostel", "apartment", "home"];

const withBaseUrl = (path: string): string => {
  return `${SITE_URL}${path}`;
};

const getCategoryProperties = async (
  category: PropertyCategory,
): Promise<PublicProperty[]> => {
  const collected: PublicProperty[] = [];
  let currentPage = 1;
  let totalPages = 1;

  do {
    const response = await PropertyService.searchProperties({
      category,
      page: currentPage,
      limit: 100,
      sortBy: "newest",
    });

    collected.push(...response.data);
    totalPages = Math.max(response.totalPages || 1, 1);
    currentPage += 1;
  } while (currentPage <= totalPages);

  return collected;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: withBaseUrl("/"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  const seenUrls = new Set<string>(entries.map((entry) => entry.url));

  for (const category of CATEGORIES) {
    const categoryPath = `/${getCanonicalCategorySegment(category)}`;
    if (!seenUrls.has(withBaseUrl(categoryPath))) {
      entries.push({
        url: withBaseUrl(categoryPath),
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      });
      seenUrls.add(withBaseUrl(categoryPath));
    }

    const properties = await getCategoryProperties(category);
    const seenCities = new Set<string>();

    for (const property of properties) {
      const city = getPropertyCity(property);
      const cityKey = city.toLowerCase();

      if (!seenCities.has(cityKey)) {
        const cityUrl = withBaseUrl(
          `${categoryPath}?city=${encodeURIComponent(city)}`,
        );
        entries.push({
          url: cityUrl,
          lastModified: new Date(),
          changeFrequency: "daily",
          priority: 0.8,
        });
        seenCities.add(cityKey);
      }

      const propertyPath = buildPropertyHref(property);
      const propertyUrl = withBaseUrl(propertyPath);
      if (!seenUrls.has(propertyUrl)) {
        entries.push({
          url: propertyUrl,
          lastModified: property.updatedAt || property.createdAt || new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        });
        seenUrls.add(propertyUrl);
      }

    }
  }

  return entries;
}
