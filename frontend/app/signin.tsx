import { useEffect, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useLoginMutation } from "@/services/api";
import { useAuth } from "@/contextStore/AuthContext";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
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

export default function SignInScreen() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");

  const [login, { isLoading }] = useLoginMutation();
  const { login: saveToken, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (token) router.replace("/homePage");
  }, [token]);

  const handleSignIn = async () => {
    if (!emailOrPhone || !password) {
      Toast.show({
        type: "error",
        text1: "Missing Credentials",
        text2: "Enter email/phone and password.",
      });
      return;
    }

    try {
      const res = await login({ emailOrPhone, password }).unwrap();
      await saveToken(res.accessToken, res.isPhoneVerified);

      if (res.name && res.email) {
        await AsyncStorage.setItem("userName", res.name);
        await AsyncStorage.setItem("userEmail", res.email);
        await AsyncStorage.setItem("userPhone", res.phone);
        await AsyncStorage.setItem(
          "isVerified",
          JSON.stringify(res.isPhoneVerified)
        );
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
    <ImageBackground
      source={AuthImage}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.authContainer}>
          <Text style={styles.welcomeTitle}>Welcome back</Text>
          <Text style={styles.signInInstruction}>
            Sign in to continue using app
          </Text>

          <Text style={styles.inputLabel}>Email</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color="#A0AEC0"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#A0AEC0"
              autoCapitalize="none"
              value={emailOrPhone}
              onChangeText={setEmailOrPhone}
            />
          </View>

          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputContainer}>
            <Feather
              name="lock"
              size={20}
              color="#A0AEC0"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#A0AEC0"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signUpRow}>
            <Text style={styles.linkTextBase}>Don&apos;t have an account?</Text>
            <Link href="/choose-role">
              <Text style={styles.linkTextHighlight}> Sign up</Text>
            </Link>
          </View>

          {/* <SocialButton
            iconName="phone"
            label="Continue with phone number"
            onPress={() => console.log("Phone")}
          />
          <SocialButton
            iconName="google"
            label="Continue with Google"
            onPress={() => console.log("Google")}
          /> */}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-end",
  },
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
  },
  signInInstruction: { fontSize: 16, color: "#4A5568", marginBottom: 20 },
  inputLabel: {
    fontSize: 14,
    color: "#4A5568",
    marginBottom: 8,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: "#F7FAFC",
  },
  icon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 12, fontSize: 16, color: "#1A202C" },
  loginButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  loginButtonText: { color: "#fff", fontWeight: "700", fontSize: 18 },
  signUpRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 15,
  },
  linkTextBase: { fontSize: 15, color: "#4A5568" },
  linkTextHighlight: { fontSize: 15, fontWeight: "600", color: "#3B82F6" },
});
