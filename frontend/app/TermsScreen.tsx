import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contextStore/ThemeContext";

const sections = [
  {
    title: "Platform role",
    body: "AnganStay is a property listing and discovery platform. AnganStay is not a landlord, tenant, broker, real estate agency, escrow provider, legal advisor, payment processor, or property owner unless explicitly stated in writing.",
  },
  {
    title: "User responsibility",
    body: "Users must independently verify property ownership, condition, rent, documents, location, owner or agent identity, and availability before making any decision or payment.",
  },
  {
    title: "Listing rules",
    body: "Listing owners are responsible for listing accuracy, legality, availability, photos, rent, contact details, and authorization to advertise the property. Fake, misleading, illegal, duplicate, abusive, offensive, stolen-image, or spam listings may be removed.",
  },
  {
    title: "Payments and safety",
    body: "Payments, deposits, token money, rent, commissions, inspection fees, and rental agreements are handled directly between users unless AnganStay explicitly states otherwise. Do not send money or sensitive documents before verification.",
  },
  {
    title: "Reports and verification",
    body: "Users can report listings, users, suspicious activity, and disputes. Verification badges mean limited platform checks only and do not guarantee ownership, title, condition, availability, user character, or transaction safety.",
  },
  {
    title: "Governing law",
    body: "These Terms are governed by the laws of Pakistan. For questions, contact contact@anganstay.com.",
  },
];

export default function TermsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: currentTheme.background }]}>
      <View style={[styles.header, { borderBottomColor: currentTheme.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: currentTheme.card }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="chevron-left" size={22} color={currentTheme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>
          Terms & Conditions
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: currentTheme.text }]}>
          AnganStay Terms & Conditions
        </Text>
        <Text style={[styles.updated, { color: currentTheme.muted }]}>
          Version 2026-05-13
        </Text>

        {sections.map((section) => (
          <View
            key={section.title}
            style={[
              styles.card,
              { backgroundColor: currentTheme.card, borderColor: currentTheme.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              {section.title}
            </Text>
            <Text style={[styles.body, { color: currentTheme.muted }]}>
              {section.body}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    minHeight: 64,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  content: { padding: 22, paddingBottom: 36 },
  title: { fontSize: 26, fontWeight: "700", lineHeight: 32 },
  updated: { marginTop: 8, fontSize: 13 },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginTop: 14,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600" },
  body: { marginTop: 8, fontSize: 14, lineHeight: 22 },
});
