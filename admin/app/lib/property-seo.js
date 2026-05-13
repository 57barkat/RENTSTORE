export const DEFAULT_LISTING_CITY = "Islamabad";
export const DEFAULT_LISTING_PURPOSE = "rent";
export const PROPERTY_DETAIL_SLUG_MAX_LENGTH = 70;
export const KNOWN_SEO_CITIES = [
  "Islamabad",
  "Lahore",
  "Karachi",
  "Rawalpindi",
  "Peshawar",
  "Multan",
  "Faisalabad",
  "Quetta",
  "Sialkot",
  "Gujranwala",
];

const PURPOSE_VALUES = new Set(["rent", "sale"]);

const PROPERTY_TYPE_ALIASES = {
  house: "house",
  houses: "house",
  home: "house",
  homes: "house",
  apartment: "apartment",
  apartments: "apartment",
  hostel: "hostel",
  hostels: "hostel",
  shop: "shop",
  shops: "shop",
  office: "office",
  offices: "office",
  property: "property",
  properties: "property",
};

const PROPERTY_TYPE_SEGMENTS = {
  house: "houses",
  apartment: "apartments",
  hostel: "hostels",
  shop: "shops",
  office: "offices",
  property: "properties",
};

const PROPERTY_TYPE_TO_CATEGORY = {
  house: "home",
  apartment: "apartment",
  hostel: "hostel",
  shop: "shop",
  office: "office",
  property: "property",
};

const CATEGORY_TO_PROPERTY_TYPE = {
  home: "house",
  apartment: "apartment",
  hostel: "hostel",
  shop: "shop",
  office: "office",
  property: "property",
};

export const PUBLIC_PROPERTY_ROUTE_MAP = {
  house: {
    category: "home",
    legacyHref: "/houses",
    seoExampleHref: "/houses-for-rent-in-islamabad",
    label: "House",
  },
  apartment: {
    category: "apartment",
    legacyHref: "/apartments",
    seoExampleHref: "/apartments-for-rent-in-islamabad",
    label: "Apartment",
  },
  hostel: {
    category: "hostel",
    legacyHref: "/hostels",
    seoExampleHref: "/hostels-for-rent-in-islamabad",
    label: "Hostel",
  },
  shop: {
    category: "shop",
    legacyHref: "/shops",
    seoExampleHref: "/shops-for-rent-in-islamabad",
    label: "Shop",
  },
  office: {
    category: "office",
    legacyHref: "/offices",
    seoExampleHref: "/offices-for-rent-in-islamabad",
    label: "Office",
  },
};

export const LEGACY_LISTING_ROUTE_ALIASES = {
  home: "/houses",
  house: "/houses",
  apartment: "/apartments",
  hostel: "/hostels",
  shop: "/shops",
  office: "/offices",
};

export const slugifyListingValue = (value) => {
  if (!value) {
    return "";
  }

  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const normalizeSectorIdentifiers = (value) =>
  value.replace(
    /\b([a-z])\s*-?\s*(\d+)(?:\s*-\s*(\d+))?\b/gi,
    (_, prefix, primary, secondary) =>
      secondary
        ? `${prefix.toLowerCase()}-${primary}-${secondary}`
        : `${prefix.toLowerCase()}-${primary}`,
  );

const normalizePropertyDetailText = (value) => {
  if (!value) {
    return "";
  }

  return normalizeSectorIdentifiers(String(value))
    .replace(/\bmarly\b/gi, "marla")
    .replace(/\bfor\s+rent(?:\s+in)?\b/gi, " ")
    .replace(/\bfor\s+sale(?:\s+in)?\b/gi, " ")
    .replace(/\brent\b/gi, " ")
    .replace(/\bsale\b/gi, " ")
    .replace(/\bin\b/gi, " ")
    .replace(/&/g, " and ")
    .replace(/\s+/g, " ")
    .trim();
};

const truncateSlugValue = (
  value,
  maxLength = PROPERTY_DETAIL_SLUG_MAX_LENGTH,
) => {
  if (!value || value.length <= maxLength) {
    return value;
  }

  const trimmed = value.slice(0, maxLength).replace(/-+$/g, "");
  const lastHyphenIndex = trimmed.lastIndexOf("-");

  if (lastHyphenIndex > Math.floor(maxLength * 0.6)) {
    return trimmed.slice(0, lastHyphenIndex);
  }

  return trimmed;
};

const titleCaseWord = (word) => {
  if (!word) {
    return "";
  }

  const lower = word.toLowerCase();
  if (lower.length <= 3 && /^[a-z]+$/i.test(lower)) {
    return lower.toUpperCase();
  }

  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

const normalizeDisplayCity = (value) => {
  if (!value) {
    return "";
  }

  const slug = slugifyListingValue(value);
  const knownCity = KNOWN_SEO_CITIES.find(
    (candidate) => slugifyListingValue(candidate) === slug,
  );

  if (knownCity) {
    return knownCity;
  }

  return value
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => titleCaseWord(word))
    .join(" ");
};

const normalizeDisplayArea = (value) => {
  const normalized = normalizePropertyDetailText(value || "");

  if (!normalized) {
    return "";
  }

  const compact = normalizeSectorIdentifiers(normalized)
    .replace(/\s+/g, " ")
    .trim();

  if (/^[a-z]+-\d+(?:-[a-z0-9]+)?$/i.test(compact)) {
    return compact.toUpperCase();
  }

  return compact
    .replace(/[-_]+/g, " ")
    .split(" ")
    .map((word) => titleCaseWord(word))
    .join(" ");
};

const normalizeDisplayLocation = normalizeDisplayArea;

const buildPropertyDetailLocationSlug = (value) =>
  slugifyListingValue(normalizePropertyDetailText(value || ""));

const normalizeSizeUnitForSlug = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ");

  if (!normalized) {
    return "";
  }

  if (normalized === "marla" || normalized === "marly") {
    return "marla";
  }

  if (normalized === "kanal") {
    return "kanal";
  }

  if (
    normalized === "sq ft" ||
    normalized === "sqft" ||
    normalized === "square feet"
  ) {
    return "sq-ft";
  }

  return slugifyListingValue(normalized);
};

