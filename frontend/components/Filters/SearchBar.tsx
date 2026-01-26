import React, { useEffect, useRef } from "react";
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
  Text,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";

interface SearchBarProps {
  value: string;
  placeholder?: string;
  onChangeText: (text: string) => void;
  onFavPress: () => void;
  onVoiceStart: () => void;
  onVoiceStop: () => void;
  onSendVoice: () => void;
  onCancelVoice: () => void;
  isRecording?: boolean;
  hasAudio?: boolean;
  timer?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  placeholder = "Search...",
  onChangeText,
  onFavPress,
  onVoiceStart,
  onVoiceStop,
  onSendVoice,
  onCancelVoice,
  isRecording = false,
  hasAudio = false,
  timer = 0,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const currentTheme = Colors[theme ?? "light"];
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.4,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  return (
    <View style={styles.outerContainer}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? "rgba(42, 42, 50, 0.8)"
              : "rgba(255, 255, 255, 0.95)",
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
            borderWidth: 1,
          },
        ]}
      >
        <Ionicons
          name="search-outline"
          size={20}
          color={isDark ? "#9CA3AF" : "#6B7280"}
          style={styles.icon}
        />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={
            isRecording
              ? `Recording... ${15 - (timer ?? 0)}s`
              : hasAudio
                ? "Voice ready to send..."
                : placeholder
          }
          placeholderTextColor={isRecording ? "#EF4444" : "#9CA3AF"}
          style={[styles.input, { color: currentTheme.text }]}
          editable={!isRecording && !hasAudio}
        />

        {!hasAudio ? (
          <View style={styles.micWrapper}>
            {isRecording && (
              <Animated.View
                style={[
                  styles.pulseCircle,
                  {
                    transform: [{ scale: pulseAnim }],
                    backgroundColor: "rgba(239, 68, 68, 0.3)",
                  },
                ]}
              />
            )}
            <Pressable
              onPress={isRecording ? onVoiceStop : onVoiceStart}
              style={[
                styles.micButton,
                {
                  backgroundColor: isRecording
                    ? "#EF4444"
                    : isDark
                      ? "#4F46E5"
                      : "#6366F1",
                },
              ]}
            >
              <Ionicons
                name={isRecording ? "stop" : "mic"}
                size={18}
                color="#fff"
              />
            </Pressable>
          </View>
        ) : (
          <View style={styles.reviewActions}>
            <Pressable
              onPress={onCancelVoice}
              style={[
                styles.actionBtn,
                { backgroundColor: isDark ? "#451A1A" : "#FEE2E2" },
              ]}
            >
              <Ionicons name="trash" size={16} color="#EF4444" />
            </Pressable>
            <Pressable
              onPress={onSendVoice}
              style={[styles.actionBtn, { backgroundColor: "#10B981" }]}
            >
              <Ionicons name="send" size={16} color="#fff" />
            </Pressable>
          </View>
        )}

        <View style={styles.divider} />

        <Pressable onPress={onFavPress} style={styles.favButton}>
          <Ionicons
            name="heart-outline"
            size={22}
            color={currentTheme.primary}
          />
        </Pressable>
      </View>
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  outerContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16, // Matching the header/host option radius style
    paddingHorizontal: 12,
    paddingVertical: 8,
    // Premium Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  icon: {
    marginLeft: 4,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
  },
  micWrapper: {
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
  micButton: {
    width: 36,
    height: 36,
    borderRadius: 12, // Using the same "squircle" radius as header buttons
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  pulseCircle: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 12,
    zIndex: 1,
  },
  reviewActions: {
    flexDirection: "row",
    gap: 6,
    marginRight: 8,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(156, 163, 175, 0.2)",
    marginHorizontal: 8,
  },
  favButton: {
    padding: 6,
  },
});
