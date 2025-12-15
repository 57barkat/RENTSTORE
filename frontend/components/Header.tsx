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
  const currentTheme = Colors[theme ?? "light"];
  const headerBg = theme === "light" ? "#ffffff" : currentTheme.primary;

  const { isVerified, hasToken } = useAuth();
  const router = useRouter();
  const { toggle } = useSidebar();

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <>
      <View style={[styles.container, { backgroundColor: headerBg }]}>
        {/* MENU BUTTON */}
        <TouchableOpacity style={styles.menuButton} onPress={toggle}>
          <Ionicons name="menu" size={32} color={currentTheme.text} />
        </TouchableOpacity>

        {/* LOGO */}
        <View style={styles.logoContainer}>
          <Logo />
        </View>

        {/* THEME TOGGLE */}
        <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
          {theme === "dark" ? (
            <MaterialCommunityIcons
              name="weather-sunny"
              size={28}
              color={currentTheme.text}
            />
          ) : (
            <MaterialCommunityIcons
              name="moon-waning-crescent"
              size={28}
              color={currentTheme.text}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* CAUTION BANNER */}
      {!isVerified && hasToken && (
        <View style={styles.cautionBanner}>
          <Text style={styles.cautionText}>
            ⚠️ Your phone number is not verified. Your account may be deleted
            soon, and some services may be unavailable.
          </Text>
          <Text
            style={[
              styles.cautionText,
              { textDecorationLine: "underline", marginTop: 5 },
            ]}
            onPress={() => router.push("/Verification")}
          >
            Click here to verify
          </Text>
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
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 44,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  menuButton: {
    padding: 4,
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
  },
  themeToggle: {
    padding: 4,
  },
  cautionBanner: {
    backgroundColor: "#FFF3CD",
    borderBottomWidth: 1,
    borderColor: "#FFEEBA",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cautionText: {
    color: "#856404",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});
