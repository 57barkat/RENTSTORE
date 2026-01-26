import React from "react";
import {
  Modal,
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

interface VerificationModalProps {
  visible: boolean;
  theme: any;
  email: string;
  code: string;
  setCode: (text: string) => void;
  loading: boolean;
  onVerify: () => void;
  onCancel: () => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({
  visible,
  theme,
  email,
  code,
  setCode,
  loading,
  onVerify,
  onCancel,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <SafeAreaView style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <Text style={[styles.title, { color: theme.text }]}>
            Verify Your Email
          </Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            Enter the verification code sent to {email}
          </Text>
          <TextInput
            style={[
              styles.input,
              { color: theme.text, backgroundColor: theme.background },
            ]}
            placeholder="6-digit code"
            placeholderTextColor="#A0AEC0"
            keyboardType="numeric"
            value={code}
            onChangeText={setCode}
          />
          <TouchableOpacity
            style={[styles.button, { opacity: loading ? 0.7 : 1 }]}
            onPress={onVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify</Text>
            )}
          </TouchableOpacity>
          <Pressable onPress={onCancel} style={styles.cancel}>
            <Text style={{ color: "#3B82F6", textAlign: "center" }}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default VerificationModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: { borderRadius: 24, padding: 25 },
  title: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  subtitle: { marginVertical: 20, textAlign: "center", fontSize: 14 },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E0",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
  },
  button: {
    backgroundColor: "#2B6CB0",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontWeight: "800", fontSize: 18 },
  cancel: { marginTop: 15 },
});
