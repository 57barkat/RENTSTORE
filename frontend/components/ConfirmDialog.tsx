import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { ConfirmationModalProps } from "@/types/ConfirmationModel.types";
// import { ConfirmationModalProps } from "@/types/ConfirmationModal.types";

const ConfirmationModal = ({
  visible,
  title,
  message,
  confirmText = "Yes",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmationModalProps) => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            borderRadius: 24,
            width: "100%",
            padding: 24,
            backgroundColor: currentTheme.card,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              marginBottom: 12,
              textAlign: "center",
              color: currentTheme.text,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              textAlign: "center",
              marginBottom: 24,
              color: currentTheme.secondary,
            }}
          >
            {message}
          </Text>

          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TouchableOpacity
              onPress={onCancel}
              style={{
                flex: 1,
                paddingVertical: 12,
                marginRight: 12,
                borderRadius: 16,
                backgroundColor: currentTheme.secondary,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "600",
                  color: currentTheme.background,
                }}
              >
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              style={{
                flex: 1,
                paddingVertical: 12,
                marginLeft: 12,
                borderRadius: 16,
                backgroundColor: currentTheme.danger,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "600",
                  color: "#fff",
                }}
              >
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmationModal;
