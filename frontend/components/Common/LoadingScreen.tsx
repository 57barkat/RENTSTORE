import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

interface LoadingScreenProps {
  currentTheme: any;
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  currentTheme,
  message = "Loading Properties...",
}) => (
  <View style={[styles.center, { backgroundColor: currentTheme.background }]}>
    <ActivityIndicator size="large" color={currentTheme.primary} />
    <Text style={{ marginTop: 10, color: currentTheme.text }}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default LoadingScreen;
