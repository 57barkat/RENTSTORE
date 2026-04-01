import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
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
            backgroundColor: isDark ? currentTheme.card : "#FFFFFF",
            borderColor: "#E8EEF3", // Matching the light blue-ish border in the image
            borderWidth: 1.5,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <Ionicons
          name="search-outline"
          size={22}
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

        {/* Vertical Separator Line */}
        <View style={[styles.separator, { backgroundColor: "#E8EEF3" }]} />

        <View style={styles.filterIconWrapper}>
          <Ionicons
            name="options-outline"
            size={22}
            color={currentTheme.secondary} // Using your brand green
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
    paddingVertical: 8,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 30, // Full pill shape as seen in image
    paddingHorizontal: 18,
    height: 60,
    // Removed heavy shadows for the clean look in the screenshot
  },
  icon: {
    marginRight: 10,
  },
  textWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: "400",
  },
  separator: {
    width: 1,
    height: 24,
    marginHorizontal: 12,
  },
  filterIconWrapper: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 4,
  },
});
