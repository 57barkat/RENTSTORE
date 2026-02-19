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
