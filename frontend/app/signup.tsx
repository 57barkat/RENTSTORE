import { useEffect, useState } from "react";
import {
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  View,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  Pressable,
} from "react-native";
import { Link, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCreateUserMutation } from "@/services/api";
import Toast from "react-native-toast-message";
import { Formik } from "formik";
import { signupValidationSchema } from "@/utils/signupValidation";
import { useAuth } from "@/contextStore/AuthContext";
import { useTheme } from "@/contextStore/ThemeContext";
import GoogleLoginButton from "./SignInScreenWithOauth";
import { Colors } from "../constants/Colors";
import { Checkbox } from "react-native-paper";

export default function SignUpScreen() {
  const [role, setRole] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [createUser, { isLoading }] = useCreateUserMutation();
  const { login } = useAuth();
  const router = useRouter();

  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  useEffect(() => {
    const loadRole = async () => {
      const storedRole = await AsyncStorage.getItem("userRole");
      setRole(storedRole);
    };
    loadRole();
  }, []);

  const initialValues = {
    name: "",
    email: "",
    password: "",
    phone: "",
    cnic: "",
    agencyName: "",
    agencyLicense: "",
    preferences: "",
    acceptedTerms: true,
  };

  const handleSignUp = async (values: typeof initialValues) => {
    if (!acceptedTerms) {
      Toast.show({
        type: "error",
        text1: "Terms & Conditions",
        text2: "You must accept the Terms and Conditions to continue.",
      });
      return;
    }

    const payload = { ...values, role, hasAcceptedTerms: acceptedTerms };

    try {
      const result = await createUser(payload).unwrap();

      if (result.accessToken) {
        await login(result.accessToken);
        await AsyncStorage.setItem("userName", values.name);
        await AsyncStorage.setItem("userEmail", values.email);
        await AsyncStorage.setItem("userPhone", values.phone);
      }

      router.replace("/homePage");
      Toast.show({
        type: "success",
        text1: "Account created!",
        text2: `Welcome to RentStore, ${values.name}.`,
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Signup failed",
        text2: err?.data?.message || "Please try again.",
      });
    }
  };

  if (!role) {
    return (
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: currentTheme.background },
        ]}
      >
        <Text style={[styles.title, { color: currentTheme.text }]}>
          Loading...
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: currentTheme.background },
      ]}
    >
      <View
        style={[styles.formContainer, { backgroundColor: currentTheme.card }]}
      >
        <Text style={[styles.title, { color: currentTheme.text }]}>
          Create a new account
        </Text>
        <Text style={[styles.subtitle, { color: currentTheme.muted }]}>
          Please fill out the form below
        </Text>

        <Formik
          initialValues={initialValues}
          validationSchema={signupValidationSchema(role)}
          onSubmit={handleSignUp}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <>
              {/* Full Name */}
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: currentTheme.border,
                    color: currentTheme.text,
                  },
                ]}
                placeholder="Full Name"
                placeholderTextColor={currentTheme.muted}
                value={values.name}
                onChangeText={handleChange("name")}
                onBlur={handleBlur("name")}
              />
              {touched.name && errors.name && (
                <Text style={styles.error}>{errors.name}</Text>
              )}

              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: currentTheme.border,
                    color: currentTheme.text,
                  },
                ]}
                placeholder="Email"
                placeholderTextColor={currentTheme.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={values.email}
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
              />
              {touched.email && errors.email && (
                <Text style={styles.error}>{errors.email}</Text>
              )}
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: currentTheme.border,
                    color: currentTheme.text,
                  },
                ]}
                placeholder="Password"
                placeholderTextColor={currentTheme.muted}
                secureTextEntry
                value={values.password}
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
              />
              {touched.password && errors.password && (
                <Text style={styles.error}>{errors.password}</Text>
              )}

              {/* Phone */}
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: currentTheme.border,
                    color: currentTheme.text,
                  },
                ]}
                placeholder="Phone"
                placeholderTextColor={currentTheme.muted}
                keyboardType="phone-pad"
                value={values.phone}
                onChangeText={handleChange("phone")}
                onBlur={handleBlur("phone")}
              />
              {touched.phone && errors.phone && (
                <Text style={styles.error}>{errors.phone}</Text>
              )}

              {/* Agency fields */}
              {role === "agency" && (
                <>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        borderColor: currentTheme.border,
                        color: currentTheme.text,
                      },
                    ]}
                    placeholder="Agency Name"
                    placeholderTextColor={currentTheme.muted}
                    value={values.agencyName}
                    onChangeText={handleChange("agencyName")}
                    onBlur={handleBlur("agencyName")}
                  />
                  {touched.agencyName && errors.agencyName && (
                    <Text style={styles.error}>{errors.agencyName}</Text>
                  )}
                  <TextInput
                    style={[
                      styles.input,
                      {
                        borderColor: currentTheme.border,
                        color: currentTheme.text,
                      },
                    ]}
                    placeholder="Agency License"
                    placeholderTextColor={currentTheme.muted}
                    value={values.agencyLicense}
                    onChangeText={handleChange("agencyLicense")}
                    onBlur={handleBlur("agencyLicense")}
                  />
                  {touched.agencyLicense && errors.agencyLicense && (
                    <Text style={styles.error}>{errors.agencyLicense}</Text>
                  )}
                </>
              )}

              {/* Preferences */}
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: currentTheme.border,
                    color: currentTheme.text,
                  },
                ]}
                placeholder="Preferences (optional)"
                placeholderTextColor={currentTheme.muted}
                value={values.preferences}
                onChangeText={handleChange("preferences")}
                onBlur={handleBlur("preferences")}
              />

              {/* CNIC */}
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: currentTheme.border,
                    color: currentTheme.text,
                  },
                ]}
                placeholder="CNIC"
                placeholderTextColor={currentTheme.muted}
                value={values.cnic}
                onChangeText={handleChange("cnic")}
                onBlur={handleBlur("cnic")}
              />
              {touched.cnic && errors.cnic && (
                <Text style={styles.error}>{errors.cnic}</Text>
              )}

              {/* Terms & Conditions */}
              <TouchableOpacity
                style={styles.termsContainer}
                onPress={() => setShowTermsModal(true)}
              >
                <Checkbox
                  status={acceptedTerms ? "checked" : "unchecked"}
                  onPress={() => setAcceptedTerms(!acceptedTerms)}
                  color={currentTheme.primary}
                />
                <Text style={[styles.termsText, { color: currentTheme.text }]}>
                  I accept the{" "}
                  <Text
                    style={{
                      color: currentTheme.primary,
                      textDecorationLine: "underline",
                    }}
                    onPress={() => setShowTermsModal(true)}
                  >
                    Terms and Conditions
                  </Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: isLoading
                      ? currentTheme.muted
                      : currentTheme.primary,
                  },
                ]}
                onPress={() => handleSubmit()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Sign Up</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </Formik>

        <Link href="/signin" asChild>
          <TouchableOpacity style={styles.linkContainer}>
            <Text style={[styles.linkText, { color: currentTheme.text }]}>
              Already have an account?{" "}
              <Text style={[styles.linkBold, { color: currentTheme.primary }]}>
                Sign In
              </Text>
            </Text>
          </TouchableOpacity>
        </Link>

        <GoogleLoginButton />
      </View>

      {/* Terms & Conditions Modal */}
      <Modal visible={showTermsModal} animationType="slide" transparent={true}>
        <SafeAreaView style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: currentTheme.card },
            ]}
          >
            <ScrollView style={{ padding: 16 }}>
              <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
                RentStore Terms and Conditions
              </Text>
              <Text style={{ color: currentTheme.text, marginTop: 16 }}>
                {/* Put your full T&C content here */}
                1. RentStore is a platform that allows users to list and rent
                properties.{"\n\n"}
                2. Users and customers are independent contractors to each
                other.{"\n\n"}
                3. RentStore is not responsible for any disputes, scams, or
                damages between users.{"\n\n"}
                4. Users must accept these Terms and Conditions to create an
                account.{"\n\n"}
                5. Other rules and obligations applicable under Pakistan law for
                rental agreements.
              </Text>
            </ScrollView>

            <Pressable
              style={[
                styles.modalCloseButton,
                { backgroundColor: currentTheme.primary },
              ]}
              onPress={() => setShowTermsModal(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

      <Toast />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  formContainer: {
    width: "100%",
    maxWidth: 450,
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  error: {
    color: "#e74c3c",
    fontSize: 12,
    marginBottom: 10,
    marginTop: -10,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  termsText: {
    fontSize: 14,
    flexShrink: 1,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
  linkContainer: {
    marginTop: 20,
    alignSelf: "center",
  },
  linkText: {
    fontSize: 14,
  },
  linkBold: {
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    margin: 24,
    borderRadius: 16,
    maxHeight: "80%",
    overflow: "hidden",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  modalCloseButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
});
