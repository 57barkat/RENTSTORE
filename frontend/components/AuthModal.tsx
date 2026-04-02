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
import { useRouter } from "expo-router";

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  featureName?: string;
}

export default function AuthModal({
  visible,
  onClose,
  featureName,
}: AuthModalProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const isDark = theme === "dark";
  const currentTheme = Colors[isDark ? "dark" : "light"];

  const handleAction = (route: "signin" | "signup") => {
    onClose();
    router.push(`/${route}`);
  };

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
          {/* Header Icon */}
          <View
            style={[styles.iconCircle, { backgroundColor: currentTheme.card }]}
          >
            <Ionicons
              name="lock-closed"
              size={32}
              color={currentTheme.primary}
            />
          </View>

          {/* Text Content */}
          <Text style={[styles.title, { color: currentTheme.text }]}>
            Login Required
          </Text>
          <Text style={[styles.description, { color: currentTheme.muted }]}>
            To access {featureName || "this feature"}, you need to be logged in.
            Don&apos;t have an account? Create one to get started.
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: currentTheme.primary },
              ]}
              onPress={() => handleAction("signin")}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                { borderColor: currentTheme.primary },
              ]}
              onPress={() => handleAction("signup")}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: currentTheme.primary },
                ]}
              >
                Create Account
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text
                style={[styles.closeButtonText, { color: currentTheme.muted }]}
              >
                Maybe Later
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.7)", // Deep Navy overlay
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    elevation: 10,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    width: "100%",
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    width: "100%",
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    marginTop: 8,
    padding: 10,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});
