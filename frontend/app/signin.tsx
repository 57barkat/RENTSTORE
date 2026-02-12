import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "../constants/Colors";
import AuthImage from "../assets/images/authimage.jpg";
import { useAuth } from "@/contextStore/AuthContext";
import { useTheme } from "@/contextStore/ThemeContext";
import { useLoginMutation, useVerifyEmailMutation } from "@/services/api";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { InputField } from "@/components/InputField";
import { PrimaryButton } from "@/components/PrimaryButton";
import VerificationModal from "@/components/VerificationModal";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

export default function SignInScreen() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [actualEmail, setActualEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const [loginMutation, { isLoading }] = useLoginMutation();
  const [verifyEmail] = useVerifyEmailMutation();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/homePage");
    }
  }, [isAuthenticated]);

  const handleSignIn = async () => {
    if (!emailOrPhone.trim() || !password.trim()) {
      return showErrorToast("Required", "Please enter email and password");
    }

    try {
      // 1. Get raw response from backend
      const response = await loginMutation({
        emailOrPhone,
        password,
      }).unwrap();

      // 2. Process login and tokens
      await login(response);

      // 3. Check verification status directly from flat response
      if (response.isPhoneVerified === false) {
        showErrorToast(
          "Phone Not Verified",
          "Please verify your phone number to continue.",
        );
        router.push("/Verification");
        return;
      }

      router.replace("/homePage");
    } catch (err: any) {
      const message = err?.data?.message;

      if (message === "VERIFY_EMAIL_REQUIRED") {
        setActualEmail(emailOrPhone);
        setShowEmailModal(true);
        return;
      }

      showErrorToast(
        "Login Failed",
        typeof message === "string" ? message : "Invalid credentials",
      );
    }
  };

  const handleVerifyEmail = async () => {
    if (!verificationCode.trim()) {
      return showErrorToast("Required", "Please enter verification code");
    }

    setIsVerifying(true);
    try {
      const response = await verifyEmail({
        email: actualEmail,
        code: verificationCode,
      }).unwrap();

      showSuccessToast("Email Verified", "You are now logged in.");

      setVerificationCode("");
      setShowEmailModal(false);

      // Save verified user session
      await login(response);

      router.replace("/homePage");
    } catch (error: any) {
      showErrorToast(
        "Verification Failed",
        error?.data?.message || "Invalid or expired code",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <ImageBackground
          source={AuthImage}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            <View
              style={[
                styles.formContainer,
                { backgroundColor: currentTheme.card },
              ]}
            >
              <View style={styles.headerSection}>
                <Text style={[styles.title, { color: currentTheme.text }]}>
                  Welcome Back
                </Text>
                <Text style={[styles.subtitle, { color: currentTheme.muted }]}>
                  Login to continue
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <InputField
                  icon={
                    <MaterialCommunityIcons
                      name="account-outline"
                      size={22}
                      color={currentTheme.muted}
                    />
                  }
                  placeholder="Email or Phone"
                  value={emailOrPhone}
                  onChange={setEmailOrPhone}
                  backgroundColor={currentTheme.background}
                  textColor={currentTheme.text}
                />

                <InputField
                  icon={
                    <Feather name="lock" size={20} color={currentTheme.muted} />
                  }
                  placeholder="Password"
                  value={password}
                  onChange={setPassword}
                  secureTextEntry={!showPassword}
                  backgroundColor={currentTheme.background}
                  textColor={currentTheme.text}
                  rightIcon={
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Feather
                        name={showPassword ? "eye" : "eye-off"}
                        size={18}
                        color={currentTheme.muted}
                      />
                    </TouchableOpacity>
                  }
                />
              </View>

              <PrimaryButton
                title="Login"
                onPress={handleSignIn}
                loading={isLoading}
                color={currentTheme.primary}
              />

              <TouchableOpacity
                style={styles.footerLink}
                onPress={() => router.push("/signup")}
              >
                <Text style={{ color: currentTheme.muted }}>
                  Don&apos;t have an account?{" "}
                  <Text
                    style={{
                      color: currentTheme.primary,
                      fontWeight: "700",
                    }}
                  >
                    Sign Up
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <VerificationModal
            visible={showEmailModal}
            theme={currentTheme}
            email={actualEmail}
            code={verificationCode}
            setCode={setVerificationCode}
            loading={isVerifying}
            onVerify={handleVerifyEmail}
            onCancel={() => setShowEmailModal(false)}
            color={currentTheme.primary}
          />
        </ImageBackground>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  formContainer: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 45,
    paddingBottom: Platform.OS === "ios" ? 60 : 40,
  },
  headerSection: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 16,
  },
  inputGroup: {
    gap: 16,
    marginBottom: 25,
  },
  footerLink: {
    marginTop: 25,
    alignItems: "center",
  },
});
