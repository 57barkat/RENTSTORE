import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../constants/Colors";

interface SubscriptionStatusModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  type?: "info" | "warning" | "success";
}

export default function SubscriptionStatusModal({
  visible,
  onClose,
  title = "Subscription Update",
  message,
  type = "info",
}: SubscriptionStatusModalProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const currentTheme = Colors[isDark ? "dark" : "light"];

  const getIcon = () => {
    switch (type) {
      case "warning":
        return { name: "alert-circle", color: "#F59E0B" };
      case "success":
        return { name: "checkmark-circle", color: "#10B981" };
      default:
        return { name: "information-circle", color: currentTheme.primary };
    }
  };

  const iconConfig = getIcon();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: currentTheme.background,
              borderColor: currentTheme.border,
            },
          ]}
        >
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: iconConfig.color + "20" },
            ]}
          >
            <Ionicons
              name={iconConfig.name as any}
              size={40}
              color={iconConfig.color}
            />
          </View>

          <Text style={[styles.title, { color: currentTheme.text }]}>
            {title}
          </Text>

          <Text style={[styles.description, { color: currentTheme.muted }]}>
            {message || "Your subscription status has been updated."}
          </Text>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: currentTheme.primary },
            ]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  primaryButton: {
    width: "100%",
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
