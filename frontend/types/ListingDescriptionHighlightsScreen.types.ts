import { MaterialCommunityIcons } from "@expo/vector-icons";

export type Highlight = {
  key: string;
  label: string;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
};

export interface ChipProps {
  highlight: Highlight;
  isSelected: boolean;
  onToggle: (key: string) => void;
}

export interface description {
  description: string;  
}
