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
  Image,
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
import { Feather, MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";

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
            uri: "https://811a2201-3c29-49ea-80cc-de39dc1f74a8-00-3qf2yb1a4a9ut.janeway.replit.dev/__mockup/images/anganstay-bg.png",
          }}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            {/* FIGMA LOGO SECTION */}
            <View style={styles.logoContainer}>
              <View style={styles.logoIconBg}>
                <MaterialCommunityIcons name="home" size={20} color="#2563EB" />
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
  inputGroup: { gap: 12 },
  forgotPasswordBtn: { alignSelf: "flex-end", marginVertical: 12 },
  forgotPasswordText: { color: "#2563EB", fontWeight: "600" },
  orDividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },
  line: { flex: 1, height: 1 },
  orText: { marginHorizontal: 10, fontSize: 12, fontWeight: "700" },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  socialButtonText: { fontSize: 16, fontWeight: "600" },
  footerLink: { marginTop: 20, alignItems: "center" },
});
