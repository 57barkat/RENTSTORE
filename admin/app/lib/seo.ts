import type { Metadata } from "next";

import type {
  PropertyCategory,
  PropertySearchFilters,
} from "@/app/lib/property-types";
import {
  BRAND_NAME,
  buildListingPath,
  getCategoryLabel,
} from "@/app/lib/property-utils";
import { toAbsoluteUrl } from "@/app/lib/site-config";

const hasNumericFilter = (value: number | "" | undefined) =>
  value !== "" && value !== undefined;

export const serializeJsonLd = (value: unknown) =>
  JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

export const isIndexableListingPage = (
  filters: PropertySearchFilters,
): boolean => {
  const hasSearchTerm = Boolean(filters.title?.trim());
  const hasPriceFilters =
    hasNumericFilter(filters.minRent) || hasNumericFilter(filters.maxRent);
  const hasSizeFilters =
    hasNumericFilter(filters.minSize) || hasNumericFilter(filters.maxSize);
  const hasAmenities = Boolean(filters.amenities?.length);
  const hasHostelSubtype = Boolean(filters.hostelType);
  const hasCustomSort = Boolean(filters.sortBy && filters.sortBy !== "newest");
  const isPaginated = Boolean((filters.page || 1) > 1);

  return !(
    hasSearchTerm ||
    hasPriceFilters ||
    hasSizeFilters ||
    hasAmenities ||
    hasHostelSubtype ||
    hasCustomSort ||
    isPaginated
  );
};

export const buildListingRobots = (
  filters: PropertySearchFilters,
): Metadata["robots"] => {
  const indexable = isIndexableListingPage(filters);

  return {
    index: indexable,
    follow: true,
    googleBot: {
      index: indexable,
      follow: true,
      noimageindex: !indexable,
    },
  };
};

type BreadcrumbItem = {
  name: string;
  href: string;
};

export const buildListingBreadcrumbs = (
  filters: PropertySearchFilters,
): BreadcrumbItem[] => {
  const items: BreadcrumbItem[] = [
    {
      name: "All Properties",
      href: "/",
    },
  ];

  if (filters.category !== "property") {
    items.push({
      name: getCategoryLabel(filters.category, true),
      href: buildListingPath(
        {
          category: filters.category,
          purpose: filters.purpose || "rent",
        },
        { preferSeo: true, rootForProperty: true },
      ),
    });
  }

  if (filters.city) {
    items.push({
      name: filters.city,
      href: buildListingPath(
        {
          ...filters,
          location: "",
        },
        { preferSeo: true, rootForProperty: true },
      ),
    });
  }

  if (filters.location && filters.city) {
    items.push({
      name: filters.location,
      href: buildListingPath(filters, {
        preferSeo: true,
        rootForProperty: true,
      }),
    });
  }

  return items;
};

export const buildBreadcrumbJsonLd = (items: BreadcrumbItem[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: toAbsoluteUrl(item.href),
  })),
});

export const buildPropertyBreadcrumbs = (
  category: PropertyCategory,
  city: string,
  area: string,
  canonicalHref: string,
  title: string,
): BreadcrumbItem[] => {
  const items: BreadcrumbItem[] = [
    {
      name: "All Properties",
      href: "/",
    },
  ];

  if (category !== "property") {
    items.push({
      name: getCategoryLabel(category, true),
      href: buildListingPath(
        {
          category,
          purpose: "rent",
        },
        { preferSeo: true, rootForProperty: true },
      ),
    });
  }

  if (city) {
    items.push({
      name: city,
      href: buildListingPath(
        {
          category,
          purpose: "rent",
          city,
          location: "",
          title: "",
          minRent: "",
          maxRent: "",
          minSize: "",
          maxSize: "",
          sizeUnit: "",
          amenities: [],
          hostelType: "",
          sortBy: "newest",
          page: 1,
          limit: 12,
        },
        { preferSeo: true, rootForProperty: true },
      ),
    });
  }

  if (city && area) {
    items.push({
      name: area,
      href: buildListingPath(
        {
          category,
          purpose: "rent",
          city,
          location: area,
          title: "",
          minRent: "",
          maxRent: "",
          minSize: "",
          maxSize: "",
          sizeUnit: "",
          amenities: [],
          hostelType: "",
          sortBy: "newest",
          page: 1,
          limit: 12,
        },
        { preferSeo: true, rootForProperty: true },
      ),
    });
  }

  items.push({
    name: title,
    href: canonicalHref,
  });

  return items;
};

