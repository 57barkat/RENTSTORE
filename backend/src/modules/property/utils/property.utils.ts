import { BadRequestException } from "@nestjs/common";
import { Types } from "mongoose";
import { UserDocument } from "../../user/user.entity";
import {
  buildContainsRegex,
  buildPrefixRegex,
  escapeRegex,
  normalizeAddressSearch,
} from "../../../common/utils/normalize.util";

type SearchableAddressInput = {
  addressQuery?: string;
  area?: string;
  location?: string;
  title?: string;
  address?: Array<{
    aptSuiteUnit?: string;
    street?: string;
    city?: string;
    stateTerritory?: string;
    country?: string;
  }>;
};

export const parseNumericFields = (
  query: Record<string, any>,
  numericFields: string[],
) => {
  numericFields.forEach((field) => {
    if (query[field] !== undefined) query[field] = Number(query[field]);
  });
};

export const parseArrayFields = (
  query: Record<string, any>,
  arrayFields: string[],
) => {
  arrayFields.forEach((field) => {
    if (query[field] && typeof query[field] === "string") {
      query[field] = query[field].split(",").map((v) => v.trim());
    }
  });
};

export const mapHostelType = (
  input: string,
): "male" | "female" | "mixed" | null => {
  if (!input) return null;
  const mapping: Record<string, "male" | "female" | "mixed"> = {
    girls: "female",
    girls_only: "female",
    female: "female",
    boys: "male",
    boys_only: "male",
    male: "male",
    coed: "mixed",
    co_ed: "mixed",
    mixed: "mixed",
  };
  const key = input.toLowerCase().replace(/\s|-/g, "_");
  return mapping[key] || null;
};

const cleanDisplayValue = (value?: string | null) => {
  if (!value || typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\s+/g, " ");
};

const toUniqueValues = (values: Array<string | undefined>) => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const cleaned = cleanDisplayValue(value);
    if (!cleaned) {
      continue;
    }

    const normalized = normalizeAddressSearch(cleaned);
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    result.push(cleaned);
  }

  return result;
};

export const buildMinimalAddressQuery = (
  property: SearchableAddressInput,
): string => {
  const firstAddress = Array.isArray(property.address)
    ? property.address[0]
    : undefined;

  const excludedNormalizedValues = new Set(
    [
      firstAddress?.city,
      firstAddress?.stateTerritory,
      firstAddress?.country,
      property.location,
    ]
      .map((value) => normalizeAddressSearch(value))
      .filter(Boolean),
  );

  const explicitAddressQuery = cleanDisplayValue(property.addressQuery);
  if (explicitAddressQuery) {
    return explicitAddressQuery;
  }

  const minimalParts = toUniqueValues([
    firstAddress?.aptSuiteUnit,
    firstAddress?.street,
    property.area,
  ]).filter(
    (value) => !excludedNormalizedValues.has(normalizeAddressSearch(value)),
  );

  if (minimalParts.length > 0) {
    return minimalParts.join(", ");
  }

  return (
    toUniqueValues([
      property.area,
      firstAddress?.street,
      property.location,
      property.title,
    ])[0] || ""
  );
};

export const buildPropertySearchText = (
  property: SearchableAddressInput,
): string => {
  const firstAddress = Array.isArray(property.address)
    ? property.address[0]
    : undefined;

  return toUniqueValues([
    property.title,
    property.location,
    property.area,
    property.addressQuery,
    firstAddress?.aptSuiteUnit,
    firstAddress?.street,
    firstAddress?.city,
    firstAddress?.stateTerritory,
    firstAddress?.country,
  ]).join(" ");
};

export const preparePropertySearchFields = (
  property: SearchableAddressInput,
): Pick<
  SearchableAddressInput & {
    addressQueryNormalized?: string;
    searchText?: string;
  },
  "addressQuery" | "addressQueryNormalized" | "searchText"
> => {
  const addressQuery = buildMinimalAddressQuery(property);

  return {
    addressQuery,
    addressQueryNormalized: normalizeAddressSearch(addressQuery),
    searchText: buildPropertySearchText({
      ...property,
      addressQuery,
    }),
  };
};

export const buildNormalizedPrefixRegex = (value?: string | null) =>
  buildPrefixRegex(value);

export const buildNormalizedContainsRegex = (value?: string | null) =>
  buildContainsRegex(value);

