import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGetRoomsQuery } from "@/hooks/chat";

type ChatRoom = {
  _id: string; // ensure it's string
  participants: string[]; // only valid user IDs, nulls filtered
  lastMessage?: string;
  updatedAt: string;
};

export default function ChatListScreen() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const { data: rooms, isLoading } = useGetRoomsQuery();

  useEffect(() => {
    const loadUser = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserId(payload.sub);
      } catch (e) {
        console.error("Failed to parse token", e);
      }
    };
    loadUser();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: ChatRoom }) => {
    // Filter out current user and any nulls
    const otherParticipant = item.participants.find(
      (p) => p && p !== currentUserId
    );

    // Display name fallback
    const displayName = otherParticipant
      ? `User ${otherParticipant.slice(-4)}`
      : "Chat Room";
    const initial = displayName.charAt(0).toUpperCase();

    // Ensure roomId is string
    const roomId = item._id;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        activeOpacity={0.7}
        onPress={() =>
          router.push({
            pathname: "/chat/[roomId]",
            params: { roomId, otherUserId: otherParticipant || "" },
          })
        }
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.username} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.time}>
              {new Date(item.updatedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage || "No messages yet"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      <FlatList
        data={rooms
          ?.slice()
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No conversations yet.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "#1A1A1A" },
  listContent: { paddingBottom: 20 },
  chatItem: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#fff",
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E0E0E0",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  content: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  username: { fontSize: 16, fontWeight: "700", color: "#000", flex: 1 },
  lastMessage: { fontSize: 14, color: "#8E8E93" },
  time: { fontSize: 12, color: "#8E8E93", marginLeft: 10 },
  emptyText: { textAlign: "center", marginTop: 50, color: "#999" },
});
