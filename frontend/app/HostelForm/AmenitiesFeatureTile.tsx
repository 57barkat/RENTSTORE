import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { styles } from "@/styles/HostelForm.styles";

interface FeatureTileProps {
  item: { key: string; label: string };
  isSelected: boolean;
  toggleSelection: (key: string) => void;
  iconName: string;
  theme: keyof typeof Colors;
}

export const AmenitiesFeatureTile: React.FC<FeatureTileProps> = ({
  item,
  isSelected,
  toggleSelection,
  iconName,
  theme,
}) => {
  const currentTheme = Colors[theme];

  return (
    <TouchableOpacity
      key={item.key}
      onPress={() => toggleSelection(item.key)}
      style={[
        styles.amenityTile,
        {
          backgroundColor: isSelected
            ? currentTheme.primary
            : currentTheme.card,
          borderColor: isSelected ? currentTheme.primary : currentTheme.border,
        },
      ]}
    >
      <FontAwesome
        name={iconName as any}
        size={20}
        color={isSelected ? "#fff" : currentTheme.primary}
      />
      <Text
        style={[
          styles.amenityText,
          { color: isSelected ? "#fff" : currentTheme.text },
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );
};
