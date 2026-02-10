import React, { useEffect, useState, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  SafeAreaView,
  Image,
  StatusBar,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contextStore/ThemeContext";
import { tokenManager } from "@/services/tokenManager";
import { connectSocket } from "@/services/socket";
import { useCreateRoomMutation, useGetMessagesQuery } from "@/hooks/chat";
import { Socket } from "socket.io-client";

export default function ChatRoomScreen() {
  const {
    roomId: roomParam,
    otherUserId,
    otherUserName,
    otherUserImage,
    propertyId,
  } = useLocalSearchParams<{
    roomId?: string;
    otherUserId?: string;
    otherUserName?: string;
    otherUserImage?: string;
    propertyId?: string;
  }>();

  const router = useRouter();
  const { theme } = useTheme();
  const currentTheme = Colors[theme];
  const headerHeight = useHeaderHeight();

  const [userId, setUserId] = useState<string>("");
  const [roomId, setRoomId] = useState<string | undefined>(roomParam);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [createRoom] = useCreateRoomMutation();

  useEffect(() => {
    const loadUser = async () => {
      if (!tokenManager) return;
      await tokenManager.load();
      let id = await AsyncStorage.getItem("userId");
      if (!id && tokenManager.getAccessToken()) {
        const payload = JSON.parse(
          atob(tokenManager.getAccessToken()!.split(".")[1]),
        );
        id = payload.sub;
      }
      if (id) {
        setUserId(id);
        await AsyncStorage.setItem("userId", id);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const initRoom = async () => {
      if (!roomId && userId && otherUserId) {
        try {
          const payload = { participants: [userId, otherUserId], propertyId };
          const room = await createRoom(payload).unwrap();
          setRoomId(room._id);
          router.setParams({ roomId: room._id });
        } catch (err) {
          console.error("Room error", err);
        }
      }
    };
    initRoom();
  }, [userId, otherUserId, roomId]);

  const { data: fetchedMessages } = useGetMessagesQuery(
    { roomId: roomId ?? "" },
    {
      skip: !roomId || roomId === "undefined",
      refetchOnMountOrArgChange: true,
    },
  );

  useEffect(() => {
    if (Array.isArray(fetchedMessages)) setMessages(fetchedMessages);
  }, [fetchedMessages]);

  useEffect(() => {
    if (!roomId || !userId) return;
    let socketInstance: Socket;
    const setupSocket = async () => {
      socketInstance = await connectSocket();
      setSocket(socketInstance);
      socketInstance.emit("joinRoom", roomId);
      socketInstance.on("newMessage", (msg) => {
        if (msg.chatRoomId === roomId) {
          setMessages((prev) =>
            prev.find((m) => m._id === msg._id) ? prev : [...prev, msg],
          );
        }
      });
    };
    setupSocket();
    return () => {
      if (socketInstance) {
        socketInstance.emit("leaveRoom", roomId);
        socketInstance.off("newMessage");
      }
    };
  }, [roomId, userId]);

  const handleSend = () => {
    if (!text.trim() || !roomId || !socket) return;
    socket.emit("sendMessage", { chatRoomId: roomId, text });
    setText("");
  };

  const renderItem = ({ item }: { item: any }) => {
    const senderData = item.senderId;
    const isMe =
      (typeof senderData === "object" ? senderData._id : senderData) === userId;
    const avatarUri = isMe
      ? senderData?.profileImage
      : senderData?.profileImage || otherUserImage;

    return (
      <View style={[styles.msgRow, isMe ? styles.myRow : styles.theirRow]}>
        {!isMe && (
          <Image source={{ uri: avatarUri }} style={styles.chatAvatar} />
        )}
        <View style={isMe ? styles.myMsgContent : styles.theirMsgContent}>
          <View
            style={[
              styles.bubble,
              {
                backgroundColor: isMe
                  ? currentTheme.primary
                  : currentTheme.card,
              },
            ]}
          >
            <Text
              style={[
                styles.msgText,
                { color: isMe ? "#fff" : currentTheme.text },
              ]}
            >
              {item.text}
            </Text>
          </View>
          <Text style={styles.timeText}>
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        {isMe && (
          <Image source={{ uri: avatarUri }} style={styles.chatAvatar} />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />

      <View style={[styles.header, { borderBottomColor: currentTheme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={currentTheme.text} />
        </TouchableOpacity>
        <Image source={{ uri: otherUserImage }} style={styles.headerImg} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: currentTheme.text }]}>
            {otherUserName}
          </Text>
          <Text style={{ fontSize: 12, color: "#4ADE80" }}>Active Now</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View
          style={[
            styles.inputArea,
            {
              borderTopColor: currentTheme.border,
              backgroundColor: currentTheme.background,
            },
          ]}
        >
          <View
            style={[styles.innerInput, { backgroundColor: currentTheme.card }]}
          >
            <TextInput
              style={[styles.textField, { color: currentTheme.text }]}
              value={text}
              onChangeText={setText}
              placeholder="Write a message..."
              placeholderTextColor={currentTheme.muted}
              multiline
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!text.trim()}
              style={[
                styles.sendCircle,
                {
                  backgroundColor: text.trim()
                    ? currentTheme.primary
                    : currentTheme.muted,
                },
              ]}
            >
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
  },
  backBtn: { marginRight: 8 },
  headerImg: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  list: { padding: 16 },
  msgRow: { flexDirection: "row", marginBottom: 18, alignItems: "flex-end" },
  myRow: { justifyContent: "flex-end" },
  theirRow: { justifyContent: "flex-start" },
  chatAvatar: { width: 32, height: 32, borderRadius: 16, marginHorizontal: 8 },
  myMsgContent: { alignItems: "flex-end", maxWidth: "75%" },
  theirMsgContent: { alignItems: "flex-start", maxWidth: "75%" },
  bubble: {
    padding: 12,
    borderRadius: 18,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  msgText: { fontSize: 15, lineHeight: 20 },
  timeText: { fontSize: 10, color: "#999", marginTop: 4, marginHorizontal: 4 },
  inputArea: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 30 : 12,
    borderTopWidth: 1,
  },
  innerInput: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  textField: { flex: 1, fontSize: 15, maxHeight: 100, paddingVertical: 8 },
  sendCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
});
