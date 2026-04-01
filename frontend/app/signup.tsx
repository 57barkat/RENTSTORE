import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import { Colors } from "../constants/Colors";
import { useTheme } from "@/contextStore/ThemeContext";
import { useCreateUserMutation, useVerifyEmailMutation } from "@/services/api";
import { signupValidationSchema } from "@/utils/signupValidation";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { createUserPayload } from "@/utils/apiPayload";
import { Loader } from "@/components/Loader";
import { InputField } from "@/components/InputField";
import { AgencyFields } from "@/components/AgencyFields";
import { TermsCheckbox } from "@/components/TermsCheckbox";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import TermsModal from "@/components/TermsModal";
import VerificationModal from "@/components/VerificationModal";

// ✅ Updated Constants based on your structure
const ROLES = {
  AGENCY: "agency",
  USER: "user",
  AGENT: "agent",
};

export default function SignUpScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  // ✅ State handles which specific role is selected
  const [role, setRole] = useState<string>(ROLES.USER);

  console.log("Signup Screen - Selected Role:", role);

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [signupEmail, setSignupEmail] = useState("");

  const [createUser, { isLoading: creating }] = useCreateUserMutation();
  const [verifyEmail, { isLoading: verifying }] = useVerifyEmailMutation();

  const toggleRole = (newRole: string) => {
    setRole(newRole);
  };

  const initialValues = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    cnic: "",
    agencyName: "",
    agencyLicense: "",
  };

  const handleSignup = async (values: typeof initialValues) => {
    if (!acceptedTerms) {
      return showErrorToast("Required", "Please accept Terms and Conditions");
    }

    try {
      const payload = createUserPayload(values, role, acceptedTerms);
      await createUser(payload).unwrap();

      setSignupEmail(values.email);
      setShowVerifyModal(true);
      showSuccessToast("Verification Sent", "Check your email");
    } catch (error: any) {
      showErrorToast("Signup Failed", error?.data?.message || "Error");
    }
  };

  const handleVerifyEmail = async () => {
    try {
      await verifyEmail({
        email: signupEmail,
        code: verificationCode,
      }).unwrap();

      showSuccessToast("Verified", "You can now login");
      setShowVerifyModal(false);
      router.replace("/signin");
    } catch (error: any) {
      showErrorToast("Error", error?.data?.message || "Invalid code");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <MaterialCommunityIcons
                name="home-variant"
                size={28}
                color="#0EA5E9"
              />
              <Text style={[styles.logoText, { color: currentTheme.text }]}>
                AnganStay
              </Text>
            </View>

            <Text style={[styles.title, { color: currentTheme.text }]}>
              Create Account
            </Text>
            <Text style={[styles.subtitle, { color: currentTheme.muted }]}>
              {role === ROLES.AGENCY
                ? "Register your organization professionally"
                : `Join as a ${role === ROLES.AGENT ? "professional agent" : "standard user"}`}
            </Text>
          </View>

          {/* ROLE SELECTOR - Switching between User, Agent, and Agency */}
          <View
            style={[
              styles.roleSelector,
              { backgroundColor: currentTheme.card },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.roleBtn,
                role === ROLES.USER && styles.activeRoleBtn,
              ]}
              onPress={() => toggleRole(ROLES.USER)}
            >
              <Text
                style={[
                  styles.roleBtnText,
                  {
                    color:
                      role === ROLES.USER
                        ? currentTheme.secondary
                        : currentTheme.muted,
                  },
                ]}
              >
                User
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleBtn,
                role === ROLES.AGENT && styles.activeRoleBtn,
              ]}
              onPress={() => toggleRole(ROLES.AGENT)}
            >
              <Text
                style={[
                  styles.roleBtnText,
                  {
                    color:
                      role === ROLES.AGENT
                        ? currentTheme.secondary
                        : currentTheme.muted,
                  },
                ]}
              >
                Agent
              </Text>
            </TouchableOpacity>

            {/* <TouchableOpacity
              style={[
                styles.roleBtn,
                role === ROLES.AGENCY && styles.activeRoleBtn,
              ]}
              onPress={() => toggleRole(ROLES.AGENCY)}
            >
              <Text
                style={[
                  styles.roleBtnText,
                  {
                    color:
                      role === ROLES.AGENCY
                        ? currentTheme.secondary
                        : currentTheme.muted,
                  },
                ]}
              >
                Agency
              </Text>
            </TouchableOpacity> */}
          </View>

          {/* DYNAMIC LIMITS CARD */}
          {/* <View
            style={[
              styles.infoCard,
              {
                backgroundColor: role === ROLES.AGENCY ? "#f1fdf00" : "#EFF6FF",
              },
            ]}
          >
            <Feather
              name={
                role === ROLES.USER
                  ? "user"
                  : role === ROLES.AGENT
                    ? "award"
                    : "briefcase"
              }
              size={18}
              color={role === ROLES.AGENCY ? "#10B981" : "#10B981"}
            />
            <View>
              {/* <Text
                style={[
                  styles.infoTitle,
                  { color: role === ROLES.AGENCY ? "#166534" : "#1E40AF" },
                ]}
              >
                {role === ROLES.USER
                  ? "2 Uploads Allowed"
                  : role === ROLES.AGENT
                    ? "5 Uploads Allowed"
                    : "Unlimited Uploads"}
              </Text> */}
          {/* <Text style={styles.infoSub}>
                {role === ROLES.USER
                  ? "Standard personal use"
                  : role === ROLES.AGENT
                    ? "Professional Individual"
                    : "Full Business Suite"}
              </Text> */}
          {/* </View> */}
          {/* </View>  */}

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
              <View style={styles.form}>
                {/* 1. Show Agency-Specific fields only for Agency role */}
                {role === ROLES.AGENCY && (
                  <AgencyFields
                    role={role}
                    values={values}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    errors={errors}
                    touched={touched}
                    textColor={currentTheme.text}
                    backgroundColor={currentTheme.card}
                  />
                )}

                {/* 2. Common fields for everyone */}
                <InputField
                  icon={
                    <Feather name="user" size={20} color={currentTheme.muted} />
                  }
                  placeholder={
                    role === ROLES.AGENCY ? "Company Owner Name" : "Full Name"
                  }
                  value={values.name}
                  onChange={handleChange("name")}
                  onBlur={() => handleBlur("name")}
                  error={touched.name && errors.name}
                  backgroundColor={currentTheme.card}
                />

                <InputField
                  icon={
                    <Feather name="mail" size={20} color={currentTheme.muted} />
                  }
                  placeholder="Email Address"
                  value={values.email}
                  onChange={handleChange("email")}
                  onBlur={() => handleBlur("email")}
                  error={touched.email && errors.email}
                  backgroundColor={currentTheme.card}
                />

                <InputField
                  icon={
                    <Feather
                      name="phone"
                      size={20}
                      color={currentTheme.muted}
                    />
                  }
                  placeholder="Phone Number"
                  value={values.phone}
                  onChange={handleChange("phone")}
                  onBlur={() => handleBlur("phone")}
                  error={touched.phone && errors.phone}
                  backgroundColor={currentTheme.card}
                  keyboardType="phone-pad"
                />

                <InputField
                  icon={
                    <MaterialCommunityIcons
                      name="card-account-details-outline"
                      size={20}
                      color={currentTheme.muted}
                    />
                  }
                  placeholder="CNIC Number"
                  value={values.cnic}
                  onChange={handleChange("cnic")}
                  onBlur={() => handleBlur("cnic")}
                  error={touched.cnic && errors.cnic}
                  backgroundColor={currentTheme.card}
                />

                <InputField
                  icon={
                    <Feather name="lock" size={20} color={currentTheme.muted} />
                  }
                  placeholder="Password"
                  value={values.password}
                  onChange={handleChange("password")}
                  onBlur={() => handleBlur("password")}
                  error={touched.password && errors.password}
                  backgroundColor={currentTheme.card}
                  secureTextEntry
                />

                <View style={styles.agreementWrapper}>
                  <View style={styles.dividerRow}>
                    <View
                      style={[
                        styles.line,
                        { backgroundColor: currentTheme.border },
                      ]}
                    />
                    <Text
                      style={[
                        styles.dividerText,
                        { color: currentTheme.muted },
                      ]}
                    >
                      AGREEMENT
                    </Text>
                    <View
                      style={[
                        styles.line,
                        { backgroundColor: currentTheme.border },
                      ]}
                    />
                  </View>

                  <TermsCheckbox
                    acceptedTerms={acceptedTerms}
                    setAcceptedTerms={setAcceptedTerms}
                    onPressTerms={() => setShowTermsModal(true)}
                    textColor={currentTheme.muted}
                    color={currentTheme.secondary}
                  />
                </View>

                <PrimaryButton
                  title="Sign Up"
                  onPress={handleSubmit}
                  loading={creating}
                  color={currentTheme.secondary}
                />

                <TouchableOpacity
                  style={styles.footerLink}
                  onPress={() => router.push("/signin")}
                >
                  <Text style={{ color: currentTheme.muted }}>
                    Already have an account?{" "}
                    <Text
                      style={{
                        color: currentTheme.secondary,
                        fontWeight: "700",
                      }}
                    >
                      Login
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </ScrollView>

        <VerificationModal
          visible={showVerifyModal}
          theme={currentTheme}
          email={signupEmail}
          code={verificationCode}
          setCode={setVerificationCode}
          loading={verifying}
          onVerify={handleVerifyEmail}
          onCancel={() => setShowVerifyModal(false)}
          color={currentTheme.secondary}
        />

        <TermsModal
          visible={showTermsModal}
          theme={currentTheme}
          onClose={() => setShowTermsModal(false)}
          color={currentTheme.secondary}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  header: { marginBottom: 25, marginTop: 10 },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 15,
  },
  logoText: { fontSize: 22, fontWeight: "800" },
  title: { fontSize: 28, fontWeight: "800" },
  subtitle: { fontSize: 14, marginTop: 5, lineHeight: 20 },
  roleSelector: {
    flexDirection: "row",
    padding: 6,
    borderRadius: 14,
    marginVertical: 20,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  activeRoleBtn: { backgroundColor: "#fff", elevation: 2, shadowOpacity: 0.1 },
  roleBtnText: { fontWeight: "600", fontSize: 14 },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 16,
    gap: 12,
    marginBottom: 20,
  },
  infoTitle: { fontWeight: "700", fontSize: 14 },
  infoSub: { fontSize: 12, marginTop: 2, color: "#64748b" },
  form: { gap: 12 },
  agreementWrapper: { marginTop: 10 },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  line: { flex: 1, height: 1 },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  footerLink: { marginTop: 25, alignItems: "center" },
});
