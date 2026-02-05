import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const PropertyFooter = ({ theme, price, onChat, isCreating }: any) => (
  <View
    style={{
      position: "absolute",
      bottom: 0,
      width: "100%",
      padding: 20,
      paddingBottom: 35,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: theme.border,
      backgroundColor: theme.background,
      elevation: 10,
    }}
  >
    <View>
      <Text style={{ fontSize: 22, fontWeight: "900", color: theme.text }}>
        {price}
      </Text>
      <Text style={{ color: "#4CAF50", fontSize: 12, fontWeight: "bold" }}>
        PER MONTH
      </Text>
    </View>
    <TouchableOpacity
      style={{
        paddingHorizontal: 25,
        paddingVertical: 15,
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.primary,
      }}
      onPress={onChat}
      disabled={isCreating}
    >
      {isCreating ? (
        <ActivityIndicator color="white" />
      ) : (
        <>
          <Ionicons
            name="chatbubbles-outline"
            size={20}
            color="white"
            style={{ marginRight: 8 }}
          />
          <Text style={{ color: "white", fontWeight: "800", fontSize: 16 }}>
            Contact Host
          </Text>
        </>
      )}
    </TouchableOpacity>
  </View>
);
