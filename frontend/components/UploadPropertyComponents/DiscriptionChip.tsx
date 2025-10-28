import { chipStyles } from "@/styles/ListingDescriptionHighlightsScreen";
import { ChipProps } from "@/types/ListingDescriptionHighlightsScreen.types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FC } from "react";
import { Text, TouchableOpacity } from "react-native";

export const Chip: FC<ChipProps & {
  textColor?: string;
  iconColor?: string;
  selectedBackgroundColor?: string;
  unselectedBackgroundColor?: string;
}> = ({
  highlight,
  isSelected,
  onToggle,
  textColor = "#000",
  iconColor = "#000",
  selectedBackgroundColor = "#000",
  unselectedBackgroundColor = "#fff",
}) => (
  <TouchableOpacity
    onPress={() => onToggle(highlight.key)}
    style={[
      chipStyles.chip,
      { backgroundColor: isSelected ? selectedBackgroundColor : unselectedBackgroundColor }
    ]}
    activeOpacity={0.7}
  >
    <MaterialCommunityIcons
      name={highlight.iconName}
      size={18}
      color={iconColor}
      style={chipStyles.icon}
    />
    <Text style={[chipStyles.label, { color: textColor }]}>
      {highlight.label}
    </Text>
  </TouchableOpacity>
);