export const buildMongoFilter = (filters: any, userId?: string) => {
  const {
    title,
    location,
    city,
    addressQuery,
    minRent,
    maxRent,
    bedrooms,
    bathrooms,
    floorLevel,
    hostOption,
    hostelType,
    amenities,
    bills,
    mealPlan,
    rules,
    lat,
    lng,
    radiusKm,
    area,
    minSize,
    maxSize,
    sizeUnit,
    persons,
    Persons,
  } = filters;

  const mongoFilter: any = {
    status: true,
    isApproved: true,
    moderationStatus: "ACTIVE",
  };

  if (userId) {
    mongoFilter.ownerId = { $ne: new Types.ObjectId(userId) };
  }

  const andConditions: any[] = [];

  // 1. SMART SEARCH (Logic for addressQuery or area)
  if (title) {
    andConditions.push({
      title: { $regex: escapeRegex(title.trim()), $options: "i" },
    });
  }

  const searchInput = addressQuery || location || area;
  if (searchInput) {
    const cleanedQuery = searchInput.trim();
    const normalizedSearch = normalizeAddressSearch(cleanedQuery);
    const normalizedPrefixRegex = buildNormalizedPrefixRegex(normalizedSearch);
    const normalizedContainsRegex =
      buildNormalizedContainsRegex(normalizedSearch);
    const readableRegex = {
      $regex: escapeRegex(cleanedQuery),
      $options: "i",
    };
    const searchConditions: Array<Record<string, any>> = [];

    if (normalizedPrefixRegex) {
      searchConditions.push({
        addressQueryNormalized: normalizedPrefixRegex,
      });
    }

    if (
      normalizedContainsRegex &&
      normalizedContainsRegex.source !== normalizedPrefixRegex?.source
    ) {
      searchConditions.push({
        addressQueryNormalized: normalizedContainsRegex,
      });
    }

    searchConditions.push(
      { addressQuery: readableRegex },
      { area: readableRegex },
      { location: readableRegex },
      { title: readableRegex },
      { "address.street": readableRegex },
    );

    andConditions.push({ $or: searchConditions });
  }

  // 2. City
  if (city) {
    andConditions.push({
      "address.city": { $regex: `^${escapeRegex(city)}$`, $options: "i" },
    });
  }

  // 3. Rent Range (Multi-field support)
  if (minRent !== undefined || maxRent !== undefined) {
    const priceQuery: any = {};
    if (minRent !== undefined) priceQuery.$gte = Number(minRent);
    if (maxRent !== undefined) priceQuery.$lte = Number(maxRent);

    andConditions.push({
      $or: [
        { monthlyRent: priceQuery },
        { dailyRent: priceQuery },
        { weeklyRent: priceQuery },
      ],
    });
  }

  // 4. PROPERTY SIZE (NEW)
  if (minSize !== undefined || maxSize !== undefined) {
    const sizeValueQuery: any = {};
    if (minSize !== undefined) sizeValueQuery.$gte = Number(minSize);
    if (maxSize !== undefined) sizeValueQuery.$lte = Number(maxSize);

    // Target the nested size object: size { value, unit }
    andConditions.push({ "size.value": sizeValueQuery });
  }

  if (sizeUnit) {
    andConditions.push({ "size.unit": sizeUnit });
  }

  // 5. Host options
  if (hostOption) {
    mongoFilter.hostOption = hostOption;
  }

  // 6. Hostel type mapping
  if (hostelType) {
    const mapping: Record<string, string[]> = {
      female: ["female", "girls"],
      male: ["male", "boys"],
      mixed: ["mixed", "co-ed"],
    };
    mongoFilter.hostelType = { $in: mapping[hostelType] };
  }

  // 7. Arrays (Amenities, Bills, etc.)
  if (amenities?.length) mongoFilter.amenities = { $all: amenities };
  if (bills?.length) mongoFilter.ALL_BILLS = { $all: bills };
  if (mealPlan?.length) mongoFilter.mealPlan = { $all: mealPlan };
  if (rules?.length) mongoFilter.rules = { $all: rules };

  // 8. Capacity
  if (bedrooms !== undefined && bedrooms !== 0)
    mongoFilter["capacityState.bedrooms"] = Number(bedrooms);
  const guests = persons ?? Persons;
  if (guests !== undefined && guests !== 0)
    mongoFilter["capacityState.Persons"] = Number(guests);
  if (bathrooms !== undefined && bathrooms !== 0)
    mongoFilter["capacityState.bathrooms"] = Number(bathrooms);
  if (floorLevel !== undefined)
    mongoFilter["capacityState.floorLevel"] = Number(floorLevel);

  // 9. Geospatial
  if (lat !== undefined && lng !== undefined && radiusKm !== undefined) {
    mongoFilter.locationGeo = {
      $near: {
        $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
        $maxDistance: Number(radiusKm) * 1000,
      },
    };
  }

  // Apply all AND conditions collected
  if (andConditions.length > 0) {
    mongoFilter.$and = andConditions;
  }

  return mongoFilter;
};

export const processPhotos = (photos?: string[]): string[] => {
  return photos ? Array.from(new Set(photos)) : [];
};

export const formatLocationGeo = (lat?: number, lng?: number) => {
  if (lat !== undefined && lng !== undefined) {
    return {
      type: "Point" as const,
      coordinates: [lng, lat],
    };
  }
  return undefined;
};

/**
 * Logic to check and deduct credits from the user object.
 * Does NOT save to DB (we return a boolean so the service handles the save).
 */
export const validateAndDeductCredits = (
  user: UserDocument,
  isNewUpload: boolean,
  isFeaturedRequest: boolean,
): boolean => {
  let userNeedsSaving = false;

  // 1. Standard Property Upload Credit
  if (isNewUpload) {
    const currentUsage = user.usedPropertyCount || 0;
    const maxLimit = user.propertyLimit || 0;
    const credits = user.paidPropertyCredits || 0;

    if (currentUsage >= maxLimit) {
      if (credits > 0) {
        user.propertyLimit = maxLimit + 1;
        user.paidPropertyCredits = credits - 1;
        userNeedsSaving = true;
      } else {
        throw new BadRequestException({
          message: "Standard upload limit reached.",
          error: "LIMIT_EXCEEDED",
          requiresUpgrade: true,
        });
      }
    }
  }

  // 2. Featured Property Credit
  if (isFeaturedRequest) {
    const featuredCredits = user.paidFeaturedCredits || 0;
    if (featuredCredits > 0) {
      user.paidFeaturedCredits = featuredCredits - 1;
      userNeedsSaving = true;
    } else {
      throw new BadRequestException({
        message: "Insufficient Featured Credits.",
        error: "FEATURED_LIMIT_EXCEEDED",
      });
    }
  }

  return userNeedsSaving;
};
