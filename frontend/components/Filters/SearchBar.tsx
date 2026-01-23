import React, { useEffect, useRef } from "react";
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";

interface SearchBarProps {
  value: string;
  placeholder?: string;
  onChangeText: (text: string) => void;
  onFavPress: () => void;

  /* 🎤 Voice props */
  onVoiceStart?: () => void;
  onVoiceStop?: () => void;
  onVoicePlay?: () => void;
  onVoiceStopPlayback?: () => void;
  isRecording?: boolean;
  isPlaying?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  placeholder = "Search...",
  onChangeText,
  onFavPress,
  onVoiceStart,
  onVoiceStop,
  onVoicePlay,
  onVoiceStopPlayback,
  isRecording = false,
  isPlaying = false,
}) => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  // Animation reference for pulsing effect
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const handleMicPress = () => {
    if (isRecording) {
      onVoiceStop?.();
    } else {
      onVoiceStart?.();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.card }]}>
      {/* 🔍 Search Icon */}
      <Ionicons
        name="search-outline"
        size={20}
        color={currentTheme.text}
        style={styles.icon}
      />

      {/* ✍️ Input */}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={currentTheme.muted}
        style={[styles.input, { color: currentTheme.text }]}
      />

      {/* 🎤 Voice Button - Pulse logic added here */}
      {onVoiceStart && onVoiceStop && (
        <View style={styles.micWrapper}>
          {isRecording && (
            <Animated.View
              style={[
                styles.pulseCircle,
                {
                  transform: [{ scale: pulseAnim }],
                  backgroundColor: "#dc2626",
                },
              ]}
            />
          )}
          <Pressable
            onPress={handleMicPress}
            style={[styles.micButton, isRecording && styles.micActive]}
          >
            {isRecording ? (
              <Ionicons name="stop" size={18} color="#fff" />
            ) : (
              <Ionicons name="mic" size={18} color="#fff" />
            )}
          </Pressable>
        </View>
      )}

      {/* ❤️ Favorites */}
      <Pressable onPress={onFavPress} style={styles.favButton}>
        <Ionicons name="heart-outline" size={20} color={currentTheme.primary} />
      </Pressable>
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 6,
  },
  micWrapper: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  micButton: {
    backgroundColor: "#4f46e5",
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  micActive: {
    backgroundColor: "#dc2626",
  },
  pulseCircle: {
    position: "absolute",
    width: 38,
    height: 38,
    borderRadius: 19,
    opacity: 0.4,
    zIndex: 1,
  },
  favButton: {
    padding: 6,
  },
});
