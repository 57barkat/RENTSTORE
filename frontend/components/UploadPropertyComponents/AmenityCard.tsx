import { cardStyles } from "@/styles/AmenitiesScreen";
import { AmenityCardProps } from "@/types/Aminities.types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FC } from "react";
import { Text, TouchableOpacity } from "react-native";

export const AmenityCard: FC<AmenityCardProps> = ({ item, isSelected, onToggle }) => (
  <TouchableOpacity
    onPress={() => onToggle(item.key)}
    style={[cardStyles.card, isSelected && cardStyles.cardSelected]}
  >
    <MaterialCommunityIcons
      name={item.iconName}
      size={28}
      color="#000"
      style={cardStyles.icon}
    />
    <Text style={cardStyles.label}>{item.label}</Text>
  </TouchableOpacity>
);
