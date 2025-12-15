import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface ModalActionButtonProps {
  text: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  loading?: boolean;
  onPress: () => void;
  disabled?: boolean;
}

const ModalActionButton: React.FC<ModalActionButtonProps> = ({
  text,
  icon,
  color,
  loading = false,
  onPress,
  disabled = false,
}) => (
  <TouchableOpacity
    style={[styles.button, loading && { opacity: 0.6 }]}
    onPress={onPress}
    disabled={disabled || loading}
  >
    {loading ? (
      <ActivityIndicator size="small" color={color} />
    ) : (
      <>
        <MaterialIcons name={icon} size={24} color={color} />
        <Text style={[styles.text, { color }]}>{text}</Text>
      </>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: { flexDirection: "row", alignItems: "center", paddingVertical: 15 },
  text: { fontSize: 16, marginLeft: 15 },
});

export default ModalActionButton;
