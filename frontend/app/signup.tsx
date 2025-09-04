import { useState, useEffect } from "react";
import {
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Link } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Logo from "@/components/logo";
import { useCreateUserMutation } from "@/services/api";
import Toast from "react-native-toast-message";

export default function SignUpScreen() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    cnic: "",
    agencyName: "",
    agencyLicense: "",
    preferences: "",
  });

  const [role, setRole] = useState<string | null>(null);
  const [createUser, { isLoading }] = useCreateUserMutation();

  useEffect(() => {
    const loadRole = async () => {
      const storedRole = await AsyncStorage.getItem("userRole");
      setRole(storedRole);
    };
    loadRole();
  }, []);

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSignUp = async () => {
    const payload = { ...form, role };
    console.log("Submitting signup:", payload);
    try {
      const result = await createUser(payload).unwrap();
      console.log("Signup result:", result?.isPhoneVerified);
      Toast.show({
        type: "success",
        text1: "Account created!",
        text2: "Welcome to RentStore.",
      });
    } catch (err: any) {
      console.log("Signup error:", err);
      Toast.show({
        type: "error",
        text1: "Signup failed",
        text2: err?.data?.message || "Please try again.",
      });
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Logo />
        {/* <Text style={styles.title}>Create Account</Text> */}

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={form.name}
          onChangeText={(v) => handleChange("name", v)}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(v) => handleChange("email", v)}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={form.password}
          onChangeText={(v) => handleChange("password", v)}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(v) => handleChange("phone", v)}
        />

        {role === "agency" && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Agency Name"
              value={form.agencyName}
              onChangeText={(v) => handleChange("agencyName", v)}
            />
            <TextInput
              style={styles.input}
              placeholder="Agency License"
              value={form.agencyLicense}
              onChangeText={(v) => handleChange("agencyLicense", v)}
            />
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="Preferences (optional)"
          value={form.preferences}
          onChangeText={(v) => handleChange("preferences", v)}
        />
        <TextInput
          style={styles.input}
          placeholder="CNIC"
          value={form.cnic}
          onChangeText={(v) => handleChange("cnic", v)}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSignUp}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Signing Up..." : "Sign Up"}
          </Text>
        </TouchableOpacity>

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
    backgroundColor: "#4F46E5",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 18 },
  link: { marginTop: 20, alignSelf: "center" },
  linkText: { color: "#4F46E5", fontSize: 15 },
});
