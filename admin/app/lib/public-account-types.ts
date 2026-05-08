import type { PublicProperty } from "@/app/lib/property-types";

export interface PublicUserStatsResponse {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  profileImage?: string | null;
  totalProperties?: number;
  totalFavorites?: number;
}

export interface PublicMeResponse {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  profileImage?: string | null;
  isphoneverified?: boolean;
  propertyLimit?: number;
  usedPropertyCount?: number;
  paidPropertyCredits?: number;
  paidFeaturedCredits?: number;
  prioritySlotCredits?: number;
  subscription?: string;
  isEmailVerified?: boolean;
}

export interface DashboardTotals {
  totalProperties?: number;
  totalViews?: number;
  totalImpressions?: number;
  totalPromotedImpressions?: number;
  activeListings?: number;
  averageCTR?: number;
}

export interface DashboardStatsResponse {
  totals?: DashboardTotals;
  data?: PublicProperty[];
  meta?: {
    totalItems?: number;
    itemCount?: number;
    itemsPerPage?: number;
    totalPages?: number;
    currentPage?: number;
  };
}

export interface DraftListing extends Partial<PublicProperty> {
  _id: string;
}
