// ErrorScreen.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";

interface Props {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorScreen({
  message = "Something went wrong.",
  onRetry,
}: Props) {
  const { theme } = useTheme();
  const colors = theme === "light" ? Colors.light : Colors.dark;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.danger }]}>{message}</Text>

      {onRetry && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={onRetry}
        >
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  button: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
