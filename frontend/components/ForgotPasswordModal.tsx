import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { InputField } from "./InputField";
import { PrimaryButton } from "./PrimaryButton";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import {
  useForgotPasswordMutation,
  useVerifyResetCodeMutation,
  useResetPasswordMutation,
} from "@/services/api";

interface ForgotPasswordModalProps {
  visible: boolean;
  onClose: () => void;
  theme: any;
}

export default function ForgotPasswordModal({
  visible,
  onClose,
  theme,
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [requestForgot, { isLoading: isRequesting }] =
    useForgotPasswordMutation();
  const [verifyCode, { isLoading: isVerifying }] = useVerifyResetCodeMutation();
  const [resetPass, { isLoading: isResetting }] = useResetPasswordMutation();

  const handleSendCode = async () => {
    try {
      await requestForgot({ email }).unwrap();
      showSuccessToast("Code Sent", "Please check your email.");
      setStep(2);
    } catch (err: any) {
      showErrorToast("Error", err?.data?.message || "Failed to send code");
    }
  };

  const handleVerifyCode = async () => {
    try {
      await verifyCode({ email, code }).unwrap();
      showSuccessToast("Verified", "Enter your new password.");
      setStep(3);
    } catch (err: any) {
      showErrorToast("Error", err?.data?.message || "Invalid code");
    }
  };

  const handleResetPassword = async () => {
    try {
      await resetPass({ email, newPassword }).unwrap();
      showSuccessToast("Success", "Password changed successfully!");
      handleClose();
    } catch (err: any) {
      showErrorToast("Error", err?.data?.message || "Reset failed");
    }
  };

  const handleClose = () => {
    setStep(1);
    setEmail("");
    setCode("");
    setNewPassword("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, { backgroundColor: theme.background }]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              {step === 1
                ? "Forgot Password"
                : step === 2
                  ? "Verify Code"
                  : "New Password"}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Feather name="x" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          {step === 1 && (
            <View style={styles.body}>
              <Text style={[styles.desc, { color: theme.muted }]}>
                Enter your email to receive a 6-digit reset code.
              </Text>
              <InputField
                placeholder="Email Address"
                value={email}
                onChange={setEmail}
                backgroundColor={theme.card}
                textColor={theme.text}
                icon={
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={20}
                    color={theme.muted}
                  />
                }
              />
              <PrimaryButton
                title="Send Code"
                onPress={handleSendCode}
                loading={isRequesting}
                color={theme.secondary}
              />
            </View>
          )}

          {step === 2 && (
            <View style={styles.body}>
              <Text style={[styles.desc, { color: theme.muted }]}>
                Code sent to {email}
              </Text>
              <InputField
                placeholder="6-Digit Code"
                value={code}
                onChange={setCode}
                backgroundColor={theme.card}
                textColor={theme.text}
                icon={
                  <MaterialCommunityIcons
                    name="numeric"
                    size={20}
                    color={theme.muted}
                  />
                }
              />
              <PrimaryButton
                title="Verify Code"
                onPress={handleVerifyCode}
                loading={isVerifying}
                color={theme.secondary}
              />
            </View>
          )}

          {step === 3 && (
            <View style={styles.body}>
              <Text style={[styles.desc, { color: theme.muted }]}>
                Create a strong new password.
              </Text>
              <InputField
                placeholder="New Password"
                value={newPassword}
                onChange={setNewPassword}
                secureTextEntry={!showPassword}
                backgroundColor={theme.card}
                textColor={theme.text}
                icon={<Feather name="lock" size={20} color={theme.muted} />}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Feather
                      name={showPassword ? "eye" : "eye-off"}
                      size={18}
                      color={theme.muted}
                    />
                  </TouchableOpacity>
                }
              />
              <PrimaryButton
                title="Reset Password"
                onPress={handleResetPassword}
                loading={isResetting}
                color={theme.secondary}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: { borderRadius: 24, padding: 24 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: "800" },
  body: { gap: 15 },
  desc: { fontSize: 14, marginBottom: 5 },
});
