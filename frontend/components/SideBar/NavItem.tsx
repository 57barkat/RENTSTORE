import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors"; // Assuming this is your color palette
import { MenuItem } from "@/utils/sidebarMenuItems";

interface NavItemProps {
  item: MenuItem;
  theme: "light" | "dark"; // Added theme prop for dynamic colors
  color: string; // Base color for the item (e.g., secondary color)
  onPress: () => void;
  isActive: boolean; // Crucial prop to indicate the currently active route
}

const NavItem: React.FC<NavItemProps> = ({
  item,
  theme,
  color,
  onPress,
  isActive,
}) => {
  const IconComponent = item.iconType === "Ionicons" ? Ionicons : Feather;
  const themeColors = Colors[theme];

  // Determine the primary text/icon color
  let itemColor = item.isLogout
    ? themeColors.danger
    : isActive
    ? themeColors.primary // Active item uses primary color
    : color; // Inactive item uses the provided base color (secondary/text)

  // Determine the background color
  const backgroundColor = isActive
    ? themeColors.primary + "15" // 15% opacity primary color for active background
    : "transparent";

  // Use a bold font weight for the active item
  const fontWeight = isActive ? "700" : "500";

  return (
    <TouchableOpacity
      style={[styles.navItem, { backgroundColor: backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.7} // Improve press feedback
    >
      {/* Visual Indicator Bar (only for active item) */}
      {isActive && (
        <View
          style={[
            styles.activeIndicator,
            { backgroundColor: themeColors.primary },
          ]}
        />
      )}

      {/* Icon and Text Container */}
      <View style={styles.contentContainer}>
        <IconComponent
          name={item.iconName as any}
          size={22}
          color={itemColor}
        />
        <Text
          style={[styles.navText, { color: itemColor, fontWeight: fontWeight }]}
        >
          {item.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// --- Stylesheet for Redesigned Component ---
const styles = StyleSheet.create({
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15, // Increased padding
    borderRadius: 10,
    marginBottom: 8, // Increased margin for better separation
    overflow: "hidden", // Ensures indicator bar stays inside bounds
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1, // Ensures content takes full width
    marginLeft: 5, // Offset for the indicator bar
  },
  activeIndicator: {
    width: 4, // Thin vertical bar
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
    borderRadius: 2,
  },
  navText: {
    fontSize: 16, // Slightly reduced font size for modern feel
    marginLeft: 18,
    // Font weight is dynamically set in the component
  },
});

export default NavItem;
