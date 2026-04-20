export type PropertyCategory =
  | "home"
  | "apartment"
  | "hostel"
  | "shop"
  | "office";
export type PropertySort = "newest" | "price_asc" | "price_desc" | "popular";
export type HostelType = "male" | "female" | "mixed";
export type SizeUnit = "Marla" | "Kanal" | "Sq. Ft.";

export interface PropertyAddress {
  aptSuiteUnit?: string;
  street?: string;
  city?: string;
  stateTerritory?: string;
  country?: string;
  zipCode?: string;
}

export interface PropertyCapacityState {
  Persons?: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  floorLevel?: number;
}

export interface PropertyOwner {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
}

export interface PropertySize {
  value?: number;
  unit?: SizeUnit | string;
}

export interface PublicProperty {
  _id: string;
  title?: string | { value?: string; name?: string };
  hostOption?: string;
  propertyType?: string;
  hostelType?: string;
  apartmentType?: string;
  furnishing?: string;
  parking?: boolean;
  location?: string;
  area?: string;
  size?: PropertySize;
  monthlyRent?: number;
  dailyRent?: number;
  weeklyRent?: number;
  SecuritybasePrice?: number;
  ALL_BILLS?: string[];
  address?: PropertyAddress[] | PropertyAddress;
  amenities?: string[];
  photos?: string[];
  capacityState?: PropertyCapacityState;
  description?:
    | { highlighted?: string[]; value?: string; name?: string }
    | string;
  safetyDetailsData?: {
    safetyDetails?: string[];
    cameraDescription?: string;
  };
  mealPlan?: string[];
  rules?: string[];
  owner?: PropertyOwner;
  ownerId?: PropertyOwner | string;
  featured?: boolean;
  boosted?: boolean;
  isBoosted?: boolean;
  isApproved?: boolean;
  isVisible?: boolean;
  moderationStatus?: string;
  chat?: boolean;
  sortWeight?: number;
  views?: number;
  impressions?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PropertySearchFilters {
  category: PropertyCategory;
  title?: string;
  city?: string;
  location?: string;
  minRent?: number | "";
  maxRent?: number | "";
  minSize?: number | "";
  maxSize?: number | "";
  sizeUnit?: SizeUnit | "";
  amenities?: string[];
  hostelType?: HostelType | "";
  sortBy?: PropertySort;
  page?: number;
  limit?: number;
}

export interface PropertySearchResponse {
  data: PublicProperty[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  message?: string;
}
