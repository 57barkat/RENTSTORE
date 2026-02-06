import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGetRoomsQuery } from "@/hooks/chat";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";

type ChatRoom = {
  _id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt: string;
  updatedAt: string;
};

export default function ChatListScreen() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const { data: rooms, isLoading, refetch } = useGetRoomsQuery();
  console.log("ChatListScreen rendered. Rooms data:", rooms);
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const isDark = theme === "dark";

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

  useEffect(() => {
    refetch();
  }, []);

  if (isLoading) {
    return (
      <View
        style={[styles.center, { backgroundColor: currentTheme.background }]}
      >
        <ActivityIndicator size="large" color={currentTheme.primary} />
      </View>
    );
  }

  const renderItem = ({ item }: { item: ChatRoom }) => {
    const otherParticipant = item.participants.find(
      (p) => p && p !== currentUserId,
    );
    const displayName = otherParticipant
      ? `User ${otherParticipant.slice(-4)}`
      : "Chat Room";
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
        onPress={() =>
          router.push({
            pathname: "/chat/[roomId]",
            params: { roomId: item._id, otherUserId: otherParticipant || "" },
          })
        }
      >
        <View
          style={[styles.avatar, { backgroundColor: currentTheme.primary }]}
        >
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.headerRow}>
            {/* 4. APPLY DYNAMIC TEXT COLORS */}
            <Text
              style={[styles.username, { color: currentTheme.text }]}
              numberOfLines={1}
            >
              {displayName}
            </Text>
            <Text style={[styles.time, { color: currentTheme.muted }]}>
              {new Date(
                item.lastMessageAt || item.updatedAt,
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
          <Text
            style={[styles.lastMessage, { color: currentTheme.muted }]}
            numberOfLines={1}
          >
            {item.lastMessage || "No messages yet"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      {/* 5. MATCH STATUS BAR TO THEME */}
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={currentTheme.background}
      />

      <View
        style={[
          styles.header,
          {
            backgroundColor: currentTheme.background,
            borderBottomColor: currentTheme.border,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>
          Messages
        </Text>
      </View>

      <FlatList
        data={rooms
          ?.slice()
          .sort(
            (a, b) =>
              new Date(b.lastMessageAt || b.updatedAt).getTime() -
              new Date(a.lastMessageAt || a.updatedAt).getTime(),
          )}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: currentTheme.muted }]}>
            No conversations yet.
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 28, fontWeight: "bold" },
  listContent: { paddingBottom: 20 },
  chatItem: {
    flexDirection: "row",
    padding: 15,
    alignItems: "center",
    borderBottomWidth: 0.5,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  username: { fontSize: 16, fontWeight: "700", flex: 1 },
  lastMessage: { fontSize: 14 },
  time: { fontSize: 12, marginLeft: 10 },
  emptyText: { textAlign: "center", marginTop: 50 },
});
