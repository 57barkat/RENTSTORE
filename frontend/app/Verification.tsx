import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../constants/Colors";
import { useSendOtpMutation, useVerifyOtpMutation } from "@/services/api";
import { useAuth } from "@/contextStore/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function Verification() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const currentTheme = Colors[isDark ? "dark" : "light"];
  const { setVerified } = useAuth();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneSent, setPhoneSent] = useState(false);
  const [verified, setVerifiedState] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const [sendOtp, { isLoading: sending }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: verifying }] = useVerifyOtpMutation();

  useEffect(() => {
    const loadUserPhone = async () => {
      const storedPhone = await AsyncStorage.getItem("userPhone");
      if (storedPhone) setPhone(storedPhone);
    };
    loadUserPhone();
  }, []);

  const handleSendOtp = async () => {
    if (!phone)
      return showErrorToast("Phone Required", "Please enter your phone number");
    try {
      const res = await sendOtp({ phone }).unwrap();
      showSuccessToast(
        "OTP Sent",
        res.message || "OTP has been sent to your phone",
      );
      setPhoneSent(true);
    } catch (err: any) {
      showErrorToast(
        "Send OTP Failed",
        err?.data?.message || "Unable to send OTP",
      );
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return showErrorToast("OTP Required", "Please enter OTP");
    try {
      const res = await verifyOtp({ phone, otp }).unwrap();
      if (res.success) {
        await setVerified(true);
        setVerifiedState(true);
        showSuccessToast(
          "Phone Verified",
          "Your phone number is verified successfully",
        );
      }
    } catch (err: any) {
      showErrorToast(
        "Verification Failed",
        err?.data?.message || "OTP verification failed",
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.header}>
        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: currentTheme.card }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="close"
            size={24}
            color={currentTheme.text}
          />
        </TouchableOpacity>
      </SafeAreaView>

      <View style={styles.content}>
        {!verified ? (
          <>
            <View style={styles.headerSection}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: currentTheme.primary + "15" },
                ]}
              >
                <MaterialCommunityIcons
                  name={phoneSent ? "shield-check-outline" : "cellphone-lock"}
                  size={40}
                  color={currentTheme.primary}
                />
              </View>
              <Text style={[styles.title, { color: currentTheme.text }]}>
                {phoneSent ? "Enter Verification Code" : "Verify Phone Number"}
              </Text>
              <Text style={[styles.subtitle, { color: currentTheme.muted }]}>
                {phoneSent
                  ? `We've sent a 6-digit code to ${phone}`
                  : "We need to verify your number to ensure your account security."}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: currentTheme.text }]}>
                {phoneSent ? "One-Time Password" : "Phone Number"}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: isFocused
                      ? currentTheme.primary
                      : currentTheme.border,
                    backgroundColor: currentTheme.card,
                    color: currentTheme.text,
                  },
                ]}
                keyboardType={phoneSent ? "number-pad" : "phone-pad"}
                value={phoneSent ? otp : phone}
                onChangeText={phoneSent ? setOtp : setPhone}
                editable={phoneSent ? !verifying : !sending}
                placeholder={phoneSent ? "000000" : "e.g. +1 234 567 890"}
                placeholderTextColor={currentTheme.muted}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                maxLength={phoneSent ? 6 : 15}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: currentTheme.primary },
                (sending || verifying) && { opacity: 0.7 },
              ]}
              onPress={phoneSent ? handleVerifyOtp : handleSendOtp}
              disabled={sending || verifying}
              activeOpacity={0.8}
            >
              {sending || verifying ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {phoneSent ? "Confirm & Verify" : "Get Verification Code"}
                </Text>
              )}
            </TouchableOpacity>

            {phoneSent && (
              <TouchableOpacity
                style={styles.resendButton}
                onPress={() => setPhoneSent(false)}
              >
                <Text style={{ color: currentTheme.muted }}>
                  Wrong number?{" "}
                  <Text
                    style={{ color: currentTheme.primary, fontWeight: "700" }}
                  >
                    Edit
                  </Text>
                </Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.successWrapper}>
            <MaterialCommunityIcons
              name="check-circle"
              size={80}
              color={currentTheme.success}
            />
            <Text style={[styles.successTitle, { color: currentTheme.text }]}>
              Verified!
            </Text>
            <Text
              style={[styles.successSubtitle, { color: currentTheme.muted }]}
            >
              Your phone number has been successfully linked to your account.
            </Text>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                {
                  backgroundColor: currentTheme.primary,
                  marginTop: 30,
                  width: "100%",
                },
              ]}
              onPress={() => router.back()}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 20,
    marginTop: Platform.OS === "android" ? 40 : 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: "center" },
  headerSection: { alignItems: "center", marginBottom: 40 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  inputGroup: { marginBottom: 24 },
  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  resendButton: { marginTop: 20, alignItems: "center" },
  successWrapper: { alignItems: "center", padding: 20 },
  successTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 20,
    marginBottom: 10,
  },
  successSubtitle: { fontSize: 16, textAlign: "center", color: "#666" },
});
