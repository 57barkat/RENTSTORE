import type { RentType } from "@/utils/properties/rent";

export interface PropertyOwner {
  _id?: string;
  name?: string;
  profileImage?: string;
  phone?: string;
  role?: string;
  subscription?: string;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
}

export interface PropertyAddress {
  street?: string;
  city?: string;
  stateTerritory?: string;
  country?: string;
  aptSuiteUnit?: string;
}

export interface PropertyCapacityState {
  Persons?: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  floorLevel?: number;
}

export interface PropertySize {
  value?: number;
  unit?: string;
}

export interface PropertyDetailData {
  _id?: string;
  ownerId?: string;
  owner?: PropertyOwner;
  title?: string;
  hostOption?: string;
  category?: string;
  area?: string;
  location?: string;
  addressQuery?: string;
  address?: PropertyAddress[];
  monthlyRent?: number;
  weeklyRent?: number;
  dailyRent?: number;
  defaultRentType?: RentType;
  SecuritybasePrice?: number;
  size?: PropertySize;
  capacityState?: PropertyCapacityState;
  amenities?: string[];
  ALL_BILLS?: string[];
  photos?: string[];
  featured?: boolean;
  featuredUntil?: string;
  isBoosted?: boolean;
  boostedUntil?: string;
  isApproved?: boolean;
  lat?: number;
  lng?: number;
}
