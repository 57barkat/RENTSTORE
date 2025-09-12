import { useState } from "react";
import { View, TextInput, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Link, useRouter } from "expo-router";
import { useLoginMutation } from "@/services/api";
import { useAuth } from "@/contextStore/AuthContext";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignInScreen() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");

  const [login, { isLoading }] = useLoginMutation();
  const { login: saveToken } = useAuth();
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      const res = await login({ emailOrPhone, password }).unwrap();

      await saveToken(res.accessToken);
      if (res.name && res.email) {
      await AsyncStorage.setItem("userName", res.name);
      await AsyncStorage.setItem("userEmail", res.email);
    }
      Toast.show({
        type: "success",
        text1: "Login successful!",
        text2: `Welcome back ${res.name}.`,
      });
      router.replace("/homePage");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Login failed",
        text2: err?.data?.message || "Please try again.",
      });
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email or Phone"
        autoCapitalize="none"
        value={emailOrPhone}
        onChangeText={setEmailOrPhone}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleSignIn}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Signing In..." : "Sign In"}
        </Text>
      </TouchableOpacity>
      <Link href="/choose-role" style={styles.link}>
        <Text style={styles.linkText}>Don&apos;t have an account? Sign Up</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#4CC9F0",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 18 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  link: { marginTop: 16, alignSelf: "center" },
  linkText: { color: "#302424" },
});
