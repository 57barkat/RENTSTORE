import { useEffect, useState } from "react";
import {
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Link, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCreateUserMutation } from "@/services/api";
import Toast from "react-native-toast-message";
import { Formik } from "formik";
import { signupValidationSchema } from "@/utils/signupValidation";
import { useAuth } from "@/contextStore/AuthContext";

export default function SignUpScreen() {
  const [role, setRole] = useState<string | null>(null);
  const [createUser, { isLoading }] = useCreateUserMutation();
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const loadRole = async () => {
      const storedRole = await AsyncStorage.getItem("userRole");
      console.log("Loaded role from AsyncStorage:", storedRole); // 🔍 Debug log
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
  };

  const handleSignUp = async (values: typeof initialValues) => {
    const payload = { ...values, role };
    console.log("📤 Calling signup with payload:", payload); // 🔍 Debug log
    try {
      const result = await createUser(payload).unwrap();
      console.log("✅ Signup successful:", result);
      if (result.accessToken) {
        await login(result.accessToken);
      }
      router.replace("/homePage");
      Toast.show({
        type: "success",
        text1: "Account created!",
        text2: "Welcome to RentStore.",
      });
    } catch (err: any) {
      console.log("❌ Signup failed:", err); // 🔍 Debug log
      Toast.show({
        type: "error",
        text1: "Signup failed",
        text2: err?.data?.message || "Please try again.",
      });
    }
  };

  // 🚨 Wait until role is loaded to render Formik
  if (!role) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </ScrollView>
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Formik
          initialValues={initialValues}
          validationSchema={signupValidationSchema(role)}
          onSubmit={(values) => {
            console.log("🚀 Form submitted with values:", values); 
            handleSignUp(values);
          }}
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
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={values.name}
                onChangeText={handleChange("name")}
                onBlur={handleBlur("name")}
              />
              {touched.name && errors.name ? (
                <Text style={styles.error}>{errors.name}</Text>
              ) : null}

              <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={values.email}
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
              />
              {touched.email && errors.email ? (
                <Text style={styles.error}>{errors.email}</Text>
              ) : null}

              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={values.password}
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
              />
              {touched.password && errors.password ? (
                <Text style={styles.error}>{errors.password}</Text>
              ) : null}

              <TextInput
                style={styles.input}
                placeholder="Phone"
                keyboardType="phone-pad"
                value={values.phone}
                onChangeText={handleChange("phone")}
                onBlur={handleBlur("phone")}
              />
              {touched.phone && errors.phone ? (
                <Text style={styles.error}>{errors.phone}</Text>
              ) : null}

              {role === "agency" && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Agency Name"
                    value={values.agencyName}
                    onChangeText={handleChange("agencyName")}
                    onBlur={handleBlur("agencyName")}
                  />
                  {touched.agencyName && errors.agencyName ? (
                    <Text style={styles.error}>{errors.agencyName}</Text>
                  ) : null}
                  <TextInput
                    style={styles.input}
                    placeholder="Agency License"
                    value={values.agencyLicense}
                    onChangeText={handleChange("agencyLicense")}
                    onBlur={handleBlur("agencyLicense")}
                  />
                  {touched.agencyLicense && errors.agencyLicense ? (
                    <Text style={styles.error}>{errors.agencyLicense}</Text>
                  ) : null}
                </>
              )}

              <TextInput
                style={styles.input}
                placeholder="Preferences (optional)"
                value={values.preferences}
                onChangeText={handleChange("preferences")}
                onBlur={handleBlur("preferences")}
              />

              <TextInput
                style={styles.input}
                placeholder="CNIC"
                value={values.cnic}
                onChangeText={handleChange("cnic")}
                onBlur={handleBlur("cnic")}
              />
              {touched.cnic && errors.cnic ? (
                <Text style={styles.error}>{errors.cnic}</Text>
              ) : null}

              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  console.log("👆 Button pressed, submitting...");
                  handleSubmit();
                  console.log("📌 Current values:", values);
                  console.log("📌 Current errors:", errors);
                  console.log("📌 Current touched:", touched);
                }}  
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? "Signing Up..." : "Sign Up"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </Formik>
        <Link href="/signin" style={styles.link}>
          <Text style={styles.linkText}>Already have an account? Sign In</Text>
        </Link>
      </ScrollView>
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F9FAFB",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 24,
    textAlign: "center",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    backgroundColor: "#fff",
    fontSize: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  button: {
    backgroundColor: "#4CC9F0",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 18 },
  link: { marginTop: 20, alignSelf: "center" },
  linkText: { color: "#302424", fontSize: 15 },
  error: {
    color: "red",
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 4,
  },
});
