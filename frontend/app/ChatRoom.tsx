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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { connectSocket } from "@/services/socket";
import { useCreateRoomMutation, useGetMessagesQuery } from "@/hooks/chat";
import { Socket } from "socket.io-client";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contextStore/ThemeContext";
import { tokenManager } from "@/services/tokenManager";

export default function ChatRoomScreen() {
  const {
    roomId: roomParam,
    otherUserId,
    propertyId,
  } = useLocalSearchParams<{
    roomId?: string;
    otherUserId?: string;
    propertyId?: string;
  }>();

  const router = useRouter();
  const { theme } = useTheme();
  const currentTheme = Colors[theme];

  const [userId, setUserId] = useState<string>("");
  const [roomId, setRoomId] = useState<string | undefined>(roomParam);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  const [createRoom] = useCreateRoomMutation();

  useEffect(() => {
    const loadUser = async () => {
      if (!tokenManager) {
        console.error("tokenManager is undefined! Check your imports.");
        return;
      }
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
          const payload: { participants: string[]; propertyId?: string } = {
            participants: [userId, otherUserId],
          };
          if (propertyId) payload.propertyId = propertyId;

          const room = await createRoom(payload).unwrap();

          setRoomId(room._id);

          router.setParams({ roomId: room._id });
        } catch (err) {
          console.error("Room Init Error:", err);
        }
      }
    };

    initRoom();
  }, [userId, otherUserId, roomId, propertyId]);

  const {
    data: fetchedMessages,
    isLoading,
    isError,
    error,
  } = useGetMessagesQuery(
    { roomId: roomId ?? "" },
    {
      skip: !roomId || roomId === "undefined" || roomId.length < 10,
      refetchOnMountOrArgChange: true,
    },
  );

  useEffect(() => {
    if (isLoading) {
      console.log("Fetching previous messages...");
    }

    if (isError) {
      console.error("Failed to fetch messages:", error);
    }

    if (Array.isArray(fetchedMessages)) {
      console.log("Fetched Messages:", fetchedMessages);
      setMessages(fetchedMessages);
    }
  }, [fetchedMessages, isLoading, isError, error]);

  useEffect(() => {
    if (!roomId || !userId) return;

    let socketInstance: Socket;

    const setupSocket = async () => {
      socketInstance = await connectSocket();
      setSocket(socketInstance);

      socketInstance.emit("joinRoom", roomId);

      socketInstance.on("newMessage", (msg) => {
        if (msg.chatRoomId === roomId) {
          setMessages((prev) => {
            if (prev.find((m) => m._id === msg._id)) return prev;
            return [...prev, msg];
          });
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

    socket.emit("sendMessage", {
      chatRoomId: roomId,
      text,
    });

    setText("");
  };

  const renderItem = ({ item }: { item: any }) => {
    const isMe = item.senderId === userId;

    return (
      <View
        style={[
          styles.messageWrapper,
          isMe ? styles.myWrapper : styles.theirWrapper,
        ]}
      >
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: isMe ? currentTheme.primary : currentTheme.card,
            },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              { color: isMe ? "#fff" : currentTheme.text },
            ]}
          >
            {item.text}
          </Text>
        </View>
        <Text style={styles.timestamp}>
          {new Date(item.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) =>
            item._id?.toString() || index.toString()
          }
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        <View
          style={[
            styles.inputContainer,
            {
              borderTopColor: currentTheme.border,
              backgroundColor: currentTheme.background,
            },
          ]}
        >
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: currentTheme.card,
                borderColor: currentTheme.border,
              },
            ]}
          >
            <TextInput
              style={[styles.input, { color: currentTheme.text }]}
              value={text}
              onChangeText={setText}
              placeholder="Type a message..."
              placeholderTextColor={currentTheme.muted}
              multiline
            />

            <TouchableOpacity
              onPress={handleSend}
              disabled={!text.trim()}
              style={[
                styles.sendBtn,
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

/* -------------------- Styles -------------------- */
const styles = StyleSheet.create({
  listContent: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 20 },
  messageWrapper: { marginVertical: 6, maxWidth: "80%" },
  myWrapper: { alignSelf: "flex-end", alignItems: "flex-end" },
  theirWrapper: { alignSelf: "flex-start", alignItems: "flex-start" },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: { fontSize: 16, lineHeight: 20 },
  timestamp: { fontSize: 10, color: "#888", marginTop: 4, marginHorizontal: 4 },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 10 : 20,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 28,
    borderWidth: 1,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
  },
  input: { flex: 1, fontSize: 16, maxHeight: 100, paddingVertical: 4 },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
});
