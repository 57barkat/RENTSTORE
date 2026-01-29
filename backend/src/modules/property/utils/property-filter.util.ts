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
  "Persons",
  "stateTerritory",
];

export const buildPropertyFilter = (
  filters: PropertyFilters,
): FilterQuery<any> => {
  const filter: FilterQuery<any> = { status: true };

  // 1️⃣ STRICT CITY MATCH
  if (filters.city) {
    filter["address.city"] = {
      $regex: `^${normalizeText(filters.city)}$`,
      $options: "i",
    };
  }

  // 2️⃣ FLEXIBLE ADDRESS QUERY MATCH (ALL WORDS, ANY FIELD)
  if (filters.addressQuery) {
    const query = normalizeText(filters.addressQuery.trim());
    if (query.length > 0) {
      const words = query.split(/\s+/);

      // Each word must match somewhere ($and of $or conditions)
      const wordConditions = words.map((word) => {
        // Turn "DHA 2" or "G11 2" into flexible regex: "DHA[-/ ]?2"
        const flexibleWord = word.replace(
          /([a-zA-Z]+)([0-9]+)/,
          "$1[-/\\s]?$2",
        );

        return {
          $or: [
            { "address.street": { $regex: flexibleWord, $options: "i" } },
            { location: { $regex: flexibleWord, $options: "i" } },
            { title: { $regex: flexibleWord, $options: "i" } },
            {
              "address.stateTerritory": { $regex: flexibleWord, $options: "i" },
            },
            { "description.desc": { $regex: flexibleWord, $options: "i" } },
          ],
        };
      });

      filter.$and = filter.$and
        ? [...filter.$and, ...wordConditions]
        : wordConditions;
    }
  }

  // 3️⃣ OTHER FILTERS
  if (filters.stateTerritory)
    filter["address.stateTerritory"] = {
      $regex: normalizeText(filters.stateTerritory),
      $options: "i",
    };

  if (filters.minRent !== undefined || filters.maxRent !== undefined) {
    filter.monthlyRent = {};
    if (filters.minRent !== undefined)
      filter.monthlyRent.$gte = Number(filters.minRent);
    if (filters.maxRent !== undefined)
      filter.monthlyRent.$lte = Number(filters.maxRent);
  }

  if (filters.bedrooms !== undefined)
    filter["capacityState.bedrooms"] = Number(filters.bedrooms);

  if (filters.beds !== undefined)
    filter["capacityState.beds"] = Number(filters.beds);

  if (filters.Persons !== undefined)
    filter["capacityState.Persons"] = { $gte: Number(filters.Persons) };

  if (filters.amenities?.length) filter.amenities = { $all: filters.amenities };
  if (filters.bills?.length) filter.bills = { $all: filters.bills };
  if (filters.highlighted?.length)
    filter.highlighted = { $all: filters.highlighted };
  if (filters.safety?.length) filter.safety = { $all: filters.safety };

  // ✅ STRICT hostOption filter to avoid unrelated matches
  if (filters.hostOption) {
    filter.hostOption = { $regex: `^${filters.hostOption}$`, $options: "i" };
  }

  return filter;
};

export const buildSmartRelaxedFilter = async (
  model: Model<any>,
  filters: PropertyFilters,
): Promise<RelaxedFilterResult> => {
  let activeFilters = { ...filters };
  let ignoredFilters: string[] = [];

  // 1️⃣ Strict match: city + addressQuery + other filters
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

  // 2️⃣ Relax secondary filters, keep city & addressQuery
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

  // 3️⃣ Fallback: city only (ignore addressQuery)
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

  // 4️⃣ Fallback: no city, use addressQuery globally
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

  // 5️⃣ Ultimate fallback: show everything
  count = await model.countDocuments({ status: true });
  return {
    filter: { status: true },
    ignoredFilters,
    message: "Showing all properties.",
    total: count,
  };
};
