import React from "react";
import { View, Text } from "react-native";

export const PriceRow = ({
  label,
  value,
  theme,
  isLast,
  isLarge,
  color,
}: any) => (
  <View
    style={[
      {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      },
      !isLast && {
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.border + "30",
        paddingBottom: 12,
      },
    ]}
  >
    <Text style={{ color: theme.muted, fontSize: 14 }}>{label}</Text>
    <Text
      style={{
        color: color || theme.text,
        fontWeight: "800",
        fontSize: isLarge ? 18 : 15,
      }}
    >
      {value}
    </Text>
  </View>
);
