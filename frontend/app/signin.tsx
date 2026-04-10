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
import { useAuth } from "@/contextStore/AuthContext";
import { useTheme } from "@/contextStore/ThemeContext";
import { useLoginMutation, useVerifyEmailMutation } from "@/services/api";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { InputField } from "@/components/InputField";
import { PrimaryButton } from "@/components/PrimaryButton";
import VerificationModal from "@/components/VerificationModal";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import ForgotPasswordModal from "@/components/ForgotPasswordModal";

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
  const [showForgotModal, setShowForgotModal] = useState(false);
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
      const response = await loginMutation({
        emailOrPhone,
        password,
      }).unwrap();

      await login(response);

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
          source={{
            uri: "https://images.pexels.com/photos/29174521/pexels-photo-29174521/free-photo-of-modern-apartment-building-with-autumn-foliage.jpeg?auto=compress&cs=tinysrgb&w=600",
          }}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIconBg}>
                <MaterialCommunityIcons
                  name="home"
                  size={20}
                  color={currentTheme.secondary}
                />
              </View>
              <Text style={styles.logoText}>AnganStay</Text>
            </View>

            <View
              style={[
                styles.formContainer,
                { backgroundColor: currentTheme.background },
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
                  backgroundColor={currentTheme.card}
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
                  backgroundColor={currentTheme.card}
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

                {/* PREMIUM FORGOT PASSWORD BUTTON PLACEMENT */}
                <TouchableOpacity
                  style={[
                    styles.forgotPasswordBtn,
                    { backgroundColor: `${currentTheme.secondary}15` }, // 15 adds 8% opacity to your theme color
                  ]}
                  onPress={() => setShowForgotModal(true)}
                  activeOpacity={0.6}
                  hitSlop={{ top: 10, bottom: 10, left: 20, right: 10 }}
                >
                  <Text
                    style={[
                      styles.forgotPasswordText,
                      { color: currentTheme.secondary },
                    ]}
                  >
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              <PrimaryButton
                title="Login"
                onPress={handleSignIn}
                loading={isLoading}
                color={currentTheme.secondary}
              />

              <TouchableOpacity
                style={styles.footerLink}
                onPress={() => router.push("/signup")}
              >
                <Text style={{ color: currentTheme.muted }}>
                  Don&apos;t have an account?{" "}
                  <Text
                    style={{
                      color: currentTheme.secondary,
                      fontWeight: "700",
                    }}
                  >
                    Sign Up
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <ForgotPasswordModal
            visible={showForgotModal}
            theme={currentTheme}
            onClose={() => setShowForgotModal(false)}
          />
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
  backgroundImage: { flex: 1, width: "100%" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 28,
    marginBottom: 25,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignSelf: "flex-start",
    padding: 8,
    borderRadius: 12,
  },
  logoIconBg: {
    backgroundColor: "#fff",
    padding: 5,
    borderRadius: 8,
    marginRight: 10,
  },
  logoText: { color: "#fff", fontSize: 20, fontWeight: "800" },
  formContainer: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: Platform.OS === "ios" ? 40 : 30,
  },
  headerSection: { marginBottom: 25 },
  title: { fontSize: 28, fontWeight: "800" },
  subtitle: { fontSize: 16, marginTop: 4 },
  inputGroup: { gap: 12, marginBottom: 20 },
  forgotPasswordBtn: {
    alignSelf: "flex-end",
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  forgotPasswordText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  footerLink: { marginTop: 20, alignItems: "center" },
});
