import { MaterialCommunityIcons } from "@expo/vector-icons";

export type BookingSetting = "manual" | "instant";

export interface SettingCardProps {
  setting: BookingSetting;
  title: string;
  subtitle: string;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  isSelected: boolean;
  recommended?: boolean;
  onSelect: (setting: BookingSetting) => void;
}
