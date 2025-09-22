import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";

interface WarningPopupProps {
  visible: boolean;
  onClose: () => void;
  onVerify: () => void;
}

const WarningPopup: React.FC<WarningPopupProps> = ({
  visible,
  onClose,
  onVerify,
}) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <Text style={styles.title}>Warning!</Text>
          <Text style={styles.message}>
            Service is unavailable for unverified users. Please click below to
            verify your phone number and account.
          </Text>
          <TouchableOpacity style={styles.button} onPress={onVerify}>
            <Text style={styles.buttonText}>Verify My Phone Number</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function App() {
  const [popupVisible, setPopupVisible] = useState<boolean>(false);

  const handleVerify = () => {
    setPopupVisible(false);
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TouchableOpacity onPress={() => setPopupVisible(true)}>
        <Text>Show Warning Popup</Text>
      </TouchableOpacity>

      <WarningPopup
        visible={popupVisible}
        onClose={() => setPopupVisible(false)}
        onVerify={handleVerify}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#ff6600",
  },
  message: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#ff6600",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  closeButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  closeText: {
    color: "#555",
  },
});
