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
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCreateUserMutation } from "@/services/api";
import Toast from "react-native-toast-message";
import { Formik } from "formik";
import { signupValidationSchema } from "@/utils/signupValidation";
import { useAuth } from "@/contextStore/AuthContext";
import { Colors } from "../constants/Colors";
import { Checkbox } from "react-native-paper";
import { useTheme } from "@/contextStore/ThemeContext";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AuthImage from "../assets/images/authimage.jpg";

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
        await login(result.accessToken ?? result.token, result.refreshToken);
        await AsyncStorage.setItem("userName", values.name);
        await AsyncStorage.setItem("userEmail", values.email);
        await AsyncStorage.setItem("userPhone", values.phone);
      }

      Toast.show({
        type: "success",
        text1: "Account created!",
        text2: `Welcome to RentStore, ${values.name}.`,
      });

      router.replace("/homePage");
    } catch (err: any) {
      console.log("Signup Error:", err);
      Toast.show({
        type: "error",
        text1: "Signup failed",
        text2: err?.data?.message || "Please try again.",
      });
    }
  };

  if (!role) {
    return (
      <View
        style={[
          {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: currentTheme.background,
          },
        ]}
      >
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          // Removed justifyContent: "center" here for better flow when keyboard is open
          // padding: 20,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <ImageBackground
          source={AuthImage}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            <View
              style={[
                styles.authContainer,
                { backgroundColor: currentTheme.card },
              ]}
            >
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={[styles.welcomeTitle, { color: currentTheme.text }]}
                >
                  Create a new account
                </Text>
                <Text
                  style={[
                    styles.signInInstruction,
                    { color: currentTheme.muted },
                  ]}
                >
                  Fill in the details to get started
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
                      <View style={styles.inputContainer}>
                        <MaterialCommunityIcons
                          name="account-outline"
                          size={20}
                          color="#A0AEC0"
                          style={styles.icon}
                        />
                        <TextInput
                          style={[styles.input, { color: currentTheme.text }]}
                          placeholder="Full Name"
                          placeholderTextColor="#A0AEC0"
                          value={values.name}
                          onChangeText={handleChange("name")}
                          onBlur={handleBlur("name")}
                        />
                      </View>
                      {touched.name && errors.name && (
                        <Text style={styles.error}>{errors.name}</Text>
                      )}

                      <View style={styles.inputContainer}>
                        <MaterialCommunityIcons
                          name="email-outline"
                          size={20}
                          color="#A0AEC0"
                          style={styles.icon}
                        />
                        <TextInput
                          style={[styles.input, { color: currentTheme.text }]}
                          placeholder="Email"
                          placeholderTextColor="#A0AEC0"
                          value={values.email}
                          onChangeText={handleChange("email")}
                          onBlur={handleBlur("email")}
                          autoCapitalize="none"
                          keyboardType="email-address"
                        />
                      </View>
                      {touched.email && errors.email && (
                        <Text style={styles.error}>{errors.email}</Text>
                      )}

                      <View style={styles.inputContainer}>
                        <Feather
                          name="lock"
                          size={20}
                          color="#A0AEC0"
                          style={styles.icon}
                        />
                        <TextInput
                          style={[styles.input, { color: currentTheme.text }]}
                          placeholder="Password"
                          placeholderTextColor="#A0AEC0"
                          secureTextEntry
                          value={values.password}
                          onChangeText={handleChange("password")}
                          onBlur={handleBlur("password")}
                        />
                      </View>
                      {touched.password && errors.password && (
                        <Text style={styles.error}>{errors.password}</Text>
                      )}

                      <View style={styles.inputContainer}>
                        <Feather
                          name="phone"
                          size={20}
                          color="#A0AEC0"
                          style={styles.icon}
                        />
                        <TextInput
                          style={[styles.input, { color: currentTheme.text }]}
                          placeholder="Phone"
                          placeholderTextColor="#A0AEC0"
                          keyboardType="phone-pad"
                          value={values.phone}
                          onChangeText={handleChange("phone")}
                          onBlur={handleBlur("phone")}
                        />
                      </View>
                      {touched.phone && errors.phone && (
                        <Text style={styles.error}>{errors.phone}</Text>
                      )}

                      {role === "agency" && (
                        <>
                          <View style={styles.inputContainer}>
                            <TextInput
                              style={[
                                styles.input,
                                { color: currentTheme.text },
                              ]}
                              placeholder="Agency Name"
                              placeholderTextColor="#A0AEC0"
                              value={values.agencyName}
                              onChangeText={handleChange("agencyName")}
                              onBlur={handleBlur("agencyName")}
                            />
                          </View>
                          {touched.agencyName && errors.agencyName && (
                            <Text style={styles.error}>
                              {errors.agencyName}
                            </Text>
                          )}

                          <View style={styles.inputContainer}>
                            <TextInput
                              style={[
                                styles.input,
                                { color: currentTheme.text },
                              ]}
                              placeholder="Agency License"
                              placeholderTextColor="#A0AEC0"
                              value={values.agencyLicense}
                              onChangeText={handleChange("agencyLicense")}
                              onBlur={handleBlur("agencyLicense")}
                            />
                          </View>
                          {touched.agencyLicense && errors.agencyLicense && (
                            <Text style={styles.error}>
                              {errors.agencyLicense}
                            </Text>
                          )}
                        </>
                      )}

                      {/* <View style={styles.inputContainer}>
                        <TextInput
                          style={[styles.input, { color: currentTheme.text }]}
                          placeholder="Preferences (optional)"
                          placeholderTextColor="#A0AEC0"
                          value={values.preferences}
                          onChangeText={handleChange("preferences")}
                          onBlur={handleBlur("preferences")}
                        />
                      </View> */}

                      <View style={styles.inputContainer}>
                        <TextInput
                          style={[styles.input, { color: currentTheme.text }]}
                          placeholder="CNIC"
                          placeholderTextColor="#A0AEC0"
                          value={values.cnic}
                          onChangeText={handleChange("cnic")}
                          onBlur={handleBlur("cnic")}
                        />
                      </View>
                      {touched.cnic && errors.cnic && (
                        <Text style={styles.error}>{errors.cnic}</Text>
                      )}

                      <TouchableOpacity
                        style={styles.termsContainer}
                        onPress={() => setShowTermsModal(true)}
                      >
                        <Checkbox
                          status={acceptedTerms ? "checked" : "unchecked"}
                          onPress={() => setAcceptedTerms(!acceptedTerms)}
                          color="#3B82F6"
                        />
                        <Text style={styles.termsText}>
                          I accept the{" "}
                          <Text
                            style={{
                              color: "#3B82F6",
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
                          styles.loginButton,
                          { opacity: isLoading ? 0.7 : 1 },
                        ]}
                        onPress={() => handleSubmit()}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={styles.loginButtonText}>Sign Up</Text>
                        )}
                      </TouchableOpacity>
                    </>
                  )}
                </Formik>

                <Link href="/signin" asChild>
                  <TouchableOpacity style={styles.signUpRow}>
                    <Text style={{ color: currentTheme.text }}>
                      Already have an account?{" "}
                      <Text style={{ color: "#3B82F6", fontWeight: "600" }}>
                        Sign In
                      </Text>
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>

          <Modal visible={showTermsModal} animationType="slide" transparent>
            <SafeAreaView style={styles.modalContainer}>
              <View
                style={[
                  styles.modalContent,
                  { backgroundColor: currentTheme.card },
                ]}
              >
                <ScrollView style={{ padding: 16 }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "700",
                      textAlign: "center",
                      marginBottom: 12,
                      color: currentTheme.text,
                    }}
                  >
                    Terms and Conditions
                  </Text>
                  <Text style={{ color: currentTheme.text, marginTop: 16 }}>
                    1. RentStore is a platform for listing and renting
                    properties.
                    {"\n\n"}
                    2. Users are independent contractors.{"\n\n"}
                    3. RentStore is not responsible for disputes.{"\n\n"}
                    4. Accepting Terms is required to create an account.{"\n\n"}
                  </Text>
                </ScrollView>
                <Pressable
                  style={[
                    styles.modalCloseButton,
                    { backgroundColor: "#3B82F6" },
                  ]}
                  onPress={() => setShowTermsModal(false)}
                >
                  <Text style={styles.loginButtonText}>Close</Text>
                </Pressable>
              </View>
            </SafeAreaView>
          </Modal>
          <Toast />
        </ImageBackground>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  authContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 25,
    paddingTop: 40,
    paddingBottom: Platform.OS === "ios" ? 50 : 30,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  welcomeTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1A202C",
    marginBottom: 4,
    textAlign: "left",
  },
  signInInstruction: {
    fontSize: 15,
    color: "#718096",
    marginBottom: 30,
    textAlign: "left",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E0",
    borderRadius: 16,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    height: 55,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 0.5,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1A202C",
  },
  loginButton: {
    backgroundColor: "#2B6CB0",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 10,
    shadowColor: "#2B6CB0",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 18,
  },
  signUpRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 15,
  },
  error: {
    color: "red",
    marginBottom: 8,
    marginLeft: 5,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  termsText: {
    fontSize: 14,
    flex: 1,
    color: "#4A5568",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    paddingBottom: 20,
  },
  modalCloseButton: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
});
