import React from "react";
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
  onConfirm: () => void;
  propertyTitle: string;
  currentCredits: number;
  isPromoting: boolean;
  currentTheme: any;
}

const PromoteConfirmationModal = ({
  visible,
  onClose,
  onConfirm,
  propertyTitle,
  currentCredits,
  isPromoting,
  currentTheme,
}: PromoteModalProps): React.ReactNode => {
  const remainingCredits = Math.max(0, (currentCredits || 0) - 1);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.box, { backgroundColor: currentTheme.card }]}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="star-shooting"
              size={48}
              color="#EAB308"
            />
          </View>

          <Text style={[styles.title, { color: currentTheme.text }]}>
            Feature Property?
          </Text>

          <Text style={[styles.message, { color: currentTheme.muted }]}>
            You are about to use 1 credit to promote:{"\n"}
            <Text style={{ color: currentTheme.text, fontWeight: "700" }}>
              {propertyTitle}
            </Text>
          </Text>

          <View
            style={[
              styles.statsContainer,
              { backgroundColor: currentTheme.background },
            ]}
          >
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: currentTheme.muted }]}>
                Current Credits
              </Text>
              <Text style={[styles.statValue, { color: currentTheme.text }]}>
                {currentCredits}
              </Text>
            </View>
            <View
              style={[styles.divider, { backgroundColor: currentTheme.border }]}
            />
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: currentTheme.muted }]}>
                After Promotion
              </Text>
              <Text style={[styles.statValue, { color: "#EAB308" }]}>
                {remainingCredits}
              </Text>
            </View>
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
              onPress={onConfirm}
              disabled={isPromoting || currentCredits <= 0}
              style={[
                styles.confirmBtn,
                { backgroundColor: currentCredits > 0 ? "#EAB308" : "#ccc" },
              ]}
            >
              {isPromoting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.confirmText}>Confirm & Feature</Text>
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
  box: { width: "85%", borderRadius: 24, padding: 24, elevation: 10 },
  iconContainer: { alignSelf: "center", marginBottom: 16 },
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
  statsContainer: { borderRadius: 16, padding: 16, marginBottom: 24 },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: { fontSize: FontSize.xs, fontWeight: "600" },
  statValue: { fontSize: FontSize.base, fontWeight: "800" },
  divider: { height: 1, marginVertical: 10 },
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
