import { styles } from "@/styles/CreateStep";
import { OptionCardProps } from "@/types/CreateStep.types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FC } from "react";
import { Text, TouchableOpacity } from "react-native";

export const OptionCard: FC<OptionCardProps> = ({
  iconName,
  title,
  onPress,
}) => (
  <TouchableOpacity onPress={onPress} style={styles.cardContainer}>
    <MaterialCommunityIcons
      name={iconName}
      size={28}
      color="#000"
      style={styles.cardIcon}
    />
    <Text style={styles.cardTitle}>{title}</Text>
    <MaterialCommunityIcons name="chevron-right" size={24} color="#777" />
  </TouchableOpacity>
);
