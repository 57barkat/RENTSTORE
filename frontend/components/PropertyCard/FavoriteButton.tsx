// PropertyCard/FavoriteButton.tsx
import React from "react";
import { TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useTheme } from "@/contextStore/ThemeContext";

interface Props {
  isFav?: boolean;
  loading?: boolean;
  onPress: () => void;
}

export default function FavoriteButton({ isFav, loading, onPress }: Props) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <FontAwesome
          name={isFav ? "heart" : "heart-o"}
          size={20}
          color={isFav ? (theme === "dark" ? "#ff4d4d" : "#ff1a1a") : "#fff"}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
});
