import { formatProperties } from "./formatProperties";

export const formatAndTagFavorites = (
  rawData: any[],
  city: string,
  favoriteIds: string[],
) => {
  return formatProperties(rawData || [], city).map((p) => ({
    ...p,
    isFav: favoriteIds.includes(p.id),
  }));
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
