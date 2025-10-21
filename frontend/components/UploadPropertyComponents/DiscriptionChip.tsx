import { chipStyles } from "@/styles/ListingDescriptionHighlightsScreen";
import { ChipProps } from "@/types/ListingDescriptionHighlightsScreen.types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FC } from "react";
import { Text, TouchableOpacity } from "react-native";

export const Chip: FC<ChipProps> = ({ highlight, isSelected, onToggle }) => (
  <TouchableOpacity
    onPress={() => onToggle(highlight.key)}
    style={[chipStyles.chip, isSelected && chipStyles.chipSelected]}
    activeOpacity={0.7}
  >
    <MaterialCommunityIcons
      name={highlight.iconName}
      size={18}
      color={isSelected ? "#fff" : "#000"}
      style={chipStyles.icon}
    />
    <Text style={[chipStyles.label, isSelected && chipStyles.labelSelected]}>
      {highlight.label}
    </Text>
  </TouchableOpacity>
);
