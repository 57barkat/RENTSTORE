import React from "react";
import {
  View,
  StyleSheet,
  Platform,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import Logo from "./logo";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../constants/Colors";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useSidebar } from "@/contextStore/SidebarContext";

export default function Header() {
  const { theme, setTheme, resetToSystem } = useTheme();
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
});
