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
  badgeCount?: number;
}

const NavItem: React.FC<NavItemProps> = ({
  item,
  theme,
  color,
  onPress,
  isActive,
  badgeCount,
}) => {
  const IconComponent = item.iconType === "Ionicons" ? Ionicons : Feather;
  const themeColors = Colors[theme];

  let itemColor = item.isLogout
    ? themeColors.danger
    : isActive
      ? "#FFFFFF"
      : color;

  const backgroundColor = isActive ? themeColors.primary : "transparent";
  const fontWeight = isActive ? "700" : "500";

  return (
    <TouchableOpacity
      style={[
        styles.navItem,
        {
          backgroundColor,
          borderColor: isActive ? "transparent" : themeColors.card,
          borderWidth: isActive ? 0 : 1,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.contentContainer}>
        <IconComponent
          name={item.iconName as any}
          size={22}
          color={itemColor}
        />
        <Text style={[styles.navText, { color: itemColor, fontWeight }]}>
          {item.label}
        </Text>
        {badgeCount !== undefined && badgeCount > 0 && (
          <View style={[styles.badge, { backgroundColor: themeColors.danger }]}>
            <Text style={styles.badgeText}>{badgeCount.toString()}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 0,
  },
  navText: {
    fontSize: 14,
    marginLeft: 18,
  },
  badge: {
    marginLeft: 8,
    minWidth: 18,
    paddingHorizontal: 5,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});

export default NavItem;
