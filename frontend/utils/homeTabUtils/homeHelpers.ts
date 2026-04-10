import { formatProperties } from "./formatProperties";

/**
 * Maps raw API data to the frontend PropertyCardProps interface.
 * Ensures that sortWeight and monthlyRent are preserved for the UI.
 */
export const formatAndTagFavorites = (
  rawData: any[],
  city: string,
  favoriteIds: string[],
) => {
  // Ensure we are passing rawData correctly to formatProperties
  const formatted = formatProperties(rawData || [], city);

  return formatted.map((p, index) => {
    // Look up the original raw item to get weight/featured status
    // if formatProperties doesn't already include them.
    const rawItem = rawData[index];

    return {
      ...p,
      // Priority: 1. check formatted object, 2. check rawItem, 3. fallback
      sortWeight: p.sortWeight || rawItem?.sortWeight || 1,
      featured: p.featured || rawItem?.featured || false,
      monthlyRent: p.monthlyRent || rawItem?.monthlyRent || p.rent,
      // Identification
      isFav: favoriteIds.includes(p.id),
    };
  });
};

export const getSectionsData = (
  homes: any[],
  homesLoading: boolean,
  rooms: any[],
  roomsLoading: boolean,
  apartments: any[],
  apartmentsLoading: boolean,
) => [
  {
    title: "Homes",
    properties: homes,
    queryLoading: homesLoading,
    hostOption: "home",
  },
  {
    title: "Hostels",
    properties: rooms,
    queryLoading: roomsLoading,
    hostOption: "hostel",
  },
  {
    title: "Apartments",
    properties: apartments,
    queryLoading: apartmentsLoading,
    hostOption: "apartment",
  },
];
