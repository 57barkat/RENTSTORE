import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

interface MessageBubbleProps {
  item: any;
  userId: string;
  otherUserImage?: string;
  theme: any;
}

export const MessageBubble = ({
  item,
  userId,
  otherUserImage,
  theme,
}: MessageBubbleProps) => {
  const senderData = item.senderId;
  const isMe =
    (typeof senderData === "object" ? senderData._id : senderData) === userId;
  const avatarUri = isMe
    ? senderData?.profileImage
    : senderData?.profileImage || otherUserImage;

  return (
    <View style={[styles.msgRow, isMe ? styles.myRow : styles.theirRow]}>
      {!isMe && <Image source={{ uri: avatarUri }} style={styles.chatAvatar} />}
      <View style={isMe ? styles.myMsgContent : styles.theirMsgContent}>
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: isMe ? theme.primary : theme.card,
            },
          ]}
        >
          <Text style={[styles.msgText, { color: isMe ? "#fff" : theme.text }]}>
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
      {isMe && <Image source={{ uri: avatarUri }} style={styles.chatAvatar} />}
    </View>
  );
};

const styles = StyleSheet.create({
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
});
