import type { MetadataRoute } from "next";

import { PropertyService } from "@/app/lib/PropertyService";
import type { PropertyCategory, PublicProperty } from "@/app/lib/property-types";
import {
  buildListingPath,
  buildPropertyHref,
  getPropertyAddresses,
} from "@/app/lib/property-utils";
import { toAbsoluteUrl } from "@/app/lib/site-config";

const CATEGORIES: PropertyCategory[] = [
  "property",
  "hostel",
  "apartment",
  "home",
  "shop",
  "office",
];

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

const getRawPropertyCity = (property: PublicProperty) =>
  getPropertyAddresses(property)[0]?.city?.trim() || "";

const getRawPropertyArea = (property: PublicProperty) =>
  String(property.area || property.location || "").trim();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: toAbsoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: toAbsoluteUrl("/popular-locations"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  const seenUrls = new Set<string>(entries.map((entry) => entry.url));
  const seenListingUrls = new Set<string>();

  for (const category of CATEGORIES) {
    const categoryPath = buildListingPath(
      {
        category,
        purpose: "rent",
      },
      { preferSeo: true },
    );
    const categoryUrl = toAbsoluteUrl(categoryPath);

    if (!seenUrls.has(categoryUrl)) {
      entries.push({
        url: categoryUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      });
      seenUrls.add(categoryUrl);
    }

    const properties =
      category === "property"
        ? (
            await Promise.all(
              (["hostel", "apartment", "home", "shop", "office"] as PropertyCategory[]).map(
                (item) => getCategoryProperties(item),
              ),
            )
          ).flat()
        : await getCategoryProperties(category);
    const seenCities = new Set<string>();

    for (const property of properties) {
      const city = getRawPropertyCity(property);
      const area = getRawPropertyArea(property);
      const cityKey = city.toLowerCase();

      if (city && !seenCities.has(cityKey)) {
        const cityUrl = toAbsoluteUrl(
          buildListingPath(
            {
              category,
              purpose: "rent",
              city,
              page: 1,
              limit: 12,
              sortBy: "newest",
            },
            { preferSeo: true },
          ),
        );
        if (!seenListingUrls.has(cityUrl)) {
          entries.push({
            url: cityUrl,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.8,
          });
          seenListingUrls.add(cityUrl);
        }
        seenCities.add(cityKey);
      }

      if (city && area) {
        const areaUrl = toAbsoluteUrl(
          buildListingPath(
            {
              category,
              purpose: "rent",
              city,
              location: area,
              page: 1,
              limit: 12,
              sortBy: "newest",
            },
            { preferSeo: true },
          ),
        );

        if (!seenListingUrls.has(areaUrl)) {
          entries.push({
            url: areaUrl,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.75,
          });
          seenListingUrls.add(areaUrl);
        }
      }

      const propertyPath = buildPropertyHref(property);
      const propertyUrl = toAbsoluteUrl(propertyPath);
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
