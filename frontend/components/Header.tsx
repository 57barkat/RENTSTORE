import React from "react";
import { View, StyleSheet, Platform, StatusBar, Text } from "react-native";
import Logo from "./logo";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../constants/Colors";
import { useRouter } from "expo-router";
import { useAuth } from "@/contextStore/AuthContext";

export default function Header() {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const headerBg = theme === "light" ? "#4CC9F0" : currentTheme.primary;

  const { isVerified , hasToken} = useAuth();
  const router = useRouter();

  return (
    <>
      <View style={[styles.container, { backgroundColor: headerBg }]}>
        <Logo />
      </View>
      {!isVerified && hasToken && (
        <View style={styles.cautionBanner}>
          <Text style={styles.cautionText}>
            ⚠️ Your phone number is not verified. Your account may be deleted
            soon, and some services may be unavailable.
          </Text>
          <Text
            style={[
              styles.cautionText,
              { textDecorationLine: "underline", marginTop: 5 },
            ]}
            onPress={() => router.push("/Verification")}
          >
            Click here to verify
          </Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 44,
    paddingBottom: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cautionBanner: {
    backgroundColor: "#FFF3CD",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#FFEEBA",
    alignItems: "center",
  },
  cautionText: {
    color: "#856404",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});
