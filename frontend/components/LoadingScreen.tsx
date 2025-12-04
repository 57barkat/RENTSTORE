// LoadingScreen.tsx
import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";

interface Props {
  message?: string;
}

export default function LoadingScreen({ message = "Loading..." }: Props) {
  const { theme } = useTheme();
  const colors = theme === "light" ? Colors.light : Colors.dark;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.text, { color: colors.text }]}>{message}</Text>
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
  text: { marginTop: 10, fontSize: 16, fontWeight: "500" },
});
