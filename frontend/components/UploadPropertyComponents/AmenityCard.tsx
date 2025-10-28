import { FC, useContext } from "react";
import { Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { cardStyles } from "@/styles/AmenitiesScreen";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { AmenityCardProps } from "@/types/Aminities.types";

export const AmenityCard: FC<AmenityCardProps> = ({
  item,
  isSelected,
  onToggle,
  textColor,
  iconColor,
  selectedBackgroundColor,
}) => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  return (
    <TouchableOpacity
      onPress={() => onToggle(item.key)}
      style={[
        cardStyles.card,
        isSelected && {
          backgroundColor: selectedBackgroundColor ?? currentTheme.primary,
        },
      ]}
    >
      <MaterialCommunityIcons
        name={item.iconName}
        size={28}
        color={iconColor ?? (isSelected ? "#fff" : currentTheme.icon)}
        style={cardStyles.icon}
      />
      <Text style={[cardStyles.label, { color: textColor ?? currentTheme.text }]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );
};
