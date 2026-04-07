import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";

const benefitsMap: Record<string, string[]> = {
  free: [
    "3 Property uploads per month",
    "Standard search placement",
    "Visible for 30 days",
  ],
  standard: [
    "10 Active listings",
    "2 Priority slots",
    "Verified account badge",
    "Direct WhatsApp leads",
    "Standard support",
  ],
  pro: [
    "40 Active listings",
    "8 Priority slots",
    "Advanced performance analytics",
    "Fast-track agent support",
    "Featured on homepage",
    "Social media shoutouts",
  ],
  featured_boost: [
    "Single property 'Top' placement",
    "Highlighted border in search",
    "10x higher view rate",
    "Priority in category results",
  ],
};

export const PackageBenefits = ({ packageId }: { packageId: string }) => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const isPro = packageId === "pro";
  const isFeatured = packageId === "featured_boost";

  return (
    <View style={styles.benefitsWrapper}>
      {benefitsMap[packageId]?.map((benefit, index) => (
        <View key={index} style={styles.benefitItem}>
          <MaterialCommunityIcons
            name={
              (isPro || isFeatured ? "star-decagram" : "check-decagram") as any
            }
            size={14}
            color={
              isPro
                ? currentTheme.accent
                : isFeatured
                  ? "#EAB308"
                  : currentTheme.success
            }
          />
          <Text
            style={[styles.benefitText, { color: currentTheme.text + "CC" }]}
          >
            {benefit}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  benefitsWrapper: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 12,
    marginLeft: 10,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
});
