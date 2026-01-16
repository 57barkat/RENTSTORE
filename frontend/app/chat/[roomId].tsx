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
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { connectSocket } from "@/services/socket";
import { useCreateRoomMutation, useGetMessagesQuery } from "@/hooks/chat";
import { Socket } from "socket.io-client";
import { Ionicons } from "@expo/vector-icons";

type Message = {
  _id: string;
  chatRoomId: string;
  senderId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
};

export default function ChatRoomScreen() {
  const { roomId: roomParam, otherUserId } = useLocalSearchParams<{
    roomId?: string;
    otherUserId?: string;
  }>();

  const [userId, setUserId] = useState<string>("");
  const [roomId, setRoomId] = useState<string | undefined>(roomParam);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  const [createRoom] = useCreateRoomMutation();

  /* -------------------- Load Logged-in User -------------------- */
  useEffect(() => {
    const loadUser = async () => {
      const storedUserId = await AsyncStorage.getItem("userId");
      if (storedUserId) {
        setUserId(storedUserId);
      }
    };
    loadUser();
  }, []);

  /* -------------------- Create Room if Needed -------------------- */
  useEffect(() => {
    const initRoom = async () => {
      if (!roomId && userId && otherUserId) {
        try {
          const room = await createRoom({
            participants: [otherUserId],
          }).unwrap();

          setRoomId(room._id);
        } catch (err) {
          console.error("Room creation failed:", err);
        }
      }
    };

    initRoom();
  }, [userId, otherUserId, roomId]);

  /* -------------------- Fetch Messages -------------------- */
  const { data: fetchedMessages } = useGetMessagesQuery(
    { roomId: roomId ?? "" },
    { skip: !roomId }
  );

  useEffect(() => {
    if (Array.isArray(fetchedMessages)) {
      setMessages(fetchedMessages);
    }
  }, [fetchedMessages]);

  /* -------------------- Socket Setup -------------------- */
  useEffect(() => {
    if (!roomId || !userId) return;

    let socketInstance: Socket;

    const setupSocket = async () => {
      socketInstance = await connectSocket();
      setSocket(socketInstance);

      socketInstance.emit("joinRoom", roomId);

      socketInstance.on("newMessage", (msg: Message) => {
        if (msg.chatRoomId !== roomId) return;

        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      });
    };

    setupSocket();

    return () => {
      if (socketInstance) {
        socketInstance.off("newMessage");
        socketInstance.disconnect();
      }
    };
  }, [roomId, userId]);

  /* -------------------- Send Message -------------------- */
  const handleSend = () => {
    if (!text.trim() || !roomId || !socket) return;

    socket.emit("sendMessage", {
      chatRoomId: roomId,
      text: text.trim(),
    });

    setText("");
  };

  /* -------------------- Render Message -------------------- */
  const renderItem = ({ item }: { item: Message }) => {
    const isMe = item.senderId === userId;

    return (
      <View
        style={[
          styles.messageWrapper,
          isMe ? styles.myWrapper : styles.theirWrapper,
        ]}
      >
        <View
          style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}
        >
          <Text style={[styles.messageText, { color: isMe ? "#fff" : "#000" }]}>
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Type a message..."
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={handleSend}
              style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
              disabled={!text.trim()}
            >
              <Ionicons name="arrow-up" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* -------------------- Styles -------------------- */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F7FB" },
  listContent: { paddingHorizontal: 16, paddingVertical: 20 },

  messageWrapper: {
    marginBottom: 12,
    maxWidth: "80%",
  },
  myWrapper: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  theirWrapper: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  myBubble: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 10,
    color: "#ADB5BD",
    marginTop: 4,
  },

  inputWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F1F3F5",
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 8,
    maxHeight: 100,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  sendBtnDisabled: {
    backgroundColor: "#B0D4FF",
  },
});
