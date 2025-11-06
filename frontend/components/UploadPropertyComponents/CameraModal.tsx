import { styles } from "@/styles/SafetyDetailsScreen";
import { CameraModalProps } from "@/types/SafetyDetailsScreen.types";
import { FC, useState, useEffect } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

const MAX_DESCRIPTION_LENGTH = 300;

export const CameraModal: FC<CameraModalProps> = ({
  visible,
  initialDescription,
  onClose,
  onContinue,
  themeColors,
}) => {
  const [description, setDescription] = useState(initialDescription);
  const isContinueDisabled = description.trim().length === 0;

  // Update local state if modal opens with a different initialDescription
  useEffect(() => {
    if (visible) setDescription(initialDescription);
  }, [visible, initialDescription]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: themeColors.background },
          ]}
        >
          <Text style={[styles.modalTitle, { color: themeColors.text }]}>
            Tell Persons about your exterior security cameras
          </Text>
          <Text style={[styles.modalSubtitle, { color: themeColors.text }]}>
            Describe the area that each camera monitors, such as backyard or
            pool.
          </Text>
          <TextInput
            style={[
              styles.modalInput,
              { color: themeColors.text, borderColor: themeColors.border },
            ]}
            multiline
            maxLength={MAX_DESCRIPTION_LENGTH}
            value={description}
            onChangeText={setDescription}
            placeholder="e.g. Backyard, front porch, etc."
            placeholderTextColor={themeColors.border}
            autoFocus
          />
          <View style={styles.modalFooter}>
            <Text style={[styles.charCount, { color: themeColors.text }]}>
              {MAX_DESCRIPTION_LENGTH - description.length} characters left
            </Text>
            <TouchableOpacity
              disabled={isContinueDisabled}
              style={[
                styles.continueButton,
                isContinueDisabled && styles.continueButtonDisabled,
                !isContinueDisabled && { backgroundColor: themeColors.primary },
              ]}
              onPress={() => onContinue(description.trim())}
            >
              <Text
                style={[
                  styles.continueButtonText,
                  isContinueDisabled && { color: "#888" },
                ]}
              >
                Continue
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.modalClose} onPress={onClose}>
            <Text style={[styles.modalCloseText, { color: themeColors.text }]}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
