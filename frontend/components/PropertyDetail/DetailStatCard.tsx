import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

type ThemeColors = typeof Colors.light;

interface DetailStatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  theme: ThemeColors;
}

export default function DetailStatCard({
  icon,
  label,
  value,
  theme,
}: DetailStatCardProps) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${theme.primary}10` }]}>
        <Ionicons name={icon} size={18} color={theme.primary} />
      </View>
      <Text style={[styles.value, { color: theme.primary }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[styles.label, { color: theme.muted }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: "47%",
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 8,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontSize: 18,
    fontWeight: "900",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
});
