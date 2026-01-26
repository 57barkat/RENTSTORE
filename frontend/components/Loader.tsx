import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export const Loader = ({ visible, backgroundColor }: any) => {
  if (!visible) return null;
  return (
    <View style={[styles.loader, { backgroundColor }]}>
      <ActivityIndicator size="large" color="#4F46E5" />
    </View>
  );
};

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});
