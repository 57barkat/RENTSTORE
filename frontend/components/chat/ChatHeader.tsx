import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ChatHeaderProps {
  onBack: () => void;
  otherUserName?: string;
  otherUserImage?: string;
  theme: any;
}

export const ChatHeader = ({
  onBack,
  otherUserName,
  otherUserImage,
  theme,
}: ChatHeaderProps) => (
  <View style={[styles.header, { borderBottomColor: theme.border }]}>
    <TouchableOpacity onPress={onBack} style={styles.backBtn}>
      <Ionicons name="chevron-back" size={28} color={theme.text} />
    </TouchableOpacity>
    <Image source={{ uri: otherUserImage }} style={styles.headerImg} />
    <View style={{ flex: 1 }}>
      <Text style={[styles.headerTitle, { color: theme.text }]}>
        {otherUserName}
      </Text>
      <Text style={{ fontSize: 12, color: "#4ADE80" }}>Active Now</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
  },
  backBtn: { marginRight: 8 },
  headerImg: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
});
