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
}

/**
 * Converts filters to query string
 */
export const buildQueryParams = (filters: Filters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v.toString()));
      } else {
        params.append(key, value.toString());
      }
    }
  });
  return params.toString();
};

/**
 * Formats array of options to dropdown-friendly objects
 */
export const formatFilterOptions = (
  items: string[] | number[]
): FilterOption[] =>
  items.map((item) => ({ label: item.toString(), value: item }));
