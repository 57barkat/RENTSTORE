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

export const DEFAULT_PROPERTY_IMAGE = "/placeholder-property.jpg";

export const BRAND_NAME = "AnganStay";

const READABLE_LABEL_OVERRIDES: Record<string, string> = {
  ac: "AC",
  bbq: "BBQ",
  cctv: "CCTV",
  cng: "CNG",
  id: "ID",
  tv: "TV",
  wifi: "WiFi",
  wi_fi: "WiFi",
  "wi-fi": "WiFi",
};

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

export const formatReadableLabel = (value: unknown): string => {
  const raw = toText(value).replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();

  if (!raw) {
    return "";
  }

  return raw
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      const normalized = word.toLowerCase();
      const override = READABLE_LABEL_OVERRIDES[normalized];

      if (override) {
        return override;
      }

      if (/^\d/.test(word)) {
        return word;
      }

      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
};

export const getPropertyPhotoUrls = (
  property: Pick<PublicProperty, "photos">,
): string[] =>
  (property.photos || [])
    .map((photo) => (typeof photo === "string" ? photo.trim() : ""))
    .filter(Boolean);

export const getPropertyPrimaryPhoto = (
  property: Pick<PublicProperty, "photos">,
): string => getPropertyPhotoUrls(property)[0] || "";

