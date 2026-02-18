import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/contextStore/AuthContext";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../constants/Colors";
import { FontSize } from "@/constants/Typography";

export default function PhoneVerificationBanner() {
  const { isAuthenticated, isPhoneVerified } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  const isDark = theme === "dark";
  const currentTheme = Colors[isDark ? "dark" : "light"];

  // Don't render anything if verified or not logged in
  if (!isAuthenticated || isPhoneVerified) return null;

  return (
    <View
      style={[
        styles.bannerWrapper,
        { backgroundColor: currentTheme.background },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.cautionBanner,
          {
            backgroundColor: isDark ? "#1E1A11" : "#FFFBEB",
            borderColor: currentTheme.warning,
          },
        ]}
        onPress={() => router.push("/Verification")}
        activeOpacity={0.8}
      >
        <View style={styles.bannerContent}>
          <View
            style={[
              styles.warningIconCircle,
              { backgroundColor: isDark ? "#453008" : "#FDE68A" },
            ]}
          >
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={16}
              color={currentTheme.warning}
            />
          </View>

          <View>
            <Text
              style={[
                styles.cautionText,
                { color: isDark ? currentTheme.accent : "#92400E" },
              ]}
            >
              Security Check
            </Text>
            <Text
              style={{
                fontSize: FontSize.xs,
                color: isDark ? currentTheme.accent : "#8b4e28",
                fontWeight: "500",
              }}
            >
              Verify phone to secure account
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.verifyLinkWrapper,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.03)",
            },
          ]}
        >
          <Text style={[styles.verifyLink, { color: currentTheme.warning }]}>
            Verify
          </Text>
          <Ionicons
            name="arrow-forward"
            size={14}
            color={currentTheme.warning}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  cautionBanner: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  warningIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cautionText: {
    fontSize: FontSize.base,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  verifyLinkWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  verifyLink: {
    fontSize: FontSize.sm,
    fontWeight: "800",
    textTransform: "uppercase",
  },
});
