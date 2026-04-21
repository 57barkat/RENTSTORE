export interface PropertyFilters {
  city?: string;
  stateTerritory?: string;
  country?: string;
  title?: string;
  addressQuery?: string;
  persons?: number;
  minRent?: number;
  maxRent?: number;
  minSecurity?: number;
  maxSecurity?: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  /** @deprecated prefer `persons` */
  Persons?: number;
  floorLevel?: number;
  amenities?: string[];
  bills?: string[];
  highlighted?: string[];
  safety?: string[];
  hostOption?: string;
  relaxed?: boolean;
}
