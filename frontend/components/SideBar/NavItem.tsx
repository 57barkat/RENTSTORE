import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
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

  const isLogout = item.isLogout;

  const baseColor = isLogout ? themeColors.danger : themeColors.primary;

  const iconBgColor = baseColor + "15";

  return (
    <TouchableOpacity
      style={[
        styles.navItem,
        {
          borderBottomColor: themeColors.card + "50",
          backgroundColor: isActive ? baseColor + "0D" : "transparent",
          borderColor: isActive ? baseColor + "30" : "transparent",
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.contentContainer}>
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: isActive ? baseColor + "20" : iconBgColor,
            },
          ]}
        >
          <IconComponent
            name={item.iconName as any}
            size={20}
            color={baseColor}
          />
        </View>

        <Text
          style={[
            styles.navText,
            {
              color: isLogout ? themeColors.danger : themeColors.secondary,
              fontWeight: isActive ? "700" : "500",
            },
          ]}
        >
          {item.label}
        </Text>

        <View style={styles.rightSection}>
          {badgeCount !== undefined && badgeCount > 0 ? (
            <View
              style={[styles.badge, { backgroundColor: themeColors.danger }]}
            >
              <Text style={styles.badgeText}>{badgeCount.toString()}</Text>
            </View>
          ) : (
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={
                isLogout ? themeColors.danger : themeColors.secondary + "80"
              }
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 8,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  navText: {
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 15,
    flex: 1,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
});

export default NavItem;
