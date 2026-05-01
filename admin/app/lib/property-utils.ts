import type {
  HostelType,
  PropertyAddress,
  PropertyCategory,
  PropertyPurpose,
  PropertySearchFilters,
  PropertySort,
  PublicProperty,
  SizeUnit,
} from "@/app/lib/property-types";
import {
  buildPropertyDetailSlug,
  buildSeoListingSlug,
  canBuildSeoListingSlug,
  getSeoPropertyTypeForCategory,
  normalizeSeoArea,
  normalizePurpose,
  normalizeSeoCity,
} from "@/app/lib/property-seo";

const CATEGORY_ALIASES: Record<string, PropertyCategory> = {
  home: "home",
  house: "home",
  houses: "home",
  property: "property",
  properties: "property",
  apartment: "apartment",
  apartments: "apartment",
  hostel: "hostel",
  hostels: "hostel",
  shop: "shop",
  shops: "shop",
  office: "office",
  offices: "office",
};

const CATEGORY_SEGMENTS: Record<PropertyCategory, string> = {
  home: "houses",
  property: "properties",
  apartment: "apartments",
  hostel: "hostels",
  shop: "shops",
  office: "offices",
};

const SORT_VALUES: PropertySort[] = [
  "newest",
  "price_asc",
  "price_desc",
  "popular",
];

const HOSTEL_VALUES: HostelType[] = ["male", "female", "mixed"];

const SIZE_UNIT_VALUES: SizeUnit[] = ["Marla", "Kanal", "Sq. Ft.", "Sq. Yd."];

export const DEFAULT_PROPERTY_IMAGE = "/placeholder-property.svg";

export const BRAND_NAME = "AnganStay";

const toText = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => toText(item))
      .filter(Boolean)
      .join(", ");
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const directValue =
      toText(record.value) ||
      toText(record.name) ||
      toText(record.label) ||
      toText(record.highlighted);

    if (directValue) {
      return directValue;
    }
  }

  return String(value).trim();
};

const toSingleValue = (
  value: string | string[] | undefined,
): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

