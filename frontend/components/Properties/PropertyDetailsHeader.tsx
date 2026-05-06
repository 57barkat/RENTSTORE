import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";

type ThemeColors = typeof Colors.light;

interface PropertyDetailsHeaderProps {
  theme: ThemeColors;
  isDark: boolean;
  onBack: () => void;
  onShare: () => void;
  onReport?: () => void;
}

export const PropertyDetailsHeader = ({
  theme,
  isDark,
  onBack,
  onShare,
  onReport,
}: PropertyDetailsHeaderProps) => {
  const insets = useSafeAreaInsets();
  const buttonColor = isDark ? "rgba(15,23,42,0.78)" : "rgba(255,255,255,0.94)";

  return (
    <View
      style={[
        styles.container,
        {
          top: Math.max(insets.top + 6, 18),
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.button, { backgroundColor: buttonColor }]}
        onPress={onBack}
        activeOpacity={0.85}
      >
        <Ionicons name="chevron-back" size={22} color={theme.text} />
      </TouchableOpacity>
      <View style={styles.actionRow}>
        {onReport ? (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: buttonColor }]}
            onPress={onReport}
            activeOpacity={0.85}
          >
            <Feather name="flag" size={18} color={theme.text} />
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: buttonColor }]}
          onPress={onShare}
          activeOpacity={0.85}
        >
          <Feather name="share" size={19} color={theme.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  button: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 5,
  },
});