const buildPropertySizeSlug = (sizeValue, sizeUnit) => {
  if (
    sizeValue === undefined ||
    sizeValue === null ||
    sizeValue === "" ||
    Number.isNaN(Number(sizeValue))
  ) {
    return "";
  }

  const normalizedUnit = normalizeSizeUnitForSlug(sizeUnit);

  if (!normalizedUnit) {
    return "";
  }

  return `${String(sizeValue).trim()}-${normalizedUnit}`;
};

const removeDuplicateLocationTokens = (value, locations) => {
  let sanitized = ` ${normalizePropertyDetailText(value || "").toLowerCase()} `;

  locations
    .map((location) =>
      normalizePropertyDetailText(location || "").toLowerCase(),
    )
    .filter(Boolean)
    .forEach((location) => {
      const escapedLocation = location.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      sanitized = sanitized.replace(
        new RegExp(`\\b${escapedLocation}\\b`, "gi"),
        " ",
      );
    });

  return sanitized.replace(/\s+/g, " ").trim();
};

const inferPropertyDescriptor = ({ propertyType, title, hostelType }) => {
  const normalizedType = normalizeSeoPropertyType(propertyType);
  const normalizedTitle = removeDuplicateLocationTokens(
    title,
    [],
  ).toLowerCase();

  if (!normalizedType) {
    return "";
  }

  if (normalizedType === "hostel") {
    const normalizedHostelType = String(hostelType || "").toLowerCase();

    if (normalizedHostelType === "male" || /\bboys?\b/.test(normalizedTitle)) {
      return "boys-hostel";
    }

    if (
      normalizedHostelType === "female" ||
      /\bgirls?\b/.test(normalizedTitle)
    ) {
      return "girls-hostel";
    }

    return "hostel";
  }

  if (normalizedType === "house") {
    if (/\bground portion\b/.test(normalizedTitle)) {
      return "ground-portion";
    }

    if (/\bupper portion\b/.test(normalizedTitle)) {
      return "upper-portion";
    }

    if (/\blower portion\b/.test(normalizedTitle)) {
      return "lower-portion";
    }

    if (/\bfamily\b/.test(normalizedTitle)) {
      return "family-house";
    }

    return "house";
  }

  if (normalizedType === "apartment") {
    return "apartment";
  }

  if (normalizedType === "shop") {
    return "shop";
  }

  if (normalizedType === "office") {
    return "office";
  }

  return "property";
};

/**
 * @param {string | undefined | null} propertyType
 * @returns {"house"|"apartment"|"hostel"|"shop"|"office"|"property"|null}
 */
export const normalizeSeoPropertyType = (propertyType) => {
  if (!propertyType) {
    return null;
  }

  return PROPERTY_TYPE_ALIASES[String(propertyType).toLowerCase()] || null;
};

/**
 * @param {string | undefined | null} category
 * @returns {"house"|"apartment"|"hostel"|"shop"|"office"|"property"|null}
 */
export const getSeoPropertyTypeForCategory = (category) => {
  if (!category) {
    return null;
  }

  return CATEGORY_TO_PROPERTY_TYPE[String(category)] || null;
};

