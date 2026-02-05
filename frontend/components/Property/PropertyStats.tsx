import React from "react";
import { View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const StatItem = ({ icon, label, value, theme }: any) => (
  <View
    style={{
      flex: 1,
      alignItems: "center",
      padding: 15,
      borderRadius: 20,
      backgroundColor: theme.card,
    }}
  >
    <MaterialCommunityIcons name={icon} size={22} color={theme.primary} />
    <Text
      style={{
        fontSize: 18,
        fontWeight: "800",
        marginTop: 5,
        color: theme.text,
      }}
    >
      {value || 0}
    </Text>
    <Text style={{ fontSize: 11, opacity: 0.6, fontWeight: "600" }}>
      {label}
    </Text>
  </View>
);
