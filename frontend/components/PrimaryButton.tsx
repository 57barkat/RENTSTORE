import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

export const PrimaryButton = ({ title, onPress, loading, color }: any) => (
  <TouchableOpacity
    style={[
      styles.button,
      {
        opacity: loading ? 0.7 : 1,
        backgroundColor: color || "#10B981", // Falls back to figma green
      },
    ]}
    onPress={onPress}
    disabled={loading}
    activeOpacity={0.8}
  >
    {loading ? (
      <ActivityIndicator color="#fff" />
    ) : (
      <Text style={styles.text}>{title}</Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    // Add shadow to make it feel premium like the Figma
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  text: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