/**
 * @param {string | undefined | null} propertyType
 * @returns {"home"|"apartment"|"hostel"|"shop"|"office"|"property"|null}
 */
export const getCategoryForSeoPropertyType = (propertyType) => {
  const normalizedType = normalizeSeoPropertyType(propertyType);

  if (!normalizedType) {
    return null;
  }

  return PROPERTY_TYPE_TO_CATEGORY[normalizedType] || null;
};

/**
 * @param {string | undefined | null} purpose
 * @returns {"rent"|"sale"|null}
 */
export const normalizePurpose = (purpose) => {
  if (!purpose) {
    return null;
  }

  const normalized = String(purpose).toLowerCase();
  return PURPOSE_VALUES.has(normalized) ? normalized : null;
};

/**
 * @param {string | undefined | null} value
 * @returns {string}
 */
export const normalizeSeoCity = (value) =>
  normalizeDisplayCity(value || DEFAULT_LISTING_CITY);

export const normalizeSeoArea = (value) => normalizeDisplayArea(value || "");

const KNOWN_SEO_CITY_SEGMENTS = KNOWN_SEO_CITIES.map((city) => ({
  city,
  slug: slugifyListingValue(city),
})).sort((left, right) => right.slug.length - left.slug.length);

/**
 * @param {{category?: string, purpose?: string, city?: string, area?: string, propertyType?: string}} input
 * @returns {{ propertyType: "house"|"apartment"|"hostel"|"shop"|"office"|"property", purpose: "rent"|"sale", city: string, area: string } | null}
 */
export const getSeoListingContext = (input) => {
  const propertyType =
    normalizeSeoPropertyType(input?.propertyType) ||
    getSeoPropertyTypeForCategory(input?.category);
  const purpose =
    normalizePurpose(input?.purpose || DEFAULT_LISTING_PURPOSE) ||
    DEFAULT_LISTING_PURPOSE;
  const city = normalizeSeoCity(input?.city || DEFAULT_LISTING_CITY);
  const area = normalizeSeoArea(input?.area || "");

  if (!propertyType || !purpose || !city) {
    return null;
  }

  return {
    propertyType,
    purpose,
    city,
    area,
  };
};

/**
 * @param {{category?: string, purpose?: string, city?: string, area?: string, propertyType?: string}} input
 * @returns {string|null}
 */
export const buildSeoListingSlug = (input) => {
  const seoContext = getSeoListingContext(input);

  if (!seoContext) {
    return null;
  }

  const locationSlugParts = [
    seoContext.area ? slugifyListingValue(seoContext.area) : "",
    slugifyListingValue(seoContext.city),
  ].filter(Boolean);

  return `${PROPERTY_TYPE_SEGMENTS[seoContext.propertyType]}-for-${seoContext.purpose}-in-${locationSlugParts.join("-")}`;
};

/**
 * @param {{category?: string, purpose?: string, city?: string, area?: string, propertyType?: string}} input
 * @returns {boolean}
 */
export const canBuildSeoListingSlug = (input) =>
  Boolean(buildSeoListingSlug(input));

/**
 * @param {string} segment
 * @returns {{ category: "home"|"apartment"|"hostel"|"shop"|"office"|"property", propertyType: "house"|"apartment"|"hostel"|"shop"|"office"|"property", purpose: "rent"|"sale", city: string, area: string | null, canonicalSegment: string } | null}
 */
export const parseSeoListingSlug = (segment) => {
  if (!segment) {
    return null;
  }

  const normalizedSegment = segment.trim().toLowerCase();
  const match = normalizedSegment.match(/^([a-z-]+)-for-(rent|sale)-in-(.+)$/i);

  if (!match) {
    return null;
  }

  const [, propertyTypeSegment, purposeSegment, locationSegment] = match;
  const propertyType = normalizeSeoPropertyType(propertyTypeSegment);
  const purpose = normalizePurpose(purposeSegment);
  const category = getCategoryForSeoPropertyType(propertyTypeSegment);

  const cityMatch = KNOWN_SEO_CITY_SEGMENTS.find(
    ({ slug }) =>
      locationSegment === slug || locationSegment.endsWith(`-${slug}`),
  );

  if (!cityMatch) {
    return null;
  }

  const city = cityMatch.city;
  const areaSegment =
    locationSegment === cityMatch.slug
      ? ""
      : locationSegment.slice(0, -(cityMatch.slug.length + 1));
  const area = areaSegment ? normalizeSeoArea(areaSegment) : "";

  if (!propertyType || !purpose || !category || !city) {
    return null;
  }

  const canonicalSegment = buildSeoListingSlug({
    propertyType,
    purpose,
    city,
    area,
  });

  if (!canonicalSegment) {
    return null;
  }

  return {
    category,
    propertyType,
    purpose,
    city,
    area: area || null,
    canonicalSegment,
  };
};

