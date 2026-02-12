import React from "react";
import {
  Modal,
  SafeAreaView,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

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
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <SafeAreaView style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <ScrollView style={styles.scroll}>
            <Text style={[styles.title, { color: theme.text }]}>
              Terms and Conditions
            </Text>
            <Text style={[styles.body, { color: theme.text }]}>
              1. RentStore is a property platform.{"\n\n"}
              2. Users are independent contractors.{"\n\n"}
              3. We are not responsible for disputes.{"\n\n"}
              4. Acceptance is required for account creation.
            </Text>
          </ScrollView>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: color }]}
            onPress={onClose}
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default TermsModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: { borderRadius: 24, overflow: "hidden" },
  scroll: { padding: 16 },
  title: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  body: { marginTop: 16, fontSize: 14, lineHeight: 22 },
  closeButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    margin: 20,
  },
  closeText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
