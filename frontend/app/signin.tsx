import { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import { Link } from "expo-router";
import Logo from "@/components/logo";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Add your sign-in logic here

  return (
    <View style={styles.container}>
      <Logo />
      {/* <Text style={styles.title}>Sign In</Text> */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button
        title="Sign In"
        onPress={() => {
          /* handle sign in */
        }}
      />
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  link: { marginTop: 16, alignSelf: "center" },
  linkText: { color: "#007AFF" },
});
