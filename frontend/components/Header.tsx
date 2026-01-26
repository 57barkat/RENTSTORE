import React from "react";
import {
  View,
  StyleSheet,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
} from "react-native";
import Logo from "./logo";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../constants/Colors";
import { useRouter } from "expo-router";
import { useAuth } from "@/contextStore/AuthContext";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useSidebar } from "@/contextStore/SidebarContext";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, isPhoneVerified } = useAuth();
  const router = useRouter();
  const { toggle } = useSidebar();

  const isDark = theme === "dark";
  const currentTheme = Colors[isDark ? "dark" : "light"];

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? "rgba(20, 20, 25, 0.95)"
              : "rgba(255, 255, 255, 0.98)",
            borderBottomColor: currentTheme.border,
          },
        ]}
      >
        {/* Left Action: Sidebar */}
        <TouchableOpacity
          onPress={toggle}
          style={[
            styles.iconButton,
            { backgroundColor: isDark ? "#2A2A32" : "#F3F4F6" },
          ]}
          activeOpacity={0.7}
        >
          <Ionicons name="menu-outline" size={26} color={currentTheme.text} />
        </TouchableOpacity>

        {/* Center: Logo */}
        <View style={styles.logoWrapper}>
          <Logo />
        </View>

        {/* Right Action: Theme */}
        <TouchableOpacity
          onPress={toggleTheme}
          style={[
            styles.iconButton,
            { backgroundColor: isDark ? "#2A2A32" : "#F3F4F6" },
          ]}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={isDark ? "weather-sunny" : "weather-night"}
            size={22}
            color={isDark ? "#FDB813" : "#4B5563"}
          />
        </TouchableOpacity>
      </View>

      {/* Modern Phone Verification Banner */}
      {isAuthenticated && !isPhoneVerified && (
        <TouchableOpacity
          style={[
            styles.cautionBanner,
            {
              backgroundColor: isDark ? "#2D2010" : "#FFFBEB",
              borderColor: isDark ? "#78350F" : "#FEF3C7",
            },
          ]}
          onPress={() => router.push("/Verification")}
          activeOpacity={0.9}
        >
          <View style={styles.bannerContent}>
            <View
              style={[
                styles.warningIconCircle,
                { backgroundColor: isDark ? "#78350F" : "#FDE68A" },
              ]}
            >
              <MaterialCommunityIcons
                name="shield-alert-outline"
                size={16}
                color={isDark ? "#FCD34D" : "#92400E"}
              />
            </View>
            <Text
              style={[
                styles.cautionText,
                { color: isDark ? "#FDE68A" : "#92400E" },
              ]}
            >
              Verify your phone number
            </Text>
          </View>
          <View style={styles.verifyLinkWrapper}>
            <Text
              style={[
                styles.verifyLink,
                { color: isDark ? "#FBBF24" : "#D97706" },
              ]}
            >
              Verify
            </Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={isDark ? "#FBBF24" : "#D97706"}
            />
          </View>
        </TouchableOpacity>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight ?? 20) + 12 : 54,
    paddingHorizontal: 20,
    // paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    // Elevation for Android
    elevation: 4,
    zIndex: 10,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cautionBanner: {
    marginHorizontal: 6,
    marginTop: 2,
    marginBottom: 2,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  warningIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cautionText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  verifyLinkWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  verifyLink: {
    fontSize: 13,
    fontWeight: "700",
  },
});
