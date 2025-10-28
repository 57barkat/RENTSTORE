import { styles } from "@/styles/CreateStep";
import { OptionCardProps } from "@/types/CreateStep.types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FC } from "react";
import { Text, TouchableOpacity } from "react-native";

export const OptionCard: FC<OptionCardProps> = ({
  iconName,
  title,
  onPress,
  backgroundColor = "#fff",
  iconColor = "#000",
  textColor = "#000",
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.cardContainer, { backgroundColor }]}
  >
    <MaterialCommunityIcons
      name={iconName}
      size={28}
      color={iconColor}
      style={styles.cardIcon}
    />
    <Text style={[styles.cardTitle, { color: textColor }]}>{title}</Text>
    <MaterialCommunityIcons
      name="chevron-right"
      size={24}
      color={iconColor}
    />
  </TouchableOpacity>
);
