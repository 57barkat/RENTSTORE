import { Types } from "mongoose";

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

  const mongoFilter: any = { status: true };
  if (userId) mongoFilter.ownerId = { $ne: new Types.ObjectId(userId) };

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
  if (city)
    andConditions.push({ "address.city": { $regex: city, $options: "i" } });

  // Rent
  if (minRent !== undefined || maxRent !== undefined) {
    mongoFilter.monthlyRent = {};
    if (minRent !== undefined) mongoFilter.monthlyRent.$gte = Number(minRent);
    if (maxRent !== undefined) mongoFilter.monthlyRent.$lte = Number(maxRent);
  }

  // Host options
  if (hostOption)
    mongoFilter.hostOption = { $regex: hostOption, $options: "i" };

  // Hostel type mapping
  if (hostelType) {
    const mapping: Record<string, string[]> = {
      female: ["female", "girls"],
      male: ["male", "boys"],
      mixed: ["mixed", "co-ed"],
    };
    mongoFilter.$or = mapping[hostelType].map((val) => ({ hostelType: val }));
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
  if (andConditions.length > 0) mongoFilter.$and = andConditions;

  // Geospatial
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
