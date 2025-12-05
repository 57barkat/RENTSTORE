interface PropertyItem {
  _id: string;
  title: string;
  address?: { city?: string; country?: string }[];
  monthlyRent?: number;
  photos?: string[];
  featured?: boolean;
  isFav?: boolean;
}

interface PropertyCardProps {
  id: string;
  title: string;
  city?: string;
  country?: string;
  rent?: number;
  image?: string;
  featured?: boolean;
  isFav?: boolean;
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