export interface SeoFaqItem {
  question: string;
  answer: string;
}

export const buildListingSeoContent = (
  filters: PropertySearchFilters,
): {
  introTitle: string;
  introBody: string;
  faqs: SeoFaqItem[];
} | null => {
  const categoryLabel = getCategoryLabel(filters.category, true);
  const purposeLabel = filters.purpose === "sale" ? "sale" : "rent";
  const placeLabel = [filters.location, filters.city].filter(Boolean).join(", ");
  const genericPlace = filters.city || filters.location;

  if (!genericPlace && filters.category === "property") {
    return null;
  }

  const introTitle = placeLabel
    ? `${categoryLabel} for ${purposeLabel} in ${placeLabel}`
    : genericPlace
      ? `${categoryLabel} for ${purposeLabel} in ${genericPlace}`
      : `${categoryLabel} for ${purposeLabel}`;

  const introBody = placeLabel
    ? `Use this page to compare verified ${categoryLabel.toLowerCase()} in ${placeLabel}. Review photos, pricing frequency, amenities, and listing details before contacting the host or agency.`
    : genericPlace
      ? `Use this page to compare verified ${categoryLabel.toLowerCase()} in ${genericPlace}. Review photos, pricing frequency, amenities, and listing details before contacting the host or agency.`
      : `Use this page to compare verified ${categoryLabel.toLowerCase()} for ${purposeLabel}. Review photos, pricing frequency, amenities, and listing details before contacting the host or agency.`;

  const placeQuestionLabel = placeLabel || genericPlace || "this area";
  const categoryQuestionLabel = filters.category === "property"
    ? "rental listings"
    : categoryLabel.toLowerCase();

  const faqs: SeoFaqItem[] = [
    {
      question: `How do I compare ${categoryQuestionLabel} in ${placeQuestionLabel}?`,
      answer:
        "Use the filters and listing cards to compare price, size, amenities, photos, and property details before opening individual pages.",
    },
    {
      question: `What details are available on these ${categoryQuestionLabel}?`,
      answer:
        "Listings can include title, location, rent frequency, photos, size, beds, bathrooms, amenities, and host or agency contact context when provided by the backend.",
    },
    {
      question: `Can I narrow results for ${placeQuestionLabel}?`,
      answer:
        "Yes. You can filter by category, area, price range, size, amenities, and other route-supported options to focus on relevant listings.",
    },
  ];

  if (filters.location && filters.city) {
    faqs.push({
      question: `Why does this page focus on ${filters.location}, ${filters.city}?`,
      answer:
        "This page is generated from the current route and listing data so you can browse a specific neighborhood without mixing in unrelated cities or categories.",
    });
  }

  if (filters.category === "hostel" && filters.hostelType) {
    faqs.push({
      question: `Does this page support ${filters.hostelType} hostel filters?`,
      answer:
        "Yes. When hostel type data is available, the route and filter state can narrow results for male, female, or mixed hostel listings.",
    });
  }

  return {
    introTitle,
    introBody,
    faqs: faqs.slice(0, 5),
  };
};

export const getPublicStructuredData = () => ({
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND_NAME,
    url: toAbsoluteUrl("/"),
  },
  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND_NAME,
    url: toAbsoluteUrl("/"),
  },
});
