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

  let itemColor = item.isLogout
    ? themeColors.danger
    : isActive
    ? themeColors.primary
    : color;

  const backgroundColor = isActive ? themeColors.primary + "15" : "transparent";

  const fontWeight = isActive ? "700" : "500";

  return (
    <TouchableOpacity
      style={[styles.navItem, { backgroundColor: backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {isActive && (
        <View
          style={[
            styles.activeIndicator,
            { backgroundColor: themeColors.primary },
          ]}
        />
      )}

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
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 8,
    overflow: "hidden",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 5,
  },
  activeIndicator: {
    width: 4,
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
    borderRadius: 2,
  },
  navText: {
    fontSize: 16,
    marginLeft: 18,
  },
});

export default NavItem;
