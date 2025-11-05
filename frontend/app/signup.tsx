import { useEffect, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  ScrollView,
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
import { Colors } from "../constants/Colors";
import { Checkbox } from "react-native-paper";
import { useTheme } from "@/contextStore/ThemeContext";
import { Feather, MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import AuthImage from "../assets/images/authimage.jpg";

// --- Social Login Button ---
const SocialButton = ({ iconName, label, onPress }: any) => (
  <TouchableOpacity style={socialStyles.button} onPress={onPress}>
    {iconName === "phone" ? (
      <Feather name="phone" size={20} color="#333" style={socialStyles.icon} />
    ) : (
      <AntDesign
        name="google"
        size={20}
        color="#333"
        style={socialStyles.icon}
      />
    )}
    <Text style={socialStyles.buttonText}>{label}</Text>
  </TouchableOpacity>
);

const socialStyles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    marginTop: 15,
  },
  icon: { marginRight: 10 },
  buttonText: { color: "#333", fontSize: 16, fontWeight: "600" },
});

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
            backgroundColor: currentTheme.background,
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Text style={[styles.welcomeTitle, { color: currentTheme.text }]}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={AuthImage}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
        >
          <View
            style={[
              styles.authContainer,
              { backgroundColor: currentTheme.card },
            ]}
          >
            {/* Header */}
            <Text style={[styles.welcomeTitle, { color: currentTheme.text }]}>
              Create a new account
            </Text>
       

            {/* Form */}
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
                  {/* Name */}
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

                  {/* Email */}
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

                  {/* Password */}
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

                  {/* Phone */}
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

                  {/* Agency fields */}
                  {role === "agency" && (
                    <>
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={[styles.input, { color: currentTheme.text }]}
                          placeholder="Agency Name"
                          placeholderTextColor="#A0AEC0"
                          value={values.agencyName}
                          onChangeText={handleChange("agencyName")}
                          onBlur={handleBlur("agencyName")}
                        />
                      </View>
                      {touched.agencyName && errors.agencyName && (
                        <Text style={styles.error}>{errors.agencyName}</Text>
                      )}

                      <View style={styles.inputContainer}>
                        <TextInput
                          style={[styles.input, { color: currentTheme.text }]}
                          placeholder="Agency License"
                          placeholderTextColor="#A0AEC0"
                          value={values.agencyLicense}
                          onChangeText={handleChange("agencyLicense")}
                          onBlur={handleBlur("agencyLicense")}
                        />
                      </View>
                      {touched.agencyLicense && errors.agencyLicense && (
                        <Text style={styles.error}>{errors.agencyLicense}</Text>
                      )}
                    </>
                  )}

                  {/* CNIC */}
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

                  {/* Terms */}
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

                  {/* Sign Up Button */}
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

                  {/* Social Buttons */}
                  {/* <SocialButton
                    iconName="phone"
                    label="Continue with phone number"
                    onPress={() => console.log("Phone")}
                  /> */}
                  <SocialButton
                    iconName="google"
                    label="Continue with Google"
                    onPress={() => console.log("Google")}
                  />
                </>
              )}
            </Formik>

            {/* Sign In Link */}
            <View style={styles.signUpRow}>
              <Text style={{ color: currentTheme.text }}>
                Already have an account?{" "}
                <Link href="/signin">
                  <Text style={{ color: "#3B82F6", fontWeight: "600" }}>
                    Sign In
                  </Text>
                </Link>
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Terms Modal */}
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
                  1. RentStore is a platform for listing and renting properties.
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
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: "100%", height: "100%" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.2)" },
  authContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 50,
    minHeight: "70%",
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A202C",
    marginBottom: 4,
    textAlign: "center",
  },
  signInInstruction: {
    fontSize: 16,
    color: "#4A5568",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 12,
    backgroundColor: "#F7FAFC",
  },
  icon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 12, fontSize: 16 },
  error: { color: "#e74c3c", fontSize: 12, marginBottom: 8, marginTop: -6 },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  termsText: { fontSize: 14, flexShrink: 1 },
  loginButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  loginButtonText: { color: "#fff", fontWeight: "700", fontSize: 18 },
  signUpRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 10,
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
  modalCloseButton: { paddingVertical: 14, alignItems: "center" },
});
