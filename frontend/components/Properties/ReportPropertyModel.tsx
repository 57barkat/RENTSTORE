import { Colors } from "@/constants/Colors";
import { FontSize } from "@/constants/Typography";
import { useTheme } from "@/contextStore/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Modal, Text, TextInput } from "react-native-paper";

interface ReportPropertyModelProps {
  reasons: string[];
  isModalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  selectedReason: string | null;
  setSelectedReason: (reason: string) => void;
  reportDescription: string;
  setReportDescription: (description: string) => void;
  isReporting: boolean;
  submitReport: () => void;
  isDark: boolean;
}

const ReportPropertyModel = ({
  reasons,
  isModalVisible,
  setModalVisible,
  selectedReason,
  setSelectedReason,
  reportDescription,
  setReportDescription,
  isReporting,
  submitReport,
  isDark,
}: ReportPropertyModelProps) => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  return (
    <Modal visible={isModalVisible} onDismiss={() => setModalVisible(false)}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: currentTheme.background },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
              Report Property
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={currentTheme.text} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.modalLabel, { color: currentTheme.muted }]}>
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
                        ? currentTheme.primary
                        : currentTheme.border,
                    backgroundColor:
                      selectedReason === reason
                        ? `${currentTheme.primary}20`
                        : "transparent",
                  },
                ]}
              >
                <Text
                  style={{
                    color:
                      selectedReason === reason
                        ? currentTheme.primary
                        : currentTheme.text,
                    fontWeight: selectedReason === reason ? "700" : "400",
                  }}
                >
                  {reason}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text
            style={[
              styles.modalLabel,
              { color: currentTheme.muted, marginTop: 15 },
            ]}
          >
            Additional Details (Optional)
          </Text>
          <TextInput
            style={[
              styles.textArea,
              {
                color: currentTheme.text,
                borderColor: currentTheme.border,
                backgroundColor: isDark ? "#1A1A1A" : "#F9F9F9",
              },
            ]}
            multiline
            numberOfLines={4}
            placeholder="Tell us more about the problem..."
            placeholderTextColor={currentTheme.muted}
            value={reportDescription}
            onChangeText={setReportDescription}
          />

          <TouchableOpacity
            onPress={submitReport}
            disabled={isReporting}
            style={[
              styles.submitButton,
              { backgroundColor: currentTheme.primary },
            ]}
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
  );
};

export default ReportPropertyModel;
const styles = StyleSheet.create({
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
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: "800",
  },
  modalLabel: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    marginBottom: 10,
  },
  reasonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
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
  submitButton: {
    borderRadius: 15,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: FontSize.base,
    fontWeight: "700",
  },
});
