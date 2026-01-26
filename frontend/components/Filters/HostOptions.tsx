import { useHostOptions as hostOptions } from "@/utils/homeTabUtils/HostOption";
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";

interface HostOptionsRowProps {
  onSelect?: (id: string) => void;
}

const HostOptionsRow: React.FC<HostOptionsRowProps> = ({ onSelect }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const currentColors = Colors[theme];

  const options = hostOptions();

  return (
    <View style={styles.container}>
      {options.map((option) => (
        <View key={option.id} style={styles.optionWrapper}>
          <TouchableOpacity
            style={[
              styles.iconCircle,
              {
                backgroundColor: isDark ? "#2A2A32" : "#F3F4F6",
                borderColor: isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.02)",
                borderWidth: 1,
              },
            ]}
            onPress={() => onSelect?.(option.id)}
            activeOpacity={0.7}
          >
            {option.icon}
          </TouchableOpacity>
          <Text
            style={[styles.label, { color: isDark ? "#A1A1AA" : "#4B5563" }]}
          >
            {option.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingHorizontal: 10,
    marginVertical: 20,
  },
  optionWrapper: {
    alignItems: "center",
    gap: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: Platform.OS === "ios" ? 0.08 : 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: -0.3,
    textAlign: "center",
  },
});

export default HostOptionsRow;
