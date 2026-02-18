import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";

interface SearchBarProps {
  value: string;
  placeholder?: string;
  onPress?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  placeholder = "Where do you want to live?",
  onPress,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const currentTheme = Colors[theme ?? "light"];

  return (
    <View style={styles.outerContainer}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.container,
          {
            backgroundColor: isDark ? "rgba(30, 31, 36, 0.95)" : "#FFFFFF",
            borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
            borderWidth: 1,
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <Ionicons
          name="search-outline"
          size={20}
          color={isDark ? "#9BA1A6" : "#6B7280"}
          style={styles.icon}
        />

        <View style={styles.textWrapper}>
          <Text
            style={[
              styles.placeholderText,
              { color: value ? currentTheme.text : "#9CA3AF" },
            ]}
            numberOfLines={1}
          >
            {value || placeholder}
          </Text>
        </View>

        <View style={styles.filterIconWrapper}>
          <Ionicons
            name="options-outline"
            size={20}
            color={currentTheme.secondary}
          />
        </View>
      </Pressable>
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20, // Slightly more rounded for a modern feel
    paddingHorizontal: 16,
    height: 56,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  icon: {
    marginRight: 12,
  },
  textWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: Typography.bodySmall.fontSize,
    fontWeight: "400",
  },
  filterIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.03)",
    justifyContent: "center",
    alignItems: "center",
  },
});
