import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { MenuItem } from "@/utils/sidebarMenuItems";

interface NavItemProps {
  item: MenuItem;
  theme: "light" | "dark";
  color: string;
  onPress: () => void;
  isActive: boolean;
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

  // Modified color logic: Active items use themeColors.text for high contrast against primary background
  let itemColor = item.isLogout
    ? themeColors.danger
    : isActive
      ? themeColors.text
      : color;

  // Modified background/border for a pill-shaped effect:
  const backgroundColor = isActive ? themeColors.primary : "transparent";

  const fontWeight = isActive ? "700" : "500";

  return (
    <TouchableOpacity
      style={[
        styles.navItem,
        {
          backgroundColor: backgroundColor,
          // Add border to non-active items for better definition in light mode
          borderColor: isActive ? "transparent" : themeColors.card,
          borderWidth: isActive ? 0 : 1, // Only show border when not active
        },
      ]}
      onPress={onPress}
      activeOpacity={0.85} // Softer press interaction
    >
      {/* Removed the activeIndicator View */}

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

const styles = StyleSheet.create({
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14, // Increased padding for better hit area and visual weight
    paddingHorizontal: 15,
    borderRadius: 12, // Increased borderRadius for a defined pill shape
    marginBottom: 10, // Increased margin for better separation
    overflow: "hidden",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 0, // Adjusted as left indicator is removed
  },
  // Removed activeIndicator style
  navText: {
    fontSize: 16,
    marginLeft: 18,
  },
});

export default NavItem;
