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
  const { theme, setTheme, resetToSystem } = useTheme();
  const { isAuthenticated, isPhoneVerified } = useAuth();
  const router = useRouter();
  const { toggle } = useSidebar();

  const isDark = theme === "dark";
  const isLight = theme === "light";
  const isSystem = !isDark && !isLight;

  const currentTheme = Colors[isDark ? "dark" : "light"];

  const toggleTheme = async () => {
    if (isSystem) {
      setTheme("dark");
    } else if (isDark) {
      setTheme("light");
    } else {
      resetToSystem();
    }
  };

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
            backgroundColor: currentTheme.background,
            borderBottomColor: currentTheme.border,
            shadowColor: currentTheme.shadow,
          },
        ]}
      >
        {/* Left Action: Sidebar */}
        <TouchableOpacity
          onPress={toggle}
          style={[
            styles.iconButton,
            {
              backgroundColor: currentTheme.card,
              borderColor: currentTheme.border,
            },
          ]}
          activeOpacity={0.6}
        >
          <Ionicons name="grid-outline" size={22} color={currentTheme.text} />
        </TouchableOpacity>

        {/* Center: Logo */}
        <View style={styles.logoWrapper}>
          <Logo />
        </View>

        {/* Right Action: Theme Toggle */}
        <TouchableOpacity
          onPress={toggleTheme}
          style={[
            styles.iconButton,
            {
              backgroundColor: currentTheme.card,
              borderColor: currentTheme.border,
            },
          ]}
          activeOpacity={0.6}
        >
          <MaterialCommunityIcons
            name={
              isSystem
                ? "theme-light-dark"
                : isDark
                  ? "moon-waning-crescent"
                  : "white-balance-sunny"
            }
            style={{ transform: [{ rotate: "-45deg" }] }}
            size={22}
            color={
              isSystem
                ? currentTheme.primary
                : isDark
                  ? currentTheme.secondary
                  : currentTheme.primary
            }
          />
        </TouchableOpacity>
      </View>

      {/* Modern Phone Verification Banner */}
      {isAuthenticated && !isPhoneVerified && (
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
                    fontSize: 11,
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
              <Text
                style={[styles.verifyLink, { color: currentTheme.warning }]}
              >
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
      Platform.OS === "android" ? (StatusBar.currentHeight ?? 20) + 12 : 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    zIndex: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  logoWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

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
    fontSize: 14,
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
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
});
