import { cardStyles } from "@/styles/BookingSettingsScreen";
import { SettingCardProps } from "@/types/BookingSettingsScreen.types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FC } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export const SettingCard: FC<SettingCardProps> = ({
  setting,
  title,
  subtitle,
  iconName,
  isSelected,
  recommended = false,
  onSelect,
}) => (
  <TouchableOpacity
    onPress={() => onSelect(setting)}
    style={[cardStyles.card, isSelected && cardStyles.cardSelected]}
  >
    <View style={cardStyles.textContainer}>
      <Text style={cardStyles.title}>{title}</Text>
      {recommended && (
        <Text style={cardStyles.recommendedText}>Recommended</Text>
      )}
      <Text style={cardStyles.subtitle}>{subtitle}</Text>
    </View>
    <MaterialCommunityIcons name={iconName} size={28} color="#000" />
  </TouchableOpacity>
);
