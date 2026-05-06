import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";

type ThemeColors = typeof Colors.light;

interface StickyActionBarProps {
  theme: ThemeColors;
  onCall?: () => void;
  onChat?: () => void;
  onWhatsApp?: () => void;
  canCall?: boolean;
  canChat?: boolean;
  canWhatsApp?: boolean;
  chatLoading?: boolean;
}

export default function StickyActionBar({
  theme,
  onCall,
  onChat,
  onWhatsApp,
  canCall = true,
  canChat = true,
  canWhatsApp = false,
  chatLoading = false,
}: StickyActionBarProps) {
  const insets = useSafeAreaInsets();
  const hasVisibleAction = canCall || canChat || canWhatsApp;

  if (!hasVisibleAction) {
    return null;
  }

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          paddingBottom: Math.max(insets.bottom, 14),
        },
      ]}
    >
      <View style={styles.row}>
        {canCall ? (
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={onCall}
            style={[styles.button, styles.primaryButton, { backgroundColor: theme.primary }]}
          >
            <Ionicons name="call-outline" size={18} color="#FFFFFF" />
            <Text style={styles.primaryText}>Call</Text>
          </TouchableOpacity>
        ) : null}

        {canChat ? (
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={onChat}
            disabled={chatLoading}
            style={[styles.button, styles.chatButton, { backgroundColor: theme.success }]}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={18} color="#FFFFFF" />
            <Text style={styles.primaryText}>{chatLoading ? "Opening..." : "Chat"}</Text>
          </TouchableOpacity>
        ) : null}

        {canWhatsApp ? (
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={onWhatsApp}
            style={[
              styles.button,
              styles.outlineButton,
              { borderColor: `${theme.success}33`, backgroundColor: `${theme.success}12` },
            ]}
          >
            <Ionicons name="logo-whatsapp" size={18} color={theme.success} />
            <Text style={[styles.outlineText, { color: theme.success }]}>WhatsApp</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingTop: 14,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
  },
  primaryButton: {},
  chatButton: {},
  outlineButton: {
    borderWidth: 1,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  outlineText: {
    fontSize: 15,
    fontWeight: "800",
  },
});
