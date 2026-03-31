import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    (async () => {
      const storedRole = await getStoredRole();
      setRole(storedRole || "user");
    })();
  }, []);

  const toggleRole = async (newRole: string) => {
    setRole(newRole);
  };

  if (!role) {
    return <Loader visible backgroundColor={currentTheme.background} />;
  }

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
      await createUser(createUserPayload(values, role, acceptedTerms)).unwrap();
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
          {/* FIGMA HEADER SECTION */}
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
              {role === "user"
                ? "Join thousands of happy renters and agencies"
                : "Register your agency and start listing properties"}
            </Text>
          </View>

          {/* ROLE SELECTOR (Renter / Agency) */}
          <View
            style={[
              styles.roleSelector,
              { backgroundColor: currentTheme.card },
            ]}
          >
            <TouchableOpacity
              style={[styles.roleBtn, role === "user" && styles.activeRoleBtn]}
              onPress={() => toggleRole("user")}
            >
              <Feather
                name="user"
                size={18}
                color={role === "user" ? currentTheme.text : currentTheme.muted}
              />
              <Text
                style={[
                  styles.roleBtnText,
                  {
                    color:
                      role === "user" ? currentTheme.text : currentTheme.muted,
                  },
                ]}
              >
                Renter
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleBtn,
                role === "agency" && styles.activeRoleBtn,
              ]}
              onPress={() => toggleRole("agency")}
            >
              <MaterialCommunityIcons
                name="office-building"
                size={18}
                color={
                  role === "agency" ? currentTheme.text : currentTheme.muted
                }
              />
              <Text
                style={[
                  styles.roleBtnText,
                  {
                    color:
                      role === "agency"
                        ? currentTheme.text
                        : currentTheme.muted,
                  },
                ]}
              >
                Agency
              </Text>
            </TouchableOpacity>
          </View>

          {/* INFO CARD BASED ON ROLE */}
          <View
            style={[
              styles.infoCard,
              { backgroundColor: role === "user" ? "#EFF6FF" : "#F0FDF4" },
            ]}
          >
            <View
              style={[
                styles.infoIcon,
                { backgroundColor: role === "user" ? "#DBEAFE" : "#DCFCE7" },
              ]}
            >
              <Feather
                name={role === "user" ? "user-check" : "briefcase"}
                size={16}
                color={"#10B981"}
              />
            </View>
            <View>
              <Text style={[styles.infoTitle, { color: "#166534" }]}>
                {role === "user"
                  ? "List up to 1 property"
                  : "Unlimited property listings"}
              </Text>
              <Text style={[styles.infoSub, { color: "#22C55E" }]}>
                {role === "user"
                  ? "Full browsing & rental access included"
                  : "Full agency dashboard after verification"}
              </Text>
            </View>
          </View>

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
                {role === "agency" && (
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

                {role === "user" && (
                  <InputField
                    icon={
                      <Feather
                        name="user"
                        size={20}
                        color={currentTheme.muted}
                      />
                    }
                    placeholder="Full Name"
                    value={values.name}
                    onChange={handleChange("name")}
                    onBlur={() => handleBlur("name")}
                    error={touched.name && errors.name}
                    backgroundColor={currentTheme.card}
                  />
                )}

                <InputField
                  icon={
                    <Feather name="mail" size={20} color={currentTheme.muted} />
                  }
                  placeholder={role === "agency" ? "Business Email" : "Email"}
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
                  placeholder={role === "agency" ? "Owner CNIC" : "CNIC"}
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

                {/* FIGMA AGREEMENT SECTION */}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  activeRoleBtn: {
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  roleBtnText: { fontWeight: "600", fontSize: 14 },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 16,
    gap: 12,
    marginBottom: 20,
  },
  infoIcon: { padding: 8, borderRadius: 10 },
  infoTitle: { fontWeight: "700", fontSize: 14 },
  infoSub: { fontSize: 12, marginTop: 2 },
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
