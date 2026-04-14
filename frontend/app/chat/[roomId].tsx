import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Socket } from "socket.io-client";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contextStore/ThemeContext";
import { connectSocket } from "@/services/socket";
import { tokenManager } from "@/services/tokenManager";
import {
  useCreateRoomMutation,
  useLazyGetMessagesQuery,
} from "@/hooks/chat";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageInput } from "@/components/chat/MessageInput";

const PAGE_SIZE = 50;

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
  const [socket, setSocket] = useState<Socket | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const shouldScrollToBottomRef = useRef(true);
  const [createRoom] = useCreateRoomMutation();
  const [fetchMessages] = useLazyGetMessagesQuery();

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    const loadUser = async () => {
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
          const room = await createRoom({
            participants: [userId, otherUserId],
            propertyId,
          }).unwrap();
          setRoomId(room._id);
          router.setParams({ roomId: room._id });
        } catch {
          setInitialLoading(false);
        }
      }
    };

    initRoom();
  }, [createRoom, otherUserId, propertyId, roomId, router, userId]);

  const mergeMessages = useCallback((incoming: any[], mode: "replace" | "prepend") => {
    setMessages((prev) => {
      if (mode === "replace") {
        return incoming;
      }

      const existingIds = new Set(prev.map((message) => message._id));
      const olderMessages = incoming.filter(
        (message) => !existingIds.has(message._id),
      );
      return [...olderMessages, ...prev];
    });
  }, []);

  const loadMessagePage = useCallback(
    async (mode: "replace" | "prepend", before?: string) => {
      if (!roomId || roomId === "undefined") {
        setInitialLoading(false);
        return;
      }

      if (mode === "prepend") {
        setLoadingOlder(true);
      } else {
        setInitialLoading(true);
        shouldScrollToBottomRef.current = true;
      }

      try {
        const response = await fetchMessages(
          { roomId, before, limit: PAGE_SIZE },
          true,
        ).unwrap();
        mergeMessages(response.data, mode);
        setHasMoreMessages(response.hasMore);
      } finally {
        if (mode === "prepend") {
          setLoadingOlder(false);
        } else {
          setInitialLoading(false);
        }
      }
    },
    [fetchMessages, mergeMessages, roomId],
  );

  useEffect(() => {
    if (!roomId || !userId) return;
    loadMessagePage("replace");
  }, [loadMessagePage, roomId, userId]);

  useEffect(() => {
    if (!roomId || !userId) return;
    let socketInstance: Socket;

    const setupSocket = async () => {
      socketInstance = await connectSocket();
      setSocket(socketInstance);
      socketInstance.emit("joinRoom", roomId);
      socketInstance.emit("markAsRead", { roomId });

      socketInstance.on("newMessage", (message) => {
        if (message.chatRoomId?.toString() !== roomId) {
          return;
        }

        setMessages((prev) => {
          if (prev.some((existing) => existing._id === message._id)) {
            return prev;
          }
          shouldScrollToBottomRef.current = true;
          return [...prev, message];
        });

        if (message.senderId?._id !== userId) {
          socketInstance.emit("markAsRead", { roomId });
        }
      });
    };

    setupSocket();
    return () => {
      if (socketInstance) {
        socketInstance.off("newMessage");
      }
    };
  }, [roomId, userId]);

  const handleLoadOlder = async () => {
    if (loadingOlder || !hasMoreMessages || messages.length === 0) return;
    shouldScrollToBottomRef.current = false;
    await loadMessagePage("prepend", messages[0]?.createdAt);
  };

  const handleSend = () => {
    if (!text.trim() || !roomId || !socket) return;
    shouldScrollToBottomRef.current = true;
    socket.emit("sendMessage", { chatRoomId: roomId, text });
    setText("");
  };

  useEffect(() => {
    if (messages.length > 0 && shouldScrollToBottomRef.current) {
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      });
    }
  }, [messages.length]);

  if (initialLoading) {
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
      style={[
        styles.container,
        {
          backgroundColor: currentTheme.background,
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        },
      ]}
    >
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />

      <ChatHeader
        onBack={() => router.back()}
        otherUserName={otherUserName}
        otherUserImage={otherUserImage}
        theme={currentTheme}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight + 10 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <MessageBubble
              item={item}
              userId={userId}
              otherUserImage={otherUserImage}
              theme={currentTheme}
            />
          )}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: keyboardHeight + 70,
          }}
          ListHeaderComponent={
            hasMoreMessages ? (
              <TouchableOpacity
                onPress={handleLoadOlder}
                disabled={loadingOlder}
                style={styles.loadOlderButton}
              >
                {loadingOlder ? (
                  <ActivityIndicator size="small" color={currentTheme.primary} />
                ) : (
                  <Text
                    style={[
                      styles.loadOlderText,
                      { color: currentTheme.primary },
                    ]}
                  >
                    Load older messages
                  </Text>
                )}
              </TouchableOpacity>
            ) : null
          }
        />

        <View
          style={{
            position: "absolute",
            bottom: keyboardHeight,
            left: 0,
            right: 0,
            borderTopWidth: 1,
            borderTopColor: currentTheme.border,
            backgroundColor: currentTheme.background,
          }}
        >
          <MessageInput
            text={text}
            setText={setText}
            onSend={handleSend}
            theme={currentTheme}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadOlderButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  loadOlderText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
