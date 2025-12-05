import { useHostOptions as hostOptions } from "@/utils/homeTabUtils/HostOption";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";

interface HostOptionsRowProps {
  onSelect?: (id: string) => void;
}

const HostOptionsRow: React.FC<HostOptionsRowProps> = ({ onSelect }) => {
  const { theme } = useTheme();
  const currentColors = Colors[theme];

  const options = hostOptions();

  return (
    <View style={styles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.circle,
            {
              backgroundColor: currentColors.card,
              shadowColor: "#000",
              shadowOpacity: theme === "dark" ? 0.3 : 0.25,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 5 },
              elevation: 8,
            },
          ]}
          onPress={() => onSelect?.(option.id)}
          activeOpacity={0.7}
        >
          {option.icon}
          <Text style={[styles.label, { color: currentColors.secondary }]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginHorizontal: 16,
    marginVertical: 16,
  },
  circle: {
    width: 70,
    height: 70,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
  label: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default HostOptionsRow;
