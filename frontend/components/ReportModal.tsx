import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FontSize } from "@/constants/Typography";

export default function ReportModal({
  visible,
  setVisible,
  theme,
  isDark,
  selectedReason,
  setSelectedReason,
  reportDescription,
  setReportDescription,
  onSubmit,
  isReporting,
}: any) {
  const reasons = ["SCAM", "RENTED", "INCORRECT_DATA", "OFFENSIVE", "OTHER"];

  return (
    <View>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={styles.reportBtn}
      >
        <Text style={[styles.reportText, { color: theme.muted }]}>
          Report this property
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.background }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Report Property
              </Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalLabel, { color: theme.muted }]}>
              Select a Reason
            </Text>
            <View style={styles.reasonContainer}>
              {reasons.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  onPress={() => setSelectedReason(reason)}
                  style={[
                    styles.reasonBadge,
                    {
                      borderColor:
                        selectedReason === reason
                          ? theme.primary
                          : theme.border,
                      backgroundColor:
                        selectedReason === reason
                          ? `${theme.primary}20`
                          : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        selectedReason === reason ? theme.primary : theme.text,
                      fontWeight: selectedReason === reason ? "700" : "400",
                    }}
                  >
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[
                styles.textArea,
                {
                  color: theme.text,
                  borderColor: theme.border,
                  backgroundColor: isDark ? "#1A1A1A" : "#F9F9F9",
                },
              ]}
              multiline
              placeholder="Additional details..."
              placeholderTextColor={theme.muted}
              value={reportDescription}
              onChangeText={setReportDescription}
            />
            <TouchableOpacity
              onPress={onSubmit}
              disabled={isReporting}
              style={[styles.submitButton, { backgroundColor: theme.primary }]}
            >
              {isReporting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Report</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  reportBtn: { marginTop: 20, alignItems: "center" },
  reportText: {
    fontSize: 12,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 24,
    minHeight: 450,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: FontSize.lg, fontWeight: "800" },
  modalLabel: { fontSize: FontSize.sm, fontWeight: "600", marginBottom: 10 },
  reasonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  reasonBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  textArea: {
    borderRadius: 12,
    padding: 12,
    height: 100,
    textAlignVertical: "top",
    borderWidth: 1,
    marginBottom: 20,
  },
  submitButton: { borderRadius: 15, padding: 16, alignItems: "center" },
  submitButtonText: {
    color: "white",
    fontSize: FontSize.base,
    fontWeight: "700",
  },
});