const toPositiveNumber = (value?: string): number | "" => {
  if (!value) {
    return "";
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : "";
};

export const normalizeCategorySegment = (
  category: string,
): PropertyCategory | null => {
  return CATEGORY_ALIASES[category.toLowerCase()] || null;
};

export const getCanonicalCategorySegment = (
  category: PropertyCategory,
): string => CATEGORY_SEGMENTS[category];

export const getCategoryLabel = (
  category: PropertyCategory,
  plural = false,
): string => {
  switch (category) {
    case "home":
      return plural ? "Houses" : "House";
    case "property":
      return plural ? "Properties" : "Property";
    case "apartment":
      return plural ? "Apartments" : "Apartment";
    case "hostel":
      return plural ? "Hostels" : "Hostel";
    case "shop":
      return plural ? "Shops" : "Shop";
    case "office":
      return plural ? "Offices" : "Office";
    default:
      return plural ? "Properties" : "Property";
  }
};

export const getCategoryKeyword = (category: PropertyCategory): string => {
  return getCanonicalCategorySegment(category).replace(/-/g, " ");
};

export const parsePropertySearchParams = (
  category: PropertyCategory,
  searchParams: Record<string, string | string[] | undefined>,
): PropertySearchFilters => {
  const hostelTypeValue = toSingleValue(searchParams.hostelType) || "";
  const sortValue = toSingleValue(searchParams.sortBy) || "newest";
  const cityValue = toSingleValue(searchParams.city) || "";
  const purposeValue = normalizePurpose(
    toSingleValue(searchParams.purpose) || "rent",
  );

  return {
    category,
    purpose: (purposeValue || "rent") as PropertyPurpose,
    title: toSingleValue(searchParams.title) || "",
    city: cityValue ? normalizeSeoCity(cityValue) : "",
    location: normalizeSeoArea(
      toSingleValue(searchParams.area) ||
        toSingleValue(searchParams.location) ||
        toSingleValue(searchParams.addressQuery) ||
        "",
    ),
    minRent:
      toPositiveNumber(toSingleValue(searchParams.minRent)) ||
      toPositiveNumber(toSingleValue(searchParams.minPrice)),
    maxRent:
      toPositiveNumber(toSingleValue(searchParams.maxRent)) ||
      toPositiveNumber(toSingleValue(searchParams.maxPrice)),
    minSize: toPositiveNumber(toSingleValue(searchParams.minSize)),
    maxSize: toPositiveNumber(toSingleValue(searchParams.maxSize)),
    sizeUnit: SIZE_UNIT_VALUES.includes(
      toSingleValue(searchParams.sizeUnit) as SizeUnit,
    )
      ? (toSingleValue(searchParams.sizeUnit) as SizeUnit)
      : "",
    amenities:
      (toSingleValue(searchParams.amenities) || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean) || [],
    hostelType: HOSTEL_VALUES.includes(hostelTypeValue as HostelType)
      ? (hostelTypeValue as HostelType)
      : "",
    sortBy: SORT_VALUES.includes(sortValue as PropertySort)
      ? (sortValue as PropertySort)
      : "newest",
    page: Math.max(1, Number(toSingleValue(searchParams.page) || "1")),
    limit: 12,
  };
};

export const buildPropertySearchQuery = (
  filters: PropertySearchFilters,
): string => {
  const params = new URLSearchParams();

  if (filters.category !== "property") {
    params.set("hostOption", filters.category);
  }
  params.set("page", String(filters.page || 1));
  params.set("limit", String(filters.limit || 12));
  params.set("sortBy", filters.sortBy || "newest");

  if (filters.purpose) {
    params.set("purpose", filters.purpose);
  }

  if (filters.title) {
    params.set("title", filters.title);
  }

  if (filters.city) {
    params.set("city", filters.city);
  }

  if (filters.location) {
    params.set("area", filters.location);
  }

  if (filters.minRent !== "" && filters.minRent !== undefined) {
    params.set("minRent", String(filters.minRent));
  }

  if (filters.maxRent !== "" && filters.maxRent !== undefined) {
    params.set("maxRent", String(filters.maxRent));
  }

  if (filters.minSize !== "" && filters.minSize !== undefined) {
    params.set("minSize", String(filters.minSize));
  }

  if (filters.maxSize !== "" && filters.maxSize !== undefined) {
    params.set("maxSize", String(filters.maxSize));
  }

  if (filters.sizeUnit) {
    params.set("sizeUnit", filters.sizeUnit);
  }

  if (filters.amenities?.length) {
    params.set("amenities", filters.amenities.join(","));
  }

  if (filters.hostelType) {
    params.set("hostelType", filters.hostelType);
  }

  return params.toString();
};

export const buildPropertyBrowserQuery = (
  filters: PropertySearchFilters,
  options?: {
    omitCity?: boolean;
    omitPurpose?: boolean;
    omitLocation?: boolean;
  },
): string => {
  const params = new URLSearchParams();

  if (filters.city && !options?.omitCity) {
    params.set("city", filters.city);
  }

  if (filters.purpose && filters.purpose !== "rent" && !options?.omitPurpose) {
    params.set("purpose", filters.purpose);
  }

  if (filters.title) {
    params.set("title", filters.title);
  }

  if (filters.location && !options?.omitLocation) {
    params.set("location", filters.location);
  }

  if (filters.minRent !== "" && filters.minRent !== undefined) {
    params.set("minRent", String(filters.minRent));
  }

  if (filters.maxRent !== "" && filters.maxRent !== undefined) {
    params.set("maxRent", String(filters.maxRent));
  }

  if (filters.minSize !== "" && filters.minSize !== undefined) {
    params.set("minSize", String(filters.minSize));
  }

  if (filters.maxSize !== "" && filters.maxSize !== undefined) {
    params.set("maxSize", String(filters.maxSize));
  }

  if (filters.sizeUnit) {
    params.set("sizeUnit", filters.sizeUnit);
  }

  if (filters.amenities?.length) {
    params.set("amenities", filters.amenities.join(","));
  }

  if (filters.hostelType) {
    params.set("hostelType", filters.hostelType);
  }

  if (filters.sortBy && filters.sortBy !== "newest") {
    params.set("sortBy", filters.sortBy);
  }

  if (filters.page && filters.page > 1) {
    params.set("page", String(filters.page));
  }

  return params.toString();
};

export const buildSearchHref = (
  pathname: string,
  filters: PropertySearchFilters,
  options?: {
    omitCity?: boolean;
    omitPurpose?: boolean;
    omitLocation?: boolean;
  },
): string => {
  const query = buildPropertyBrowserQuery(filters, options);
  return query ? `${pathname}?${query}` : pathname;
};

export const canUseSeoListingPath = (filters: PropertySearchFilters): boolean =>
  canBuildSeoListingSlug({
    category: filters.category,
    purpose: filters.purpose || "rent",
    city: filters.city,
    area: filters.location,
  });

export const buildListingPath = (
  filters: PropertySearchFilters,
  options?: {
    preferSeo?: boolean;
    rootForProperty?: boolean;
  },
): string => {
  if (options?.rootForProperty && filters.category === "property") {
    return "/";
  }

  if (options?.preferSeo && canUseSeoListingPath(filters)) {
    const seoSegment = buildSeoListingSlug({
      category: filters.category,
      purpose: filters.purpose || "rent",
      city: filters.city,
      area: filters.location,
      propertyType:
        getSeoPropertyTypeForCategory(filters.category) || undefined,
    });

    if (seoSegment) {
      return `/${seoSegment}`;
    }
  }

  return `/${getCanonicalCategorySegment(filters.category)}`;
};

export const getPropertyAddresses = (
  property: PublicProperty,
): PropertyAddress[] => {
  if (!property.address) {
    return [];
  }

  return Array.isArray(property.address)
    ? property.address
    : [property.address];
};

export const getPropertyCategory = (
  property: PublicProperty,
): PropertyCategory => {
  return (
    normalizeCategorySegment(
      toText(property.hostOption || property.propertyType || "home"),
    ) || "home"
  );
};

export const getPropertyCity = (property: PublicProperty): string => {
  return toText(getPropertyAddresses(property)[0]?.city) || "Islamabad";
};

export const getPropertyLocation = (property: PublicProperty): string => {
  return toText(property.area || property.location) || "Prime location";
};

export const getPropertyPurpose = (
  property: PublicProperty,
): PropertyPurpose => {
  return property.defaultRentType ||
    property.monthlyRent ||
    property.weeklyRent ||
    property.dailyRent
    ? "rent"
    : "sale";
};

export const getPropertyTitle = (property: PublicProperty): string => {
  return (
    toText(property.title) ||
    `${getCategoryLabel(getPropertyCategory(property))} in ${getPropertyCity(property)}`
  );
};

export const getPropertyHighlights = (property: PublicProperty): string[] => {
  if (typeof property.description === "string") {
    return [];
  }

  return (property.description?.highlighted || [])
    .map((item) => toText(item))
    .filter(Boolean);
};

export const getPropertyDescriptionText = (
  property: PublicProperty,
  maxLength = 180,
): string => {
  const raw =
    typeof property.description === "string"
      ? property.description
      : toText(property.description?.value) ||
        getPropertyHighlights(property).join(" ");

  const normalized = (
    raw ||
    `Browse ${getCategoryLabel(
      getPropertyCategory(property),
      true,
    ).toLowerCase()} in ${getPropertyCity(property)} with verified prices and amenity details.`
  )
    .replace(/\s+/g, " ")
    .trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trim()}...`;
};

const toPositivePrice = (value?: number | null): number | null => {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
    return null;
  }

  return value;
};

export type PropertyPriceFrequency = "daily" | "weekly" | "monthly" | null;

export interface PropertyPriceInfo {
  amount: number | null;
  frequency: PropertyPriceFrequency;
  label: string;
  suffix: string | null;
  schemaUnitText: string | null;
  schemaUnitCode: string | null;
}

export const formatPriceAmount = (amount: number): string => {
  return `Rs. ${new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
};

const buildPriceInfo = (
  frequency: Exclude<PropertyPriceFrequency, null>,
  amount: number,
): PropertyPriceInfo => {
  switch (frequency) {
    case "monthly":
      return {
        amount,
        frequency,
        label: "Monthly rent",
        suffix: "/ mo",
        schemaUnitText: "month",
        schemaUnitCode: "MON",
      };
    case "weekly":
      return {
        amount,
        frequency,
        label: "Weekly rent",
        suffix: "/ wk",
        schemaUnitText: "week",
        schemaUnitCode: "WEE",
      };
    case "daily":
      return {
        amount,
        frequency,
        label: "Daily rate",
        suffix: "/ day",
        schemaUnitText: "day",
        schemaUnitCode: "DAY",
      };
    default:
      return {
        amount,
        frequency: "monthly",
        label: "Monthly rent",
        suffix: "/ mo",
        schemaUnitText: "month",
        schemaUnitCode: "MON",
      };
  }
};

export const getPropertyPricingOptions = (
  property: PublicProperty,
): PropertyPriceInfo[] => {
  const preferredFrequency =
    property.defaultRentType === "daily" ||
    property.defaultRentType === "weekly" ||
    property.defaultRentType === "monthly"
      ? property.defaultRentType
      : "monthly";

  const priceMap = [
    preferredFrequency,
    ...(["monthly", "weekly", "daily"] as const).filter(
      (frequency) => frequency !== preferredFrequency,
    ),
  ].map((frequency) => ({
    frequency,
    amount: toPositivePrice(
      frequency === "monthly"
        ? property.monthlyRent
        : frequency === "weekly"
          ? property.weeklyRent
          : property.dailyRent,
    ),
  }));

  return priceMap
    .filter(
      (
        option,
      ): option is {
        frequency: Exclude<PropertyPriceFrequency, null>;
        amount: number;
      } => option.amount !== null,
    )
    .map((option) => buildPriceInfo(option.frequency, option.amount));
};

export const getPropertyPriceInfo = (
  property: PublicProperty,
): PropertyPriceInfo => {
  return (
    getPropertyPricingOptions(property)[0] || {
      amount: null,
      frequency: null,
      label: "Pricing",
      suffix: null,
      schemaUnitText: null,
      schemaUnitCode: null,
    }
  );
};

export const getPropertyPrice = (property: PublicProperty): number => {
  return getPropertyPriceInfo(property).amount || 0;
};

export const getPropertyPriceDisplay = (property: PublicProperty): string => {
  const priceInfo = getPropertyPriceInfo(property);

  if (!priceInfo.amount) {
    return "Contact for Price";
  }

  return `${formatPriceAmount(priceInfo.amount)} ${priceInfo.suffix}`.trim();
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const buildPropertyIdSegment = (propertyId: string): string => {
  return `property-${propertyId}`;
};

export const extractPropertyId = (segment: string): string | null => {
  const match = segment.match(/([a-f0-9]{24})$/i);
  return match?.[1] || null;
};

export const buildPropertyHref = (property: PublicProperty): string => {
  const normalizedCategory = getPropertyCategory(property);
  const propertyHrefSlug = buildPropertyDetailSlug({
    title: getPropertyTitle(property),
    propertyType:
      getSeoPropertyTypeForCategory(normalizedCategory) || undefined,
    purpose: getPropertyPurpose(property),
    area: getPropertyLocation(property),
    city: getPropertyCity(property),
    sizeValue: property.size?.value,
    sizeUnit: property.size?.unit,
    hostelType: property.hostelType,
    propertyId: property._id,
  });

  if (propertyHrefSlug) {
    return `/${propertyHrefSlug}`;
  }

  return `/${getCanonicalCategorySegment(normalizedCategory)}/${slugify(
    getPropertyCity(property),
  )}/${slugify(getPropertyLocation(property))}/${buildPropertyIdSegment(
    property._id,
  )}`;
};

export const buildListingTitle = (filters: PropertySearchFilters): string => {
  const purposeLabel = filters.purpose === "sale" ? "Sale" : "Rent";
  const categoryLabel = getCategoryLabel(filters.category, true);

  if (filters.category === "property") {
    if (filters.location && filters.city) {
      return `Properties for ${purposeLabel} in ${filters.location}, ${filters.city}`;
    }

    if (filters.location) {
      return `Properties for ${purposeLabel} in ${filters.location}`;
    }

    if (filters.city) {
      return `Properties for ${purposeLabel} in ${filters.city}`;
    }

    return `Properties for ${purposeLabel} in Pakistan`;
  }

  const city = filters.city || "Islamabad";
  const location = filters.location ? `${filters.location} ` : "";
  const purposeSuffix = filters.purpose === "sale" ? "sale" : "rent";

  return `${categoryLabel} for ${purposeSuffix} in ${location}${city}`;
};

export const buildListingDescription = (
  filters: PropertySearchFilters,
  totalResults?: number,
): string => {
  if (filters.category === "property") {
    if (!filters.city && !filters.location) {
      return "Browse houses, apartments, hostels, shops and offices for rent across Pakistan.";
    }

    const resultPrefix =
      typeof totalResults === "number"
        ? `${totalResults} ${totalResults === 1 ? "listing" : "listings"}`
        : "Verified listings";
    const purposeLabel = filters.purpose === "sale" ? "sale" : "rent";

    if (filters.location && filters.city) {
      return `${resultPrefix} for ${purposeLabel} in ${filters.location}, ${filters.city} across houses, apartments, hostels, shops, and offices. Narrow results by price, size, and amenities to find the right fit faster.`;
    }

    if (filters.city) {
      return `${resultPrefix} for ${purposeLabel} in ${filters.city} across houses, apartments, hostels, shops, and offices. Narrow results by price, size, and amenities to find the right fit faster.`;
    }

    return `${resultPrefix} across houses, apartments, hostels, shops, and offices for ${purposeLabel}. Narrow results by price, size, and amenities to find the right fit faster.`;
  }

  const resultPrefix =
    typeof totalResults === "number"
      ? `${totalResults} ${totalResults === 1 ? "listing" : "listings"}`
      : "Verified listings";

  const category = getCategoryKeyword(filters.category);
  const city = filters.city || "Islamabad";
  const purposeLabel = filters.purpose === "sale" ? "sale" : "rent";
  const location = filters.location
    ? `in ${filters.location}, ${city}`
    : "across prime locations";

  return filters.location
    ? `${resultPrefix} for ${category} for ${purposeLabel} ${location}. Find the right match by filtering for price, amenities, and specific neighborhoods with our up-to-date inventory.`
    : `${resultPrefix} for ${category} for ${purposeLabel} in ${city} ${location}. Find the right match by filtering for price, amenities, and specific neighborhoods with our up-to-date inventory.`;
};

export const buildPropertyMetadataTitle = (
  category: PropertyCategory,
  property: PublicProperty,
): string => {
  return `${getPropertyTitle(property)} for ${getPropertyPurpose(
    property,
  )} in ${getPropertyLocation(property)} ${getPropertyCity(property)}`;
};

export const buildPropertyMetadataDescription = (
  category: PropertyCategory,
  property: PublicProperty,
): string => {
  const priceDisplay = getPropertyPriceDisplay(property);
  const title = getPropertyTitle(property);
  const location = getPropertyLocation(property);
  const city = getPropertyCity(property);

  return `Find ${title.toLowerCase()} for ${getPropertyPurpose(
    property,
  )} in ${location} ${city}. ${
    priceDisplay === "Contact for Price"
      ? "Verified listing, contact host directly."
      : `${priceDisplay}, verified listing, contact host directly.`
  }`;
};

export const getPropertyContactPhone = (property: PublicProperty): string => {
  if (property.owner?.phone) {
    return property.owner.phone;
  }

  if (typeof property.ownerId === "object" && property.ownerId?.phone) {
    return property.ownerId.phone;
  }

  return "";
};

export const hasAllBillsIncluded = (property: PublicProperty): boolean => {
  return (property.ALL_BILLS || []).length > 0;
};
