import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

export const PropertyDetailsHeader = ({ theme, isDark, onBack }: any) => (
  <View
    style={{
      position: "absolute",
      top: 50,
      left: 20,
      right: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      zIndex: 10,
    }}
  >
    <TouchableOpacity
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: isDark ? "rgba(28,28,30,0.8)" : "white",
      }}
      onPress={onBack}
    >
      <Ionicons name="chevron-back" size={24} color={theme.text} />
    </TouchableOpacity>
    <View style={{ flexDirection: "row" }}>
      <TouchableOpacity
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 10,
          backgroundColor: isDark ? "rgba(28,28,30,0.8)" : "white",
        }}
      >
        <Feather name="share" size={20} color={theme.text} />
      </TouchableOpacity>
    </View>
  </View>
);
