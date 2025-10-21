import { styles } from "@/styles/SafetyDetailsScreen";
import { CameraModalProps } from "@/types/SafetyDetailsScreen.types";
import { FC, useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

const MAX_DESCRIPTION_LENGTH = 300;

export const CameraModal: FC<CameraModalProps> = ({
  visible,
  initialDescription,
  onClose,
  onContinue,
}) => {
  const [description, setDescription] = useState(initialDescription);
  const isContinueDisabled = description.trim().length === 0;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            Tell guests about your exterior security cameras
          </Text>
          <Text style={styles.modalSubtitle}>
            Describe the area that each camera monitors, such as backyard or
            pool.
          </Text>
          <TextInput
            style={styles.modalInput}
            multiline
            maxLength={MAX_DESCRIPTION_LENGTH}
            value={description}
            onChangeText={setDescription}
            placeholder="e.g. Backyard, front porch, etc."
            autoFocus
          />
          <View style={styles.modalFooter}>
            <Text style={styles.charCount}>
              {MAX_DESCRIPTION_LENGTH - description.length} characters left
            </Text>
            <TouchableOpacity
              disabled={isContinueDisabled}
              style={[
                styles.continueButton,
                isContinueDisabled && styles.continueButtonDisabled,
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
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
