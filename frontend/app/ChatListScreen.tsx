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
import { connectSocket } from "@/services/socket";

type ChatRoom = {
  _id: string;
  otherUser: { _id: string; name: string; profileImage?: string };
  lastMessage?: string;
  lastMessageAt: string;
  updatedAt: string;
  unreadCount?: number;
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
    let socketInstance: any;
    const setupSocket = async () => {
      socketInstance = await connectSocket();
      socketInstance.on("roomsUpdated", (data: any) => {
        console.log("DEBUG: roomsUpdated event received from backend");
        refetch();
      });
    };
    setupSocket();

    return () => {
      if (socketInstance) socketInstance.off("roomsUpdated");
    };
  }, [refetch]);

  useEffect(() => {
    if (rooms) {
      console.log("DEBUG: Current Rooms Data:", JSON.stringify(rooms, null, 2));
    }
  }, [rooms]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const filteredRooms = rooms?.filter((room: ChatRoom) =>
    room.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  console.log("DEBUG: Filtered Rooms after search query:", filteredRooms);
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

      <View style={[styles.header, { borderBottomColor: currentTheme.border }]}>
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={28} color={currentTheme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: currentTheme.text }]}>
            Messages
          </Text>
        </View>

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
        data={filteredRooms || []}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={currentTheme.primary}
          />
        }
        renderItem={({ item }) => {
          const hasUnread =
            item.unreadCount !== undefined && item.unreadCount > 0;
          console.log(
            "DEBUG: Rendering chat item with unreadCount:",
            item.unreadCount,
            "hasUnread:",
            hasUnread,
          );
          return (
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
                style={[
                  styles.avatar,
                  { backgroundColor: currentTheme.primary + "20" },
                ]}
              >
                {item.otherUser?.profileImage ? (
                  <Image
                    source={{ uri: item.otherUser.profileImage }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text
                    style={[styles.avatarText, { color: currentTheme.primary }]}
                  >
                    {item.otherUser?.name
                      ? item.otherUser.name.charAt(0).toUpperCase()
                      : "U"}
                  </Text>
                )}
              </View>
              <View style={styles.content}>
                <View style={styles.headerRow}>
                  <Text
                    style={[
                      styles.username,
                      {
                        color: currentTheme.text,
                        fontWeight: hasUnread ? "bold" : "600",
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {item.otherUser?.name || "Unknown User"}
                  </Text>
                  <Text
                    style={[
                      styles.time,
                      {
                        color: hasUnread
                          ? currentTheme.primary
                          : currentTheme.muted,
                        fontWeight: hasUnread ? "700" : "400",
                      },
                    ]}
                  >
                    {formatTimeAgo(item.lastMessageAt || item.updatedAt)}
                  </Text>
                </View>
                <View style={styles.messageRow}>
                  <Text
                    style={[
                      styles.lastMessage,
                      {
                        color: hasUnread
                          ? currentTheme.text
                          : currentTheme.muted,
                        fontWeight: hasUnread ? "700" : "400",
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {item.lastMessage || "Start a conversation..."}
                  </Text>

                  {hasUnread && (
                    <View
                      style={[
                        styles.unreadBadge,
                        { backgroundColor: currentTheme.primary },
                      ]}
                    >
                      <Text style={styles.unreadText}>{item.unreadCount}</Text>
                    </View>
                  )}
                  {!hasUnread && (
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color={currentTheme.border}
                    />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ color: currentTheme.muted }}>
              No conversations found
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 0.5,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  backButton: {
    marginRight: 10,
    marginLeft: -5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
  },
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
  avatarText: { fontSize: 20, fontWeight: "bold" },
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
  username: { fontSize: 17 },
  lastMessage: { fontSize: 14, flex: 1, marginRight: 10 },
  time: { fontSize: 12 },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    marginLeft: 5,
  },
  unreadText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
});
