import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";

const benefitsMap: Record<string, string[]> = {
  single: [
    "Instant activation",
    "Visible for 30 days",
    "Direct WhatsApp leads",
  ],
  standard: [
    "Standard priority",
    "Verified badge",
    "WhatsApp leads",
    "5 Active listings",
  ],
  business_pro: [
    "20 Property Uploads",
    "5 Featured 'Top' Placements",
    "Priority Agent Support",
    "2x More Engagement",
    "Advanced Analytics",
  ],
};

export const PackageBenefits = ({ packageId }: { packageId: string }) => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  return (
    <View style={styles.benefitsWrapper}>
      {benefitsMap[packageId]?.map((benefit, index) => (
        <View key={index} style={styles.benefitItem}>
          <MaterialCommunityIcons
            name="check-decagram"
            size={14}
            color={
              packageId === "business_pro"
                ? currentTheme.accent
                : currentTheme.success
            }
          />
          <Text style={[styles.benefitText, { color: currentTheme.muted }]}>
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
  benefitItem: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  benefitText: { fontSize: 12, marginLeft: 10, fontWeight: "500" },
});
