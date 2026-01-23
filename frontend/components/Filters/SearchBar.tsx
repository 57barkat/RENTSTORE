import React, { useEffect, useRef } from "react";
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
  Text,
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
  const currentTheme = Colors[theme ?? "light"];
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
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
      <View style={[styles.container, { backgroundColor: currentTheme.card }]}>
        <Ionicons
          name="search-outline"
          size={20}
          color={currentTheme.text}
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
          placeholderTextColor={isRecording ? "#ef4444" : currentTheme.muted}
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
                    backgroundColor: "#ef4444",
                  },
                ]}
              />
            )}
            <Pressable
              onPress={isRecording ? onVoiceStop : onVoiceStart}
              style={[
                styles.micButton,
                { backgroundColor: isRecording ? "#ef4444" : "#4f46e5" },
              ]}
            >
              <Ionicons
                name={isRecording ? "stop" : "mic"}
                size={20}
                color="#fff"
              />
            </Pressable>
          </View>
        ) : (
          <View style={styles.reviewActions}>
            <Pressable
              onPress={onCancelVoice}
              style={[styles.actionBtn, { backgroundColor: "#fee2e2" }]}
            >
              <Ionicons name="trash" size={18} color="#ef4444" />
            </Pressable>
            <Pressable
              onPress={onSendVoice}
              style={[styles.actionBtn, { backgroundColor: "#10b981" }]}
            >
              <Ionicons name="send" size={18} color="#fff" />
            </Pressable>
          </View>
        )}

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
    marginTop: 12,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  micWrapper: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  pulseCircle: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.3,
    zIndex: 1,
  },
  reviewActions: {
    flexDirection: "row",
    gap: 8,
    marginRight: 10,
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  favButton: {
    padding: 4,
  },
});
