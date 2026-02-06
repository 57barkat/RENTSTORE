import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const EmptyState = ({ theme }: any) => (
  <View
    style={{
      flex: 1,
      alignItems: "center",
      marginTop: 80,
      paddingHorizontal: 40,
    }}
  >
    <Ionicons name="search-outline" size={60} color={theme.muted} />
    <Text
      style={{
        color: theme.text,
        fontSize: 18,
        fontWeight: "600",
        marginTop: 16,
        textAlign: "center",
      }}
    >
      No properties found.
    </Text>
    <Text style={{ color: theme.muted, textAlign: "center", marginTop: 8 }}>
      Try adjusting your filters or search area to find more results.
    </Text>
  </View>
);
