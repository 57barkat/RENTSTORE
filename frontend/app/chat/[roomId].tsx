import React, { useEffect, useState, useRef } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  View,
  Keyboard,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contextStore/ThemeContext";
import { tokenManager } from "@/services/tokenManager";
import { connectSocket } from "@/services/socket";
import { useCreateRoomMutation, useGetMessagesQuery } from "@/hooks/chat";
import { Socket } from "socket.io-client";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageInput } from "@/components/chat/MessageInput";

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
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
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
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
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
});
