import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ChatSearchBarProps {
  searchQuery: string;
  setSearchQuery: (text: string) => void;
  currentTheme: any;
  isDark: boolean;
}

export const ChatSearchBar = ({
  searchQuery,
  setSearchQuery,
  currentTheme,
  isDark,
}: ChatSearchBarProps) => (
  <View style={[styles.header, { borderBottomColor: currentTheme.border }]}>
    <Text style={[styles.headerTitle, { color: currentTheme.text }]}>
      Messages
    </Text>

    <View
      style={[
        styles.searchContainer,
        { backgroundColor: isDark ? "#1c1c1e" : "#f2f2f7" },
      ]}
    >
      <Ionicons name="search" size={18} color={currentTheme.muted} />
      <TextInput
        style={[styles.searchInput, { color: currentTheme.text }]}
        placeholder="Search conversations..."
        placeholderTextColor={currentTheme.muted}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 15,
    letterSpacing: -0.5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
});
