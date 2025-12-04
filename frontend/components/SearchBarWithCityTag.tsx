import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Keyboard,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

type ThemeColors = {
  primary: string;
  text: string;
  muted: string;
  card: string;
  border: string;
};

type Props = {
  searchValue: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  selectedCity?: string | null;
  onClearCity?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  containerStyle?: any;
  inputStyle?: any;
  currentTheme: ThemeColors;
};

export default function SearchBarWithCityTag({
  searchValue,
  onChangeText,
  placeholder = "Search by city",
  selectedCity,
  onClearCity,
  onFocus,
  onBlur,
  containerStyle,
  inputStyle,
  currentTheme,
}: Props) {
  return (
    <View style={[styles.row, containerStyle]}>
      <View
        style={[
          styles.pillSearchContainer,
          {
            borderColor: currentTheme.border,
            backgroundColor: currentTheme.card,
            shadowColor: currentTheme.text,
          },
        ]}
      >
        <Feather name="search" size={20} color={currentTheme.primary} />
        <TextInput
          value={searchValue}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={currentTheme.muted}
          style={[
            styles.searchInput,
            { color: currentTheme.text },
            inputStyle,
            selectedCity ? { maxWidth: "50%" } : { maxWidth: "80%" },
          ]}
          onFocus={() => onFocus?.()}
          onBlur={() => {
            // Small delay can help with dropdown item press from parent
            setTimeout(() => onBlur?.(), 200);
          }}
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="search"
        />

        {selectedCity ? (
          <TouchableOpacity
            onPress={() => {
              onClearCity?.();
              // Also dismiss keyboard for better UX
              Keyboard.dismiss();
            }}
            activeOpacity={0.8}
            style={[
              styles.cityTag,
              {
                backgroundColor: currentTheme.primary,
              },
            ]}
          >
            <Text style={styles.cityTagText}>{selectedCity}</Text>
            <Ionicons
              name="close-circle"
              size={16}
              color="#fff"
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 15,
    zIndex: 10,
  },
  pillSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 15,
    height: 55,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    fontSize: 16,
    marginLeft: 10,
    fontWeight: "500",
  },
  cityTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.25)",
  },
  cityTagText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
