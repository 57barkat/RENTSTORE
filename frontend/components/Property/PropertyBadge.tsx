import React from "react";
import { View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const Badge = ({ text, icon, theme, type }: any) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.card,
    }}
  >
    <MaterialCommunityIcons
      name={icon}
      size={16}
      color={type === "safety" ? "#FF5A5F" : theme.primary}
    />
    <Text
      style={{
        fontSize: 13,
        fontWeight: "600",
        marginLeft: 8,
        color: theme.text,
      }}
    >
      {text.charAt(0).toUpperCase() + text.slice(1)}
    </Text>
  </View>
);
