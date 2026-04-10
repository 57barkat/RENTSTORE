import React from "react";
import {
  View,
  StyleSheet,
  Platform,
  StatusBar,
  TouchableOpacity,
  Text,
} from "react-native";
import Logo from "./logo";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../constants/Colors";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useSidebar } from "@/contextStore/SidebarContext";
import { useAuth } from "@/contextStore/AuthContext";
import { useRouter } from "expo-router";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { toggle } = useSidebar();
  const { isGuest } = useAuth();
  const router = useRouter();
  const isDark = theme === "dark";

  const currentTheme = Colors[isDark ? "dark" : "light"];

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const handleLoginPress = () => {
    router.push("/signin");
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
        {isGuest ? (
          <TouchableOpacity
            onPress={handleLoginPress}
            style={[
              styles.loginButton,
              {
                backgroundColor: currentTheme.primary,
                shadowColor: currentTheme.primary,
              },
            ]}
            activeOpacity={0.8}
          >
            <Ionicons name="person-circle-outline" size={18} color="#FFF" />
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        ) : (
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
        )}

        <View style={styles.logoWrapper}>
          <Logo />
        </View>

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
            name={isDark ? "moon-waning-crescent" : "white-balance-sunny"}
            style={{ transform: [{ rotate: "-45deg" }] }}
            size={22}
            color={isDark ? currentTheme.secondary : currentTheme.primary}
          />
        </TouchableOpacity>
      </View>
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
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 20,
    gap: 6,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loginText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "SpaceMono",
  },
  logoWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
