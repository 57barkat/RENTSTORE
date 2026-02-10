import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface MessageInputProps {
  text: string;
  setText: (t: string) => void;
  onSend: () => void;
  theme: any;
}

export const MessageInput = ({
  text,
  setText,
  onSend,
  theme,
}: MessageInputProps) => (
  <View
    style={[
      styles.inputArea,
      {
        borderTopColor: theme.border,
        backgroundColor: theme.background,
      },
    ]}
  >
    <View style={[styles.innerInput, { backgroundColor: theme.card }]}>
      <TextInput
        style={[styles.textField, { color: theme.text }]}
        value={text}
        onChangeText={setText}
        placeholder="Write a message..."
        placeholderTextColor={theme.muted}
        multiline
      />
      <TouchableOpacity
        onPress={onSend}
        disabled={!text.trim()}
        style={[
          styles.sendCircle,
          {
            backgroundColor: text.trim() ? theme.primary : theme.muted,
          },
        ]}
      >
        <Ionicons name="send" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
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
