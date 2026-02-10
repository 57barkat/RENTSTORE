import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ChatEmptyStateProps {
  searchQuery: string;
  currentTheme: any;
}

export const ChatEmptyState = ({
  searchQuery,
  currentTheme,
}: ChatEmptyStateProps) => (
  <View style={styles.emptyContainer}>
    <Ionicons name="chatbubbles-outline" size={60} color={currentTheme.muted} />
    <Text style={[styles.emptyText, { color: currentTheme.muted }]}>
      {searchQuery ? "No results found." : "No conversations yet."}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  emptyContainer: { alignItems: "center", marginTop: 100 },
  emptyText: { textAlign: "center", marginTop: 15, fontSize: 16 },
});
