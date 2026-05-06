import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import type { PropertyDetailData } from "@/types/PropertyDetailScreen.types";
import {
  isActiveBoostedPromotion,
  isActiveFeaturedPromotion,
} from "@/utils/properties/promotion";

type ThemeColors = typeof Colors.light;

interface PromotionBadgeProps {
  property: PropertyDetailData;
  theme: ThemeColors;
}

export default function PromotionBadge({
  property,
  theme,
}: PromotionBadgeProps) {
  const isFeatured = isActiveFeaturedPromotion(property);
  const isBoosted = !isFeatured && isActiveBoostedPromotion(property);

  if (!isFeatured && !isBoosted) {
    return null;
  }

  const label = isFeatured ? "Featured" : "Boosted";
  const iconName = isFeatured ? "star" : "trending-up";
  const backgroundColor = isFeatured ? "#EF4444" : theme.primary;

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Ionicons
        name={iconName as keyof typeof Ionicons.glyphMap}
        size={11}
        color="#FFFFFF"
      />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
});
