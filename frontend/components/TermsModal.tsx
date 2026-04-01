import React, { useState } from "react";
import {
  Modal,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

interface TermsModalProps {
  visible: boolean;
  theme: any;
  color: any;
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({
  visible,
  theme,
  onClose,
  color,
}) => {
  const [isChecked, setIsChecked] = useState(false);

  // Data matching the Figma content
  const termsData = [
    {
      id: 1,
      title: "Platform Purpose",
      body: "AnganStay is a property rental platform that connects renters, agencies, and individual landlords across Pakistan. We facilitate listings and inquiries but do not act as a party in rental agreements.",
    },
    {
      id: 2,
      title: "User Responsibility",
      body: "Users (renters and agencies) are independent contractors and are solely responsible for the accuracy of their listings, profile information, and any communications made through the platform.",
    },
    {
      id: 3,
      title: "Dispute Policy",
      body: "AnganStay is not responsible for disputes arising between parties. We recommend verifying all details before making payments.",
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View
          style={[styles.modalContent, { backgroundColor: theme.background }]}
        >
          {/* Top Handle Bar */}
          <View style={styles.handle} />

          {/* Header Row */}
          <View style={styles.header}>
            <View style={styles.headerIconContainer}>
              <Feather name="shield" size={20} color="#10B981" />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={[styles.title, { color: theme.text }]}>
                Terms and Conditions
              </Text>
              <Text style={[styles.subtitle, { color: theme.muted }]}>
                Please read before continuing
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeCircle}>
              <Ionicons name="close" size={20} color={theme.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scroll}
          >
            {termsData.map((item) => (
              <View key={item.id} style={styles.termItem}>
                <View style={styles.stepContainer}>
                  <View
                    style={[styles.stepCircle, { backgroundColor: "#DCFCE7" }]}
                  >
                    <Text style={styles.stepText}>{item.id}</Text>
                  </View>
                </View>
                <View style={styles.contentWrap}>
                  <Text style={[styles.termTitle, { color: theme.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.termBody, { color: theme.muted }]}>
                    {item.body}
                  </Text>
                </View>
              </View>
            ))}

            {/* Checkbox Section inside Modal */}
            <Pressable
              style={[styles.checkboxCard, { backgroundColor: "#F8FAFC" }]}
              onPress={() => setIsChecked(!isChecked)}
            >
              <View
                style={[
                  styles.checkbox,
                  isChecked && {
                    backgroundColor: "#10B981",
                    borderColor: "#10B981",
                  },
                ]}
              >
                {isChecked && <Feather name="check" size={14} color="#fff" />}
              </View>
              <Text style={styles.checkboxLabel}>
                I have read and agree to the{" "}
                <Text style={styles.linkText}>Terms and Conditions</Text>
              </Text>
            </Pressable>
          </ScrollView>

          {/* Action Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: isChecked ? "#10B981" : "#94A3B8" },
              ]}
              onPress={isChecked ? onClose : undefined}
            >
              <Text style={styles.actionButtonText}>
                {isChecked ? "Accept and Continue" : "Please Accept Terms"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default TermsModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: "85%",
    paddingBottom: 30,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTextWrap: { flex: 1 },
  title: { fontSize: 18, fontWeight: "800" },
  subtitle: { fontSize: 13, marginTop: 2 },
  closeCircle: {
    backgroundColor: "#F1F5F9",
    padding: 6,
    borderRadius: 20,
  },
  scroll: { paddingHorizontal: 24, marginTop: 15 },
  termItem: {
    flexDirection: "row",
    marginBottom: 24,
  },
  stepContainer: { marginRight: 15 },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  stepText: { color: "#10B981", fontWeight: "800", fontSize: 12 },
  contentWrap: { flex: 1 },
  termTitle: { fontSize: 15, fontWeight: "700", marginBottom: 6 },
  termBody: { fontSize: 14, lineHeight: 20 },
  checkboxCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 10,
    marginBottom: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkboxLabel: { fontSize: 13, color: "#475569", flex: 1, lineHeight: 18 },
  linkText: { color: "#10B981", fontWeight: "700" },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  actionButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
