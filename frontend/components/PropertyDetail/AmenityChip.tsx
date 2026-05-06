import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

type ThemeColors = typeof Colors.light;

interface AmenityChipProps {
  label: string;
  theme: ThemeColors;
  accentColor?: string;
}

export default function AmenityChip({
  label,
  theme,
  accentColor,
}: AmenityChipProps) {
  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: theme.background,
          borderColor: theme.border,
        },
      ]}
    >
      <Ionicons
        name="checkmark-circle"
        size={14}
        color={accentColor || theme.success}
      />
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
});
