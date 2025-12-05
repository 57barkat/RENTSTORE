import React from "react";
import { View, StyleSheet } from "react-native";
import MyListingProperties from "@/components/MyListingProperties";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../constants/Colors";

export default function MyListingsScreen() {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  return (
    <View
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      <MyListingProperties />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
});
