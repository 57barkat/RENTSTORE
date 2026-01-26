import { normalizeText } from "../../../common/utils/normalize.util";

export const buildPropertyFilter = (filters: any) => {
  const filter: any = { status: true };

  // ---- Text fields ----
  if (filters.city) {
    filter["address.city"] = {
      $regex: normalizeText(filters.city),
      $options: "i",
    };
  }

  if (filters.country) {
    filter["address.country"] = {
      $regex: normalizeText(filters.country),
      $options: "i",
    };
  }

  if (filters.stateTerritory) {
    filter["address.stateTerritory"] = {
      $regex: normalizeText(filters.stateTerritory),
      $options: "i",
    };
  }

  if (filters.title) {
    filter.title = {
      $regex: normalizeText(filters.title),
      $options: "i",
    };
  }

  // ---- Rent ----
  if (filters.minRent !== undefined || filters.maxRent !== undefined) {
    filter.monthlyRent = {};
    if (filters.minRent !== undefined)
      filter.monthlyRent.$gte = filters.minRent;
    if (filters.maxRent !== undefined)
      filter.monthlyRent.$lte = filters.maxRent;
  }

  // ---- Security ----
  if (filters.minSecurity !== undefined || filters.maxSecurity !== undefined) {
    filter.SecuritybasePrice = {};
    if (filters.minSecurity !== undefined)
      filter.SecuritybasePrice.$gte = filters.minSecurity;
    if (filters.maxSecurity !== undefined)
      filter.SecuritybasePrice.$lte = filters.maxSecurity;
  }

  // ---- Capacity ----
  if (filters.bedrooms !== undefined)
    filter["capacityState.bedrooms"] = filters.bedrooms;
  if (filters.beds !== undefined) filter["capacityState.beds"] = filters.beds;
  if (filters.bathrooms !== undefined)
    filter["capacityState.bathrooms"] = filters.bathrooms;
  if (filters.Persons !== undefined)
    filter["capacityState.Persons"] = filters.Persons;

  // ---- Arrays ----
  if (filters.amenities?.length) filter.amenities = { $all: filters.amenities };
  if (filters.bills?.length) filter.ALL_BILLS = { $all: filters.bills };
  if (filters.highlighted?.length)
    filter["description.highlighted"] = { $all: filters.highlighted };
  if (filters.safety?.length)
    filter["safetyDetailsData.safetyDetails"] = { $all: filters.safety };

  if (filters.hostOption) filter.hostOption = filters.hostOption;

  // ---- Smart Address Search ----
  if (filters.addressQuery) {
    const q = normalizeText(filters.addressQuery);

    filter.$or = [
      { "address.street": { $regex: q, $options: "i" } },
      { "address.city": { $regex: q, $options: "i" } },
      { "address.stateTerritory": { $regex: q, $options: "i" } },
      { "address.country": { $regex: q, $options: "i" } },
      { title: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
    ];
  }

  return filter;
};
