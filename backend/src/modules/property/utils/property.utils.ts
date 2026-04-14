import { BadRequestException } from "@nestjs/common";
import { Types } from "mongoose";
import { UserDocument } from "src/modules/user/user.entity";

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

export const buildMongoFilter = (filters: any, userId?: string) => {
  const {
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

  // SMART SEARCH
  const searchInput = addressQuery || area;
  if (searchInput) {
    const cleanedQuery = searchInput.trim();
    const flexiblePattern = cleanedQuery
      .replace(/[-/\s]/g, "")
      .split("")
      .join("[-/\\s]?");
    const searchRegex = { $regex: flexiblePattern, $options: "i" };

    const isSpecific =
      /\d[-/\s]\d/.test(cleanedQuery) ||
      (cleanedQuery.length > 3 && /[0-9]$/.test(cleanedQuery));

    andConditions.push({
      $or: isSpecific
        ? [
            { location: searchRegex },
            { title: searchRegex },
            { "address.street": searchRegex },
          ]
        : [
            { area: searchRegex },
            { location: searchRegex },
            { title: searchRegex },
          ],
    });
  }

  // City
  if (city) {
    andConditions.push({ "address.city": { $regex: city, $options: "i" } });
  }

  // Rent
  // Rent (Multi-field support for Daily, Weekly, and Monthly)
  if (minRent !== undefined || maxRent !== undefined) {
    const priceQuery: any = {};
    if (minRent !== undefined) priceQuery.$gte = Number(minRent);
    if (maxRent !== undefined) priceQuery.$lte = Number(maxRent);

    // This ensures that if ANY of the price fields match the range,
    // the property is shown.
    const priceConditions = [
      { monthlyRent: priceQuery },
      { dailyRent: priceQuery },
      { weeklyRent: priceQuery },
    ];

    // Push to andConditions to avoid overwriting other filters
    andConditions.push({ $or: priceConditions });
  }

  // Host options
  if (hostOption) {
    mongoFilter.hostOption = { $regex: hostOption, $options: "i" };
  }

  // Hostel type mapping
  if (hostelType) {
    const mapping: Record<string, string[]> = {
      female: ["female", "girls"],
      male: ["male", "boys"],
      mixed: ["mixed", "co-ed"],
    };
    if (mapping[hostelType]) {
      mongoFilter.hostelType = { $in: mapping[hostelType] };
    }
  }

  // Arrays
  if (amenities?.length) mongoFilter.amenities = { $all: amenities };
  if (bills?.length) mongoFilter.ALL_BILLS = { $all: bills };
  if (mealPlan?.length) mongoFilter.mealPlan = { $all: mealPlan };
  if (rules?.length) mongoFilter.rules = { $all: rules };

  // Capacity
  if (bedrooms !== undefined)
    mongoFilter["capacityState.bedrooms"] = Number(bedrooms);
  if (bathrooms !== undefined)
    mongoFilter["capacityState.bathrooms"] = Number(bathrooms);
  if (floorLevel !== undefined)
    mongoFilter["capacityState.floorLevel"] = Number(floorLevel);

  // Apply AND conditions
  if (andConditions.length > 0) {
    mongoFilter.$and = andConditions;
  }

  // Geospatial (Note: $near requires a 2dsphere index)
  if (lat !== undefined && lng !== undefined && radiusKm !== undefined) {
    mongoFilter.locationGeo = {
      $near: {
        $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
        $maxDistance: Number(radiusKm) * 1000,
      },
    };
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
