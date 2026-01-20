import React from "react";
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
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
  onVoicePressIn?: () => void;
  onVoicePressOut?: () => void;
  isRecording?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  placeholder = "Search...",
  onChangeText,
  onFavPress,
  onVoicePressIn,
  onVoicePressOut,
  isRecording = false,
}) => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

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

      {/* 🎤 Voice Button */}
      {onVoicePressIn && onVoicePressOut && (
        <Pressable
          onPressIn={onVoicePressIn}
          onPressOut={onVoicePressOut}
          style={[styles.micButton, isRecording && styles.micActive]}
        >
          {isRecording ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="mic" size={18} color="#fff" />
          )}
        </Pressable>
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
  micButton: {
    backgroundColor: "#4f46e5",
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  micActive: {
    backgroundColor: "#dc2626",
  },
  favButton: {
    padding: 6,
  },
});
