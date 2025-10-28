import { MaterialCommunityIcons } from "@expo/vector-icons";
export interface AmenityCardProps {
  item: AmenityItem;
  isSelected: boolean;
  onToggle: (key: string) => void;
  textColor?: string;
  iconColor?: string;
  selectedBackgroundColor?: string;
}

export type AmenityItem = {
  key: string;
  label: string;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
};
