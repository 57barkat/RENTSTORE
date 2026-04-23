interface PropertyItem {
  _id: string;
  title: string;
  address?: { city?: string; country?: string }[];
  monthlyRent?: number;
  dailyRent?: number;
  weeklyRent?: number;
  defaultRentType?: "daily" | "weekly" | "monthly";
  photos?: string[];
  featured?: boolean;
  isFav?: boolean;
  views?: number;
}

interface PropertyCardProps {
  id: string;
  _id?: string;
  title: string;
  city?: string;
  location?: string;
  country?: string;
  rent?: number;
  monthlyRent?: number;
  dailyRent?: number;
  weeklyRent?: number;
  defaultRentType?: "daily" | "weekly" | "monthly";
  image?: string;
  photos?: string[];
  featured?: boolean;
  isBoosted?: boolean;
  sortWeight?: number;
  isFav?: boolean;
  views: number;
  onFavPress?: (id: string) => void;
}

interface SectionData {
  title: string;
  properties: PropertyCardProps[];
  queryLoading: boolean;
  hostOption: string;
}
interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFavPress?: () => void;
}

interface PropertySectionProps {
  sectionTitle: string;
  properties: PropertyCardProps[];
  onViewAll?: () => void;
  onCardPress?: (id: string) => void;
  loading?: boolean;
  hostOption?: string;
}
export type {
  PropertyItem,
  PropertyCardProps,
  SectionData,
  SearchBarProps,
  PropertySectionProps,
};
