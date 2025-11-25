import { useEffect, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useLoginMutation } from "@/services/api";
import { useAuth } from "@/contextStore/AuthContext";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import AuthImage from "../assets/images/authimage.jpg";

// --- Social Login Button ---
// Assuming SocialButton props are defined externally, using `any` here.
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
    // Modern touch with subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  icon: { marginRight: 10 },
  buttonText: { color: "#333", fontSize: 16, fontWeight: "600" },
});

export default function SignInScreen() {
  // Added explicit string typing for state variables
  const [emailOrPhone, setEmailOrPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [login, { isLoading }] = useLoginMutation();
  const { login: saveToken, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Navigate to homepage if token exists
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
      // API call to log in
      const res = await login({ emailOrPhone, password }).unwrap();

      // Save tokens and phone verification status
      await saveToken(res.accessToken, res.refreshToken, res.isPhoneVerified);

      // Save user details to AsyncStorage
      if (res.name && res.email) {
        await AsyncStorage.setItem("userName", res.name);
        await AsyncStorage.setItem("userEmail", res.email);
        await AsyncStorage.setItem("userPhone", res.phone);
        await AsyncStorage.setItem(
          "isVerified",
          JSON.stringify(res.isPhoneVerified)
        );
      }

      // Show success toast
      Toast.show({
        type: "success",
        text1: "Login successful!",
        text2: `Welcome back ${res.name}.`,
      });

      // Navigate to the home page
      router.replace("/homePage");
    } catch (err: any) {
      // Show error toast on failure
      Toast.show({
        type: "error",
        text1: "Login failed",
        text2: err?.data?.message || "Please try again.",
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      // Use 'padding' for iOS and 'height' for Android to handle keyboard
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      // Adjusted vertical offset for better placement on iOS
      keyboardVerticalOffset={Platform.OS === "ios" ? -60 : 0}
    >
      {/* ScrollView allows content to be pushed up and scrolled when the keyboard is open */}
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled" // Allows interaction outside of TextInput
      >
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

              {/* Email Input Field */}
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
                  placeholder="Email or Phone Number"
                  placeholderTextColor="#A0AEC0"
                  autoCapitalize="none"
                  value={emailOrPhone}
                  onChangeText={setEmailOrPhone}
                  keyboardType="email-address"
                />
              </View>

              {/* Password Input Field */}
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

              {/* Login Button */}
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

              {/* Sign Up Link */}
              <View style={styles.signUpRow}>
                <Text style={styles.linkTextBase}>
                  Don&apos;t have an account?
                </Text>
                {/* Note: Ensure Link is correctly imported from expo-router */}
                <Link href="/choose-role">
                  <Text style={styles.linkTextHighlight}> Sign up</Text>
                </Link>
              </View>

              {/* Social Buttons (Commented out in original) */}
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
    backgroundColor: "rgba(0,0,0,0.4)", // Darkened overlay for better contrast
    justifyContent: "flex-end", // Anchors the auth container to the bottom
  },
  scrollViewContent: {
    flexGrow: 1, // Ensures ScrollView takes full height
    // Removed justifyContent: "center" here, as 'overlay' handles vertical positioning
  },
  authContainer: {
    // Responsive card design anchored at the bottom
    backgroundColor: "#fff",
    borderTopLeftRadius: 32, // Increased radius for a softer look
    borderTopRightRadius: 32,
    paddingHorizontal: 25, // Slightly reduced horizontal padding
    paddingTop: 40, // Increased top padding
    paddingBottom: Platform.OS === "ios" ? 50 : 30, // Platform-specific bottom padding
    // minHeight: "65%", // Set a smaller minimum height to be more flexible
    width: "100%",
    // Enhanced Shadow for a lifted card effect (Modern Aesthetic)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  welcomeTitle: {
    fontSize: 30, // Slightly larger title
    fontWeight: "800", // Bolder
    color: "#1A202C",
    marginBottom: 4,
  },
  signInInstruction: {
    fontSize: 15,
    color: "#718096", // Softer instruction text
    marginBottom: 30, // Increased spacing after instruction
  },
  inputLabel: {
    fontSize: 14,
    color: "#4A5568",
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E0", // Lighter, more subtle border
    borderRadius: 16, // Larger radius for a modern pill shape
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: "#FFFFFF", // Ensure clear background
    height: 55, // Fixed height for consistency
    // Subtle inner shadow effect
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 0.5,
  },
  icon: { marginRight: 12 }, // More space for icon
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1A202C",
  },
  loginButton: {
    backgroundColor: "#2B6CB0", // A bolder blue
    paddingVertical: 16, // More vertical padding
    borderRadius: 16,
    alignItems: "center",
    marginTop: 30, // More margin above button
    marginBottom: 10,
    // Stronger button shadow
    shadowColor: "#2B6CB0",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "800", // Extra bold text
    fontSize: 18,
  },
  signUpRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 15,
  },
  linkTextBase: { fontSize: 15, color: "#4A5568" },
  linkTextHighlight: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2B6CB0",
  },
});
