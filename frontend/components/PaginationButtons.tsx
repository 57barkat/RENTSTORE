// PaginationButtons.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";

interface Props {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function PaginationButtons({
  page,
  totalPages,
  onPrev,
  onNext,
}: Props) {
  const { theme } = useTheme();
  const colors = theme === "light" ? Colors.light : Colors.dark;

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: page === 1 ? colors.border : colors.primary },
        ]}
        onPress={onPrev}
        disabled={page === 1}
      >
        <Text style={styles.text}>Previous</Text>
      </TouchableOpacity>

      <Text style={[styles.pageIndicator, { color: colors.text }]}>
        {page} / {totalPages}
      </Text>

      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor:
              page >= totalPages ? colors.border : colors.primary,
          },
        ]}
        onPress={onNext}
        disabled={page >= totalPages}
      >
        <Text style={styles.text}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  button: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  text: { color: "#fff", fontWeight: "bold" },
  pageIndicator: { fontSize: 16, fontWeight: "600" },
});
