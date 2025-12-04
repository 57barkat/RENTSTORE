// EmptyListMessage.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";

interface Props {
  message?: string;
}

export default function EmptyListMessage({
  message = "No items found.",
}: Props) {
  const { theme } = useTheme();
  const colors = theme === "light" ? Colors.light : Colors.dark;

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: colors.muted }]}>{message}</Text>
      <MaterialCommunityIcons
        name="home-search-outline"
        size={50}
        color={colors.muted}
        style={{ marginTop: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", marginTop: 50 },
  text: { fontSize: 16, fontWeight: "500", textAlign: "center" },
});
