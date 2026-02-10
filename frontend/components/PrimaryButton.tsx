import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

export const PrimaryButton = ({ title, onPress, loading }: any) => (
  <TouchableOpacity
    style={[styles.button, { opacity: loading ? 0.7 : 1 }]}
    onPress={onPress}
    disabled={loading}
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
    backgroundColor: "#4F46E5",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
    elevation: 8,
  },
  text: { color: "#fff", fontWeight: "800", fontSize: 18 },
});
