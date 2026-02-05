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
  onPress?: () => void;
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
  onPress,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const currentTheme = Colors[theme ?? "light"];

  // Design values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.6,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 0.3,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
      opacityAnim.setValue(1);
    }
  }, [isRecording]);

  return (
    <View style={styles.outerContainer}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark ? "rgba(30, 31, 36, 0.95)" : "#FFFFFF",
            borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
            borderWidth: 1,
          },
        ]}
      >
        <Ionicons
          name="search-outline"
          size={20}
          color={isDark ? "#9BA1A6" : "#6B7280"}
          style={styles.icon}
        />

        {/* This Pressable makes the input area act as a redirect button */}
        <Pressable onPress={onPress} style={styles.inputWrapper}>
          <View pointerEvents="none" style={{ flex: 1 }}>
            <TextInput
              value={value}
              onChangeText={onChangeText}
              editable={false} // Prevents keyboard from appearing
              placeholder={
                isRecording
                  ? `Listening... ${15 - (timer ?? 0)}s`
                  : hasAudio
                    ? "Voice ready to send..."
                    : placeholder
              }
              placeholderTextColor={
                isRecording ? currentTheme.danger : "#9CA3AF"
              }
              style={[
                styles.input,
                {
                  color: currentTheme.text,
                  fontWeight: "400",
                },
              ]}
            />
          </View>
        </Pressable>

        {!hasAudio ? (
          <View style={styles.micWrapper}>
            {isRecording && (
              <Animated.View
                style={[
                  styles.pulseCircle,
                  {
                    transform: [{ scale: pulseAnim }],
                    opacity: opacityAnim,
                    backgroundColor: "rgba(239, 68, 68, 0.25)",
                  },
                ]}
              />
            )}
            <Pressable
              onPress={isRecording ? onVoiceStop : onVoiceStart}
              style={({ pressed }) => [
                styles.micButton,
                {
                  backgroundColor: isRecording
                    ? "#EF4444"
                    : currentTheme.secondary,
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
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
              style={({ pressed }) => [
                styles.actionBtn,
                {
                  backgroundColor: isDark ? "#451A1A" : "#FEE2E2",
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
            </Pressable>
            <Pressable
              onPress={onSendVoice}
              style={({ pressed }) => [
                styles.actionBtn,
                {
                  backgroundColor: currentTheme.success,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Ionicons name="paper-plane" size={16} color="#fff" />
            </Pressable>
          </View>
        )}

        <View style={styles.divider} />

        <Pressable
          onPress={onFavPress}
          style={({ pressed }) => [
            styles.favButton,
            { opacity: pressed ? 0.5 : 1 },
          ]}
        >
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    paddingHorizontal: 12,
    height: 54,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 5,
  },
  icon: {
    marginLeft: 4,
    marginRight: 10,
  },
  inputWrapper: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: "100%",
    paddingVertical: 0,
  },
  micWrapper: {
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
  },
  micButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  pulseCircle: {
    position: "absolute",
    width: 38,
    height: 38,
    borderRadius: 12,
    zIndex: 1,
  },
  reviewActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginRight: 4,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(156, 163, 175, 0.15)",
    marginHorizontal: 8,
  },
  favButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});
