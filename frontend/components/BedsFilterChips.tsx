// BedsFilterChips.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";

interface Props {
  options: number[];
  selected: number | null;
  onSelect: (value: number | null) => void;
}

export default function BedsFilterChips({
  options,
  selected,
  onSelect,
}: Props) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text
        style={[styles.title, { color: theme === "dark" ? "white" : "black" }]}
      >
        Beds
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {/* Clear Filter Chip */}
        <TouchableOpacity
          style={[
            styles.chip,
            selected === null && {
              backgroundColor: theme === "dark" ? "#1E90FF" : "#007AFF",
            },
          ]}
          onPress={() => onSelect(null)}
        >
          <Text
            style={[
              styles.chipText,
              {
                color:
                  selected === null
                    ? "white"
                    : theme === "dark"
                    ? "white"
                    : "black",
              },
            ]}
          >
            Any
          </Text>
        </TouchableOpacity>

        {/* Numbered Chips */}
        {options.map((num) => {
          const isSelected = selected === num;

          return (
            <TouchableOpacity
              key={num}
              style={[
                styles.chip,
                isSelected && {
                  backgroundColor: theme === "dark" ? "#1E90FF" : "#007AFF",
                },
              ]}
              onPress={() => onSelect(num)}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: isSelected
                      ? "white"
                      : theme === "dark"
                      ? "white"
                      : "black",
                  },
                ]}
              >
                {num} Bed{num > 1 ? "s" : ""}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 18 },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#f1f1f1",
    borderRadius: 20,
    marginRight: 10,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
