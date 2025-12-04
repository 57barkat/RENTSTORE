import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/contextStore/ThemeContext";

interface Props {
  persons: number | string;
  beds: number | string;
  baths: number | string;
}

export default function PropertyCapacityRow({ persons, beds, baths }: Props) {
  const { theme } = useTheme();

  return (
    <View style={styles.row}>
      <Text
        style={[styles.text, { color: theme === "dark" ? "white" : "black" }]}
      >
        <MaterialCommunityIcons
          name="account-group-outline"
          size={14}
          color={theme === "dark" ? "white" : "black"}
        />{" "}
        {persons} Persons
      </Text>
      <Text
        style={[styles.text, { color: theme === "dark" ? "white" : "black" }]}
      >
        <MaterialCommunityIcons
          name="bed-outline"
          size={14}
          color={theme === "dark" ? "white" : "black"}
        />{" "}
        {beds} Beds
      </Text>
      <Text
        style={[styles.text, { color: theme === "dark" ? "white" : "black" }]}
      >
        <MaterialCommunityIcons
          name="bathtub-outline"
          size={14}
          color={theme === "dark" ? "white" : "black"}
        />{" "}
        {baths} Baths
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 15, marginVertical: 8 },
  text: { fontSize: 13, fontWeight: "500" },
});