/**
 * @param {{ category: string, city?: string, area?: string, purpose?: string }} input
 * @returns {string|null}
 */
export const buildLegacyListingRedirectPath = (input) => {
  const segment = buildSeoListingSlug({
    category: input.category,
    purpose: input.purpose || DEFAULT_LISTING_PURPOSE,
    city: input.city || DEFAULT_LISTING_CITY,
    area: input.area,
  });

  return segment ? `/${segment}` : null;
};

/**
 * @param {{ title?: string, propertyType?: string, purpose?: string, area?: string, city?: string, sizeValue?: string|number, sizeUnit?: string, hostelType?: string, propertyId?: string }} input
 * @returns {string | null}
 */
export const buildPropertyDetailSlug = (input) => {
  const propertyType = normalizeSeoPropertyType(input?.propertyType);
  const purpose =
    normalizePurpose(input?.purpose || DEFAULT_LISTING_PURPOSE) ||
    DEFAULT_LISTING_PURPOSE;
  const city = buildPropertyDetailLocationSlug(
    input?.city || DEFAULT_LISTING_CITY,
  );
  const area = buildPropertyDetailLocationSlug(input?.area || "");
  const descriptor = inferPropertyDescriptor({
    propertyType,
    title: input?.title,
    hostelType: input?.hostelType,
  });
  const sizeSegment = buildPropertySizeSlug(input?.sizeValue, input?.sizeUnit);
  const propertyId = String(input?.propertyId || "")
    .trim()
    .toLowerCase();

  if (!propertyType || !city || propertyId.length !== 24) {
    return null;
  }

  const phraseParts = [
    descriptor,
    "for",
    purpose,
    "in",
    area,
    city,
    sizeSegment,
  ].filter(Boolean);
  const slugBase = truncateSlugValue(phraseParts.join("-"));

  return `${slugBase}-${propertyId}`;
};

/**
 * @param {string} segment
 * @returns {{ propertyId: string, slugBody: string, propertyType: "house"|"apartment"|"hostel"|"shop"|"office"|"property"|null, purpose: "rent"|"sale"|null, locationHint: string } | null}
 */
export const parsePropertyDetailSlug = (segment) => {
  if (!segment) {
    return null;
  }

  const normalizedSegment = String(segment).trim().toLowerCase();
  const match = normalizedSegment.match(
    /^(.*?)-for-(rent|sale)-in-(.+)-([a-f0-9]{24})$/i,
  );

  if (!match) {
    return null;
  }

  const [, descriptorSegment, purposeSegment, rawLocationHint, propertyId] =
    match;
  const propertyType = descriptorSegment.includes("hostel")
    ? "hostel"
    : descriptorSegment.includes("apartment")
      ? "apartment"
      : descriptorSegment.includes("office")
        ? "office"
        : descriptorSegment.includes("shop")
          ? "shop"
          : descriptorSegment.includes("house") ||
              descriptorSegment.includes("portion")
            ? "house"
            : "property";

  const locationHint = rawLocationHint.replace(
    /-(\d+(?:-\d+)?-(?:marla|kanal|sq-ft))$/i,
    "",
  );

  return {
    slugBody: `${descriptorSegment}-for-${purposeSegment}-in-${rawLocationHint}`,
    propertyId,
    propertyType,
    purpose: normalizePurpose(purposeSegment),
    locationHint: normalizeDisplayLocation(locationHint),
  };
};

/**
 * @param {string} pathname
 * @returns {"home"|"apartment"|"hostel"|"shop"|"office"|null}
 */
export const getPublicCategoryFromPath = (pathname) => {
  const seoCategory = parseSeoListingSlug(
    String(pathname || "").replace(/^\//, ""),
  )?.category;

  if (
    seoCategory &&
    seoCategory !== "property" &&
    ["home", "apartment", "hostel", "shop", "office"].includes(seoCategory)
  ) {
    return seoCategory;
  }

  const normalizedPathname = String(pathname || "");
  const matchedRoute = Object.values(PUBLIC_PROPERTY_ROUTE_MAP).find(
    (item) =>
      normalizedPathname === item.legacyHref ||
      normalizedPathname.startsWith(`${item.legacyHref}/`),
  );

  return matchedRoute?.category || null;
};

/**
 * @param {string} segment
 * @returns {string | null}
 */
export const getLegacyCategoryAliasPath = (segment) => {
  if (!segment) {
    return null;
  }

  return LEGACY_LISTING_ROUTE_ALIASES[String(segment).toLowerCase()] || null;
};
