import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FontSize } from "@/constants/Typography";

interface PromoteModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (type: "boost" | "featured") => void;
  propertyTitle: string;
  featuredCredits: number;
  boostCredits: number;
  isPromoting: boolean;
  currentTheme: any;
}

const PromoteConfirmationModal = ({
  visible,
  onClose,
  onConfirm,
  propertyTitle,
  featuredCredits,
  boostCredits,
  isPromoting,
  currentTheme,
}: PromoteModalProps): React.ReactNode => {
  const [selectedType, setSelectedType] = useState<"boost" | "featured">(
    "boost",
  );

  const currentSelectionCredits =
    selectedType === "boost" ? boostCredits : featuredCredits;
  const canPromote = currentSelectionCredits > 0;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.box, { backgroundColor: currentTheme.card }]}>
          <Text style={[styles.title, { color: currentTheme.text }]}>
            Promote Listing
          </Text>

          <Text style={[styles.message, { color: currentTheme.muted }]}>
            Select promotion type for:{"\n"}
            <Text style={{ color: currentTheme.text, fontWeight: "700" }}>
              {propertyTitle}
            </Text>
          </Text>

          <View style={styles.toggleContainer}>
            <TouchableOpacity
              onPress={() => setSelectedType("boost")}
              style={[
                styles.optionCard,
                {
                  borderColor:
                    selectedType === "boost" ? "#FFB800" : currentTheme.border,
                },
                selectedType === "boost" && { backgroundColor: "#FFF9E6" },
              ]}
            >
              <MaterialCommunityIcons
                name="rocket-launch"
                size={24}
                color={
                  selectedType === "boost" ? "#FFB800" : currentTheme.muted
                }
              />
              <Text style={[styles.optionTitle, { color: currentTheme.text }]}>
                Boost
              </Text>
              <Text style={styles.optionCredits}>{boostCredits} Slots</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedType("featured")}
              style={[
                styles.optionCard,
                {
                  borderColor:
                    selectedType === "featured"
                      ? "#4F46E5"
                      : currentTheme.border,
                },
                selectedType === "featured" && { backgroundColor: "#EEF2FF" },
              ]}
            >
              <MaterialCommunityIcons
                name="crown"
                size={24}
                color={
                  selectedType === "featured" ? "#4F46E5" : currentTheme.muted
                }
              />
              <Text style={[styles.optionTitle, { color: currentTheme.text }]}>
                Featured
              </Text>
              <Text style={styles.optionCredits}>{featuredCredits} Left</Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.infoBox,
              { backgroundColor: currentTheme.background },
            ]}
          >
            <Text style={[styles.infoText, { color: currentTheme.secondary }]}>
              {selectedType === "boost"
                ? "Moves your property to the top of search results."
                : "Highlights your property with a premium badge (10x views)."}
            </Text>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.cancelBtn}
              disabled={isPromoting}
            >
              <Text style={[styles.cancelText, { color: currentTheme.muted }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onConfirm(selectedType)}
              disabled={isPromoting || !canPromote}
              style={[
                styles.confirmBtn,
                {
                  backgroundColor: !canPromote
                    ? "#ccc"
                    : selectedType === "boost"
                      ? "#FFB800"
                      : "#4F46E5",
                },
              ]}
            >
              {isPromoting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.confirmText}>
                  {canPromote
                    ? `Use 1 ${selectedType === "boost" ? "Slot" : "Credit"}`
                    : "No Credits"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: { width: "90%", borderRadius: 24, padding: 24, elevation: 10 },
  title: {
    fontSize: FontSize.lg,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: FontSize.sm,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  optionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    gap: 4,
  },
  optionTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
  },
  optionCredits: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "600",
  },
  infoBox: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 12,
    textAlign: "center",
    fontStyle: "italic",
  },
  buttons: { flexDirection: "row", gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 14, alignItems: "center" },
  cancelText: { fontWeight: "700", fontSize: FontSize.sm },
  confirmBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: { color: "#fff", fontWeight: "800", fontSize: FontSize.sm },
});

export default PromoteConfirmationModal;
