import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ChatItemProps {
  item: any;
  onPress: () => void;
  currentTheme: any;
}

export const ChatItem = ({ item, onPress, currentTheme }: ChatItemProps) => {
  const displayName = item.otherUser?.name || "Unknown User";
  const displayImage = item.otherUser?.profileImage;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <TouchableOpacity
      style={[
        styles.chatItem,
        {
          backgroundColor: currentTheme.background,
          borderBottomColor: currentTheme.border,
        },
      ]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={[styles.avatar, { backgroundColor: currentTheme.primary }]}>
        {displayImage ? (
          <Image source={{ uri: displayImage }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>{initial}</Text>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text
            style={[styles.username, { color: currentTheme.text }]}
            numberOfLines={1}
          >
            {displayName}
          </Text>
          <Text style={[styles.time, { color: currentTheme.muted }]}>
            {new Date(item.lastMessageAt || item.updatedAt).toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            )}
          </Text>
        </View>

        <View style={styles.messageRow}>
          <Text
            style={[styles.lastMessage, { color: currentTheme.muted }]}
            numberOfLines={1}
          >
            {item.lastMessage || "Start a conversation..."}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={14}
            color={currentTheme.border}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chatItem: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  content: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  username: { fontSize: 17, fontWeight: "600" },
  lastMessage: { fontSize: 14, flex: 1, marginRight: 10 },
  time: { fontSize: 12 },
});
