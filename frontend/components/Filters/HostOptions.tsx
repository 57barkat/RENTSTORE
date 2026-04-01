import { useHostOptions as hostOptions } from "@/utils/homeTabUtils/HostOption";
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { FontSize, Typography } from "@/constants/Typography";

interface HostOptionsRowProps {
  onSelect?: (id: string) => void;
}

const HostOptionsRow: React.FC<HostOptionsRowProps> = ({ onSelect }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const currentColors = Colors[theme];

  const options = hostOptions();

  return (
    <View style={styles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.optionCard,
            {
              backgroundColor: currentColors.card,
              borderColor: currentColors.border,
            },
          ]}
          onPress={() => onSelect?.(option.id)}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>{option.icon}</View>
          <Text style={[styles.label, { color: currentColors.muted }]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: 20,
    gap: 12,
  },
  optionCard: {
    flex: 1,
    height: 90, // Adjusted height to match the rectangular look in image
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    // Subtle shadow for elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    letterSpacing: -0.2,
    textAlign: "center",
  },
});

export default HostOptionsRow;