export const getPropertyImageUrls = (
  property: Pick<PublicProperty, "photos">,
): string[] => {
  const photos = getPropertyPhotoUrls(property);

  return photos.length > 0 ? photos : [DEFAULT_PROPERTY_IMAGE];
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
  const furnishingValue = toSingleValue(searchParams.furnishing) || "";
  const parkingValue = toSingleValue(searchParams.parking) || "";
  const familyFriendlyValue = toSingleValue(searchParams.familyFriendly) || "";
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
    bedrooms: toPositiveNumber(toSingleValue(searchParams.bedrooms)),
    bathrooms: toPositiveNumber(toSingleValue(searchParams.bathrooms)),
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
    furnishing: ["furnished", "semi-furnished", "unfurnished"].includes(
      furnishingValue,
    )
      ? (furnishingValue as PropertySearchFilters["furnishing"])
      : "",
    parking:
      parkingValue === "true" ? true : parkingValue === "false" ? false : "",
    familyFriendly: familyFriendlyValue === "true" ? true : "",
    sortBy: SORT_VALUES.includes(sortValue as PropertySort)
      ? (sortValue as PropertySort)
      : "newest",
    page: Math.max(1, Number(toSingleValue(searchParams.page) || "1")),
    limit: 10,
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
  params.set("limit", String(filters.limit || 10));
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

  if (filters.bedrooms !== "" && filters.bedrooms !== undefined) {
    params.set("bedrooms", String(filters.bedrooms));
  }

  if (filters.bathrooms !== "" && filters.bathrooms !== undefined) {
    params.set("bathrooms", String(filters.bathrooms));
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

  if (filters.furnishing) {
    params.set("furnishing", filters.furnishing);
  }

  if (filters.parking !== "" && filters.parking !== undefined) {
    params.set("parking", String(filters.parking));
  }

  if (filters.familyFriendly === true) {
    params.set("familyFriendly", "true");
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

  if (filters.bedrooms !== "" && filters.bedrooms !== undefined) {
    params.set("bedrooms", String(filters.bedrooms));
  }

  if (filters.bathrooms !== "" && filters.bathrooms !== undefined) {
    params.set("bathrooms", String(filters.bathrooms));
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

  if (filters.furnishing) {
    params.set("furnishing", filters.furnishing);
  }

  if (filters.parking !== "" && filters.parking !== undefined) {
    params.set("parking", String(filters.parking));
  }

  if (filters.familyFriendly === true) {
    params.set("familyFriendly", "true");
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
  return toText(getPropertyAddresses(property)[0]?.city);
};

export const getPropertyLocation = (property: PublicProperty): string => {
  return toText(property.area || property.location);
};

export const getPropertyLocationLabel = (property: PublicProperty): string => {
  return [getPropertyLocation(property), getPropertyCity(property)]
    .filter(Boolean)
    .join(", ");
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
  const directTitle = toText(property.title);

  if (directTitle) {
    return directTitle;
  }

  const city = getPropertyCity(property);

  if (city) {
    return `${getCategoryLabel(getPropertyCategory(property))} in ${city}`;
  }

  return "Property Details";
};

export const getPropertyHighlights = (property: PublicProperty): string[] => {
  if (typeof property.description === "string") {
    return [];
  }

  return (property.description?.highlighted || [])
    .map((item) => toText(item))
    .filter(Boolean);
};

const getDirectPropertyDescription = (property: PublicProperty): string => {
  if (typeof property.description === "string") {
    return toText(property.description);
  }

  return (
    toText(property.description?.value) ||
    toText(property.description?.text) ||
    toText(property.description?.body) ||
    toText(property.description?.summary)
  );
};

export const buildPropertyDescriptionFallback = (
  property: PublicProperty,
): string => {
  const title = getPropertyTitle(property);
  const categoryLabel = getCategoryLabel(
    getPropertyCategory(property),
  ).toLowerCase();
  const locationLabel = getPropertyLocationLabel(property);
  const capacity = property.capacityState || {};
  const rooms =
    capacity.bedrooms && capacity.bathrooms
      ? `${capacity.bedrooms} room${capacity.bedrooms === 1 ? "" : "s"} and ${capacity.bathrooms} bath${capacity.bathrooms === 1 ? "" : "s"}`
      : capacity.bedrooms
        ? `${capacity.bedrooms} room${capacity.bedrooms === 1 ? "" : "s"}`
        : capacity.Persons
          ? `space for ${capacity.Persons} guest${capacity.Persons === 1 ? "" : "s"}`
          : "";
  const amenities = (property.amenities || [])
    .map(formatReadableLabel)
    .filter(Boolean)
    .slice(0, 3);
  const highlights = getPropertyHighlights(property)
    .map(formatReadableLabel)
    .filter(Boolean)
    .slice(0, 2);
  const featureParts = [...amenities, ...highlights];
  const lead = locationLabel
    ? `${title} is a verified ${categoryLabel} available in ${locationLabel}.`
    : `${title} is a verified ${categoryLabel} available on AnganStay.`;
  const details = [
    rooms ? `It includes ${rooms}` : "",
    featureParts.length
      ? `with ${featureParts.join(", ").toLowerCase()} among its key features`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return details
    ? `${lead} ${details}. Contact the host to confirm availability, visit timing, and rental terms.`
    : `${lead} Contact the host to confirm availability, visit timing, and rental terms.`;
};

export const getPropertyDescriptionText = (
  property: PublicProperty,
  maxLength = 180,
): string => {
  const raw =
    getDirectPropertyDescription(property) ||
    buildPropertyDescriptionFallback(property);

  const normalized = raw.replace(/\s+/g, " ").trim();

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
        suffix: "/ month",
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
        suffix: "/ month",
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
  const fallbackCity = getPropertyCity(property) || "pakistan";
  const fallbackLocation = getPropertyLocation(property) || "details";
  const propertyHrefSlug = buildPropertyDetailSlug({
    title: getPropertyTitle(property),
    propertyType:
      getSeoPropertyTypeForCategory(normalizedCategory) || undefined,
    purpose: getPropertyPurpose(property),
    area: fallbackLocation,
    city: fallbackCity,
    sizeValue: property.size?.value,
    sizeUnit: property.size?.unit,
    hostelType: property.hostelType,
    propertyId: property._id,
  });

  if (propertyHrefSlug) {
    return `/${propertyHrefSlug}`;
  }

  return `/${getCanonicalCategorySegment(normalizedCategory)}/${slugify(
    fallbackCity,
  )}/${slugify(fallbackLocation)}/${buildPropertyIdSegment(property._id)}`;
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

    return `Properties for ${purposeLabel} in Islamabad `;
  }

  const city = filters.city;
  const location = filters.location ? `${filters.location} ` : "";
  const purposeSuffix = filters.purpose === "sale" ? "sale" : "rent";

  if (location && city) {
    return `${categoryLabel} for ${purposeSuffix} in ${location}${city}`;
  }

  if (city) {
    return `${categoryLabel} for ${purposeSuffix} in ${city}`;
  }

  if (filters.location) {
    return `${categoryLabel} for ${purposeSuffix} in ${filters.location}`;
  }

  return `${categoryLabel} for ${purposeSuffix}`;
};

export const buildListingDescription = (
  filters: PropertySearchFilters,
  totalResults?: number,
): string => {
  if (filters.category === "property") {
    if (!filters.city && !filters.location) {
      return "Find verified rentals in Islamabad. AnganStay is currently focused on these cities, with more cities coming soon.";
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
  const city = filters.city;
  const purposeLabel = filters.purpose === "sale" ? "sale" : "rent";

  if (filters.location && city) {
    return `${resultPrefix} for ${category} for ${purposeLabel} in ${filters.location}, ${city}. Find the right match by filtering by price, amenities, and nearby neighborhoods.`;
  }

  if (city) {
    return `${resultPrefix} for ${category} for ${purposeLabel} in ${city}. Find the right match by filtering by price, amenities, and nearby neighborhoods.`;
  }

  if (filters.location) {
    return `${resultPrefix} for ${category} for ${purposeLabel} in ${filters.location}. Explore verified rental listings and compare amenities, size, and pricing details.`;
  }

  return `${resultPrefix} for ${category} for ${purposeLabel}. Explore verified rental listings and compare amenities, size, and pricing details.`;
};

export const buildPropertyMetadataTitle = (
  category: PropertyCategory,
  property: PublicProperty,
): string => {
  const title = getPropertyTitle(property);
  const purposeLabel =
    getPropertyPurpose(property) === "sale" ? "Sale" : "Rent";
  const locationLabel = getPropertyLocationLabel(property);

  if (locationLabel) {
    return `${title} for ${purposeLabel} in ${locationLabel}`;
  }

  if (title !== "Property Details") {
    return `${title} for ${purposeLabel}`;
  }

  return "Property Details";
};

export const buildPropertyMetadataDescription = (
  category: PropertyCategory,
  property: PublicProperty,
): string => {
  const priceDisplay = getPropertyPriceDisplay(property);
  const title = getPropertyTitle(property);
  const purposeLabel =
    getPropertyPurpose(property) === "sale" ? "sale" : "rent";
  const locationLabel = getPropertyLocationLabel(property);
  const lead = locationLabel
    ? `Find ${title.toLowerCase()} for ${purposeLabel} in ${locationLabel}.`
    : title !== "Property Details"
      ? `Explore ${title.toLowerCase()} for ${purposeLabel}.`
      : "Explore verified rental listings.";

  return `${lead} ${
    priceDisplay === "Contact for Price"
      ? "Verified listing, contact host directly."
      : `${priceDisplay}, verified listing, contact host directly.`
  }`;
};

export const buildPropertyImageAlt = (property: PublicProperty): string => {
  const title = getPropertyTitle(property);
  const locationLabel = getPropertyLocationLabel(property);

  return locationLabel ? `${title} in ${locationLabel}` : title;
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
