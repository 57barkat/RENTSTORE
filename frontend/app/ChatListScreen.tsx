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
  Image,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGetRoomsQuery } from "@/hooks/chat";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";

// Updated Type to match the backend transformation
type ChatRoom = {
  _id: string;
  participants: any[];
  otherUser: {
    _id: string;
    name: string;
    profileImage?: string;
    email: string;
  };
  lastMessage?: string;
  lastMessageAt: string;
  updatedAt: string;
};

export default function ChatListScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // We call the hook - the backend now returns "otherUser" for us
  const { data: rooms, isLoading, refetch } = useGetRoomsQuery();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const isDark = theme === "dark";

  // Refetch when screen focuses to get latest messages
  useEffect(() => {
    refetch();
  }, []);

  // Filter based on the 'otherUser' name provided by backend
  const filteredRooms = rooms?.filter((room: ChatRoom) => {
    return room.otherUser?.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

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
    // Logic is now super simple because the backend did the work
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
        onPress={() =>
          router.push({
            pathname: "/chat/[roomId]",
            params: {
              roomId: item._id,
              otherUserId: item.otherUser?._id || "",
              otherUserName: displayName,
              otherUserImage: displayImage || "",
            },
          })
        }
      >
        {/* Avatar Section */}
        <View
          style={[styles.avatar, { backgroundColor: currentTheme.primary }]}
        >
          {displayImage ? (
            <Image source={{ uri: displayImage }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{initial}</Text>
          )}
        </View>

        {/* Info Section */}
        <View style={styles.content}>
          <View style={styles.headerRow}>
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

          <View style={styles.messageRow}>
            <Text
              style={[styles.lastMessage, { color: currentTheme.muted }]}
              numberOfLines={1}
            >
              {item.lastMessage || "Start a conversation..."}
            </Text>

            {/* Optional: Unread dot or Chevron */}
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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View style={[styles.header, { borderBottomColor: currentTheme.border }]}>
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>
          Messages
        </Text>

        <View
          style={[
            styles.searchContainer,
            { backgroundColor: isDark ? "#1c1c1e" : "#f2f2f7" },
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
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="chatbubbles-outline"
              size={60}
              color={currentTheme.muted}
            />
            <Text style={[styles.emptyText, { color: currentTheme.muted }]}>
              {searchQuery ? "No results found." : "No conversations yet."}
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 15,
    letterSpacing: -0.5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  listContent: { paddingBottom: 20 },
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
  emptyContainer: { alignItems: "center", marginTop: 100 },
  emptyText: { textAlign: "center", marginTop: 15, fontSize: 16 },
});
