import { MaterialCommunityIcons } from "@expo/vector-icons";

export type OptionCardProps = {
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  onPress: () => void;
};