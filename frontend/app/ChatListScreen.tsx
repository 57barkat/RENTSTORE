import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Image,
  TextInput,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useGetRoomsQuery } from "@/hooks/chat";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { formatTimeAgo } from "@/utils/chat/timeUtils";

type ChatRoom = {
  _id: string;
  otherUser: { _id: string; name: string; profileImage?: string };
  lastMessage?: string;
  lastMessageAt: string;
  updatedAt: string;
};

export default function ChatListScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const { data: rooms, isLoading, refetch } = useGetRoomsQuery();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  useEffect(() => {
    refetch();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const filteredRooms = rooms?.filter((room: ChatRoom) =>
    room.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (isLoading && !refreshing) {
    return (
      <View
        style={[styles.center, { backgroundColor: currentTheme.background }]}
      >
        <ActivityIndicator size="large" color={currentTheme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />

      {/* Header & Search */}
      <View style={[styles.header, { borderBottomColor: currentTheme.border }]}>
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>
          Messages
        </Text>
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: theme === "dark" ? "#1c1c1e" : "#f2f2f7" },
          ]}
        >
          <Ionicons name="search" size={18} color={currentTheme.muted} />
          <TextInput
            style={[styles.searchInput, { color: currentTheme.text }]}
            placeholder="Search conversations..."
            placeholderTextColor={currentTheme.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={currentTheme.primary}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.chatItem,
              { borderBottomColor: currentTheme.border },
            ]}
            onPress={() =>
              router.push({
                pathname: "/chat/[roomId]",
                params: {
                  roomId: item._id,
                  otherUserId: item.otherUser?._id,
                  otherUserName: item.otherUser?.name,
                  otherUserImage: item.otherUser?.profileImage,
                },
              })
            }
          >
            <View
              style={[styles.avatar, { backgroundColor: currentTheme.primary }]}
            >
              {item.otherUser?.profileImage ? (
                <Image
                  source={{ uri: item.otherUser.profileImage }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {item.otherUser?.name?.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View style={styles.content}>
              <View style={styles.headerRow}>
                <Text
                  style={[styles.username, { color: currentTheme.text }]}
                  numberOfLines={1}
                >
                  {item.otherUser?.name}
                </Text>
                <Text style={[styles.time, { color: currentTheme.muted }]}>
                  {formatTimeAgo(item.lastMessageAt || item.updatedAt)}
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
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { padding: 20, borderBottomWidth: 1 },
  headerTitle: { fontSize: 32, fontWeight: "bold", marginBottom: 15 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },
  chatItem: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    borderBottomWidth: 0.5,
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
    marginBottom: 4,
  },
  messageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  username: { fontSize: 17, fontWeight: "600" },
  lastMessage: { fontSize: 14, flex: 1 },
  time: { fontSize: 12 },
});
