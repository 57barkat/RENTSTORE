import { normalizeText } from "../../../common/utils/normalize.util";
import { Model, FilterQuery } from "mongoose";

export interface PropertyFilters {
  city?: string;
  stateTerritory?: string;
  country?: string;
  title?: string;
  addressQuery?: string;
  minRent?: number;
  maxRent?: number;
  minSecurity?: number;
  maxSecurity?: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  Persons?: number;
  floorLevel?: number;
  amenities?: string[];
  bills?: string[];
  highlighted?: string[];
  safety?: string[];
  hostOption?: string;
  relaxed?: boolean;
}

export interface RelaxedFilterResult {
  filter: FilterQuery<any>;
  ignoredFilters: string[];
  message: string;
  total: number;
}

const FILTER_PRIORITY = [
  "amenities",
  "bills",
  "safety",
  "highlighted",
  "hostOption",
  "minSecurity",
  "maxSecurity",
  "minRent",
  "maxRent",
  "beds",
  "bedrooms",
  "bathrooms",
  "floorLevel",
  "Persons",
  "stateTerritory",
];

export const buildPropertyFilter = (
  filters: PropertyFilters,
): FilterQuery<any> => {
  const filter: FilterQuery<any> = { status: true };
  const andConditions: any[] = [];

  /* ---------------- CITY ---------------- */
  if (filters.city) {
    andConditions.push({
      address: {
        $elemMatch: {
          city: { $regex: filters.city, $options: "i" },
        },
      },
    });
  }

  /* ---------------- ADDRESS QUERY (BEST MATCH STYLE) ---------------- */
  if (filters.addressQuery) {
    const words = filters.addressQuery.trim().split(/\s+/).filter(Boolean);

    const orConditions = words.map((word) => {
      const safeWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      return {
        $or: [
          { title: { $regex: safeWord, $options: "i" } },
          { location: { $regex: safeWord, $options: "i" } },
          {
            address: {
              $elemMatch: {
                street: { $regex: safeWord, $options: "i" },
              },
            },
          },
          {
            address: {
              $elemMatch: {
                city: { $regex: safeWord, $options: "i" },
              },
            },
          },
          {
            address: {
              $elemMatch: {
                stateTerritory: { $regex: safeWord, $options: "i" },
              },
            },
          },
        ],
      };
    });

    // BEST MATCH: allow any word to match instead of all
    andConditions.push({ $or: orConditions });
  }

  /* ---------------- RENT RANGE ---------------- */
  if (filters.minRent !== undefined || filters.maxRent !== undefined) {
    filter.monthlyRent = {};
    if (filters.minRent !== undefined)
      filter.monthlyRent.$gte = Number(filters.minRent);
    if (filters.maxRent !== undefined)
      filter.monthlyRent.$lte = Number(filters.maxRent);
  }

  /* ---------------- BEDROOMS ---------------- */
  if (filters.bedrooms !== undefined) {
    filter["capacityState.bedrooms"] = Number(filters.bedrooms);
  }

  /* ---------------- BATHROOMS ---------------- */
  if (filters.bathrooms !== undefined) {
    filter["capacityState.bathrooms"] = Number(filters.bathrooms);
  }

  /* ---------------- FLOOR LEVEL ---------------- */
  if (filters.floorLevel !== undefined) {
    filter["capacityState.floorLevel"] = Number(filters.floorLevel);
  }

  /* ---------------- HOST OPTION ---------------- */
  if (filters.hostOption) {
    filter.hostOption = {
      $regex: `^${filters.hostOption}$`,
      $options: "i",
    };
  }

  /* ---------------- APPLY ADDRESS CONDITIONS ---------------- */
  if (andConditions.length) {
    filter.$and = andConditions;
  }

  return filter;
};

export const buildSmartRelaxedFilter = async (
  model: Model<any>,
  filters: PropertyFilters,
): Promise<RelaxedFilterResult> => {
  let activeFilters = { ...filters };
  let ignoredFilters: string[] = [];

  let mongoFilter = buildPropertyFilter(activeFilters);
  let count = await model.countDocuments(mongoFilter);
  if (count > 0) {
    return {
      filter: mongoFilter,
      ignoredFilters,
      message: "Perfect match found!",
      total: count,
    };
  }

  for (const key of FILTER_PRIORITY) {
    if (activeFilters[key] !== undefined) {
      delete activeFilters[key];
      ignoredFilters.push(key);

      mongoFilter = buildPropertyFilter(activeFilters);
      count = await model.countDocuments(mongoFilter);
      if (count > 0) {
        const relaxedMsg = ignoredFilters.length
          ? `Filters relaxed: ${ignoredFilters.join(", ")}.`
          : "";
        return {
          filter: mongoFilter,
          ignoredFilters,
          message: `Matches found in ${filters.city || "any city"} for "${filters.addressQuery}". ${relaxedMsg}`,
          total: count,
        };
      }
    }
  }

  if (filters.city) {
    mongoFilter = { "address.city": filters.city, status: true };
    count = await model.countDocuments(mongoFilter);
    const fallbackMsg = filters.addressQuery
      ? `No listings found in "${filters.addressQuery}". Showing all properties in ${filters.city}.`
      : `Showing all results for ${filters.city}.`;
    const relaxedMsg = ignoredFilters.length
      ? `Filters relaxed: ${ignoredFilters.join(", ")}.`
      : "";
    return {
      filter: mongoFilter,
      ignoredFilters: [...ignoredFilters, "addressQuery"],
      message: `${fallbackMsg} ${relaxedMsg}`.trim(),
      total: count,
    };
  }

  if (filters.addressQuery) {
    mongoFilter = buildPropertyFilter({ addressQuery: filters.addressQuery });
    count = await model.countDocuments(mongoFilter);
    const relaxedMsg = ignoredFilters.length
      ? `Filters relaxed: ${ignoredFilters.join(", ")}.`
      : "";
    return {
      filter: mongoFilter,
      ignoredFilters,
      message:
        `No city provided. Showing results for "${filters.addressQuery}" globally. ${relaxedMsg}`.trim(),
      total: count,
    };
  }

  count = await model.countDocuments({ status: true });
  return {
    filter: { status: true },
    ignoredFilters,
    message: "Showing all properties.",
    total: count,
  };
};
