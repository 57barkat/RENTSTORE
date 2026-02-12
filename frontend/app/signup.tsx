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
import { Formik } from "formik";
import { Colors } from "../constants/Colors";
import AuthImage from "../assets/images/authimage.jpg";
import { useTheme } from "@/contextStore/ThemeContext";
import { useCreateUserMutation, useVerifyEmailMutation } from "@/services/api";
import { signupValidationSchema } from "@/utils/signupValidation";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { getStoredRole } from "@/utils/storage";
import { createUserPayload } from "@/utils/apiPayload";
import { Loader } from "@/components/Loader";
import { InputField } from "@/components/InputField";
import { AgencyFields } from "@/components/AgencyFields";
import { TermsCheckbox } from "@/components/TermsCheckbox";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import TermsModal from "@/components/TermsModal";
import VerificationModal from "@/components/VerificationModal";

export default function SignUpScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const [role, setRole] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [signupEmail, setSignupEmail] = useState("");

  const [createUser, { isLoading: creating }] = useCreateUserMutation();
  const [verifyEmail, { isLoading: verifying }] = useVerifyEmailMutation();

  // Load role from storage
  useEffect(() => {
    (async () => {
      const storedRole = await getStoredRole();
      setRole(storedRole || "user");
    })();
  }, []);

  if (!role) {
    return <Loader visible backgroundColor={currentTheme.background} />;
  }

  const initialValues = {
    name: "",
    email: "",
    password: "",
    phone: "",
    cnic: "",
    agencyName: "",
    agencyLicense: "",
    preferences: "",
  };

  // Handle user signup
  const handleSignup = async (values: typeof initialValues) => {
    if (!acceptedTerms) {
      return showErrorToast("Required", "Please accept Terms and Conditions");
    }

    try {
      await createUser(createUserPayload(values, role, acceptedTerms)).unwrap();

      setSignupEmail(values.email);
      setShowVerifyModal(true);

      showSuccessToast(
        "Verification Sent",
        "Check your email for verification code",
      );
    } catch (error: any) {
      showErrorToast(
        "Signup Failed",
        error?.data?.message || "Something went wrong",
      );
    }
  };

  // Handle email verification
  const handleVerifyEmail = async () => {
    if (!verificationCode.trim()) {
      return showErrorToast("Required", "Enter verification code");
    }

    try {
      await verifyEmail({
        email: signupEmail,
        code: verificationCode,
      }).unwrap();

      showSuccessToast("Email Verified", "You can now login");

      setShowVerifyModal(false);
      router.replace("/signin");
    } catch (error: any) {
      showErrorToast(
        "Verification Failed",
        error?.data?.message || "Invalid or expired code",
      );
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
        <ImageBackground source={AuthImage} style={styles.backgroundImage}>
          <View style={styles.overlay}>
            <View
              style={[
                styles.formContainer,
                { backgroundColor: currentTheme.card },
              ]}
            >
              <Text style={[styles.title, { color: currentTheme.text }]}>
                Create Account
              </Text>

              <Formik
                initialValues={initialValues}
                validationSchema={signupValidationSchema(role)}
                onSubmit={handleSignup}
              >
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  values,
                  errors,
                  touched,
                }) => (
                  <View style={styles.inputGroup}>
                    <InputField
                      icon={
                        <MaterialCommunityIcons
                          name="account-outline"
                          size={22}
                          color={currentTheme.muted}
                        />
                      }
                      placeholder="Full Name"
                      value={values.name}
                      onChange={handleChange("name")}
                      onBlur={() => handleBlur("name")}
                      error={touched.name && errors.name}
                      backgroundColor={currentTheme.background}
                      textColor={currentTheme.text}
                    />

                    <InputField
                      icon={
                        <MaterialCommunityIcons
                          name="email-outline"
                          size={22}
                          color={currentTheme.muted}
                        />
                      }
                      placeholder="Email"
                      value={values.email}
                      onChange={handleChange("email")}
                      onBlur={() => handleBlur("email")}
                      error={touched.email && errors.email}
                      backgroundColor={currentTheme.background}
                      textColor={currentTheme.text}
                    />

                    <InputField
                      icon={
                        <Feather
                          name="lock"
                          size={20}
                          color={currentTheme.muted}
                        />
                      }
                      placeholder="Password"
                      value={values.password}
                      onChange={handleChange("password")}
                      onBlur={() => handleBlur("password")}
                      error={touched.password && errors.password}
                      backgroundColor={currentTheme.background}
                      textColor={currentTheme.text}
                      secureTextEntry
                    />

                    <InputField
                      icon={
                        <Feather
                          name="phone"
                          size={20}
                          color={currentTheme.muted}
                        />
                      }
                      placeholder="Phone"
                      value={values.phone}
                      keyboardType="phone-pad"
                      onChange={handleChange("phone")}
                      onBlur={() => handleBlur("phone")}
                      error={touched.phone && errors.phone}
                      backgroundColor={currentTheme.background}
                      textColor={currentTheme.text}
                    />

                    <AgencyFields
                      role={role}
                      values={values}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                      errors={errors}
                      touched={touched}
                      textColor={currentTheme.text}
                      backgroundColor={currentTheme.background}
                    />

                    <InputField
                      icon={
                        <MaterialCommunityIcons
                          name="card-account-details-outline"
                          size={20}
                          color={currentTheme.muted}
                        />
                      }
                      placeholder="CNIC"
                      value={values.cnic}
                      onChange={handleChange("cnic")}
                      onBlur={() => handleBlur("cnic")}
                      error={touched.cnic && errors.cnic}
                      backgroundColor={currentTheme.background}
                      textColor={currentTheme.text}
                    />

                    <TermsCheckbox
                      acceptedTerms={acceptedTerms}
                      setAcceptedTerms={setAcceptedTerms}
                      onPressTerms={() => setShowTermsModal(true)}
                      textColor={currentTheme.text}
                      color={currentTheme.primary}
                    />

                    <PrimaryButton
                      title="Sign Up"
                      onPress={handleSubmit}
                      loading={creating}
                      color={currentTheme.primary}
                    />

                    <TouchableOpacity
                      style={styles.footerLink}
                      onPress={() => router.push("/signin")}
                    >
                      <Text style={{ color: currentTheme.muted }}>
                        Already have an account?{" "}
                        <Text style={{ color: currentTheme.primary }}>
                          Login
                        </Text>
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Formik>
            </View>
          </View>

          <TermsModal
            visible={showTermsModal}
            theme={currentTheme}
            onClose={() => setShowTermsModal(false)}
            color={currentTheme.primary}
          />

          <VerificationModal
            visible={showVerifyModal}
            theme={currentTheme}
            email={signupEmail}
            code={verificationCode}
            setCode={setVerificationCode}
            loading={verifying}
            onVerify={handleVerifyEmail}
            onCancel={() => setShowVerifyModal(false)}
            color={currentTheme.primary}
          />
        </ImageBackground>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  formContainer: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 28,
  },
  title: { fontSize: 32, fontWeight: "800", marginBottom: 20 },
  inputGroup: { gap: 12 },
  footerLink: { marginTop: 20, alignItems: "center" },
});
