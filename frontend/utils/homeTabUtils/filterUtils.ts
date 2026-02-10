export interface FilterOption {
  label: string;
  value: string | number;
}

export interface Filters {
  city?: string;
  country?: string;
  stateTerritory?: string;
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
  hostOption?: string;
  title?: string;
  highlighted?: string[];
  safety?: string[];
  addressQuery?: string;
}

// unified ChipKey type
export type ChipKey = keyof Filters | "hostOption";
/**
 * Converts filters to query string
 */
export const buildSelectedChips = (hostOption: string, filters: Filters) => {
  return Object.entries(filters)
    .filter(
      ([key, value]) =>
        key !== "hostOption" &&
        value !== undefined &&
        value !== null &&
        value !== "",
    )
    .map(([key, value]) => ({
      key: key as ChipKey,
      label: value.toString(),
      removable: true,
    }));
};

/**
 * Formats array of options to dropdown-friendly objects
 */
export const formatFilterOptions = (
  items: string[] | number[],
): FilterOption[] =>
  items.map((item) => ({ label: item.toString(), value: item }));
