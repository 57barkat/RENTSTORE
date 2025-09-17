import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../constants/Colors";
import { useSendOtpMutation, useVerifyOtpMutation } from "@/services/api";
import { useAuth } from "@/contextStore/AuthContext";

export default function Verification() {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneSent, setPhoneSent] = useState(false);
  const [verified, setVerifiedState] = useState(false);

  const { setVerified } = useAuth();

  const [sendOtp, { isLoading: sending }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: verifying }] = useVerifyOtpMutation();

  const handleSendOtp = async () => {
    if (!phone) return;
    try {
      const res = await sendOtp({ phone }).unwrap();
      console.log("Send OTP response:", res);
      setPhoneSent(true);
    } catch (err: any) {
      console.error("Send OTP failed:", err.data || err);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return;
    try {
      const res = await verifyOtp({ phone, otp }).unwrap();
      console.log("Verify OTP response:", res);
      if (res.success) {
        await setVerified(true);  
        setVerifiedState(true);   
      }
    } catch (err: any) {
      console.error("Verify OTP failed:", err.data || err);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {!verified && (
        <>
          <Text style={[styles.label, { color: currentTheme.text }]}>Phone Number</Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: currentTheme.border, color: currentTheme.text, backgroundColor: currentTheme.card },
            ]}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            editable={!phoneSent}
            placeholder="Enter phone number"
            placeholderTextColor={currentTheme.muted}
          />
          {!phoneSent && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: currentTheme.primary }]}
              onPress={handleSendOtp}
              disabled={sending}
            >
              <Text style={styles.buttonText}>{sending ? "Sending..." : "Send OTP"}</Text>
            </TouchableOpacity>
          )}

          {phoneSent && (
            <>
              <Text style={[styles.label, { color: currentTheme.text, marginTop: 20 }]}>Enter OTP</Text>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: currentTheme.border, color: currentTheme.text, backgroundColor: currentTheme.card },
                ]}
                keyboardType="number-pad"
                value={otp}
                onChangeText={setOtp}
                placeholder="Enter OTP"
                placeholderTextColor={currentTheme.muted}
              />
              {otp.length > 0 && (
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: currentTheme.success }]}
                  onPress={handleVerifyOtp}
                  disabled={verifying}
                >
                  <Text style={styles.buttonText}>{verifying ? "Verifying..." : "Submit OTP"}</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </>
      )}

      {verified && (
        <View style={styles.verifiedContainer}>
          <Text style={[styles.verifiedText, { color: currentTheme.success }]}>
            ✅ Your phone is verified!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  button: {
    marginTop: 15,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  verifiedContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  verifiedText: {
    fontSize: 18,
    fontWeight: "600",
  },
});
