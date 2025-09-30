import React from "react";
import { SafeAreaView, ScrollView, Text, StyleSheet } from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../constants/Colors";

const PrivacyPolicyScreen = () => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.heading, { color: currentTheme.text }]}>
          RentStore Privacy Policy
        </Text>
        <Text style={[styles.date, { color: currentTheme.muted }]}>
          Effective Date: September 17, 2025
        </Text>

        <Text style={[styles.sectionHeading, { color: currentTheme.text }]}>
          1. Information We Collect
        </Text>
        <Text style={[styles.paragraph, { color: currentTheme.text }]}>
          We may collect personal information such as name, email, phone number,
          account credentials, property details uploaded by users, location
          data, and app usage information.
        </Text>

        <Text style={[styles.sectionHeading, { color: currentTheme.text }]}>
          2. How We Use Your Information
        </Text>
        <Text style={[styles.paragraph, { color: currentTheme.text }]}>
          Your information is used to provide and maintain our services,
          facilitate property listings and rentals, communicate updates, improve
          app features, and comply with legal obligations.
        </Text>

        <Text style={[styles.sectionHeading, { color: currentTheme.text }]}>
          3. How We Share Your Information
        </Text>
        <Text style={[styles.paragraph, { color: currentTheme.text }]}>
          We do not sell or rent your information. We may share information with
          service providers, as required by law, or in business transfers like
          mergers.
        </Text>

        <Text style={[styles.sectionHeading, { color: currentTheme.text }]}>
          4. Data Security
        </Text>
        <Text style={[styles.paragraph, { color: currentTheme.text }]}>
          We implement reasonable technical and organizational measures to
          protect your information. However, no method is completely secure.
        </Text>

        <Text style={[styles.sectionHeading, { color: currentTheme.text }]}>
          5. Your Rights
        </Text>
        <Text style={[styles.paragraph, { color: currentTheme.text }]}>
          You may have rights to access, update, or delete your personal data,
          and to object or restrict certain processing. Contact us at
          barkat.khattak@codeshop.biz to exercise these rights.
        </Text>

        <Text style={[styles.sectionHeading, { color: currentTheme.text }]}>
          6. Cookies and Tracking
        </Text>
        <Text style={[styles.paragraph, { color: currentTheme.text }]}>
          We may use cookies and tracking technologies to enhance your
          experience. Disabling them may affect app functionality.
        </Text>

        <Text style={[styles.sectionHeading, { color: currentTheme.text }]}>
          7. Third-Party Links
        </Text>
        <Text style={[styles.paragraph, { color: currentTheme.text }]}>
          The app may contain links to third-party services. We are not
          responsible for their privacy practices.
        </Text>

        <Text style={[styles.sectionHeading, { color: currentTheme.text }]}>
          8. Children’s Privacy
        </Text>
        <Text style={[styles.paragraph, { color: currentTheme.text }]}>
          RentStore is not intended for children under 13 years old. We do not
          knowingly collect data from children.
        </Text>

        <Text style={[styles.sectionHeading, { color: currentTheme.text }]}>
          9. Changes to This Privacy Policy
        </Text>
        <Text style={[styles.paragraph, { color: currentTheme.text }]}>
          We may update this Privacy Policy. Updates will be posted here with
          the new effective date.
        </Text>

        <Text style={[styles.sectionHeading, { color: currentTheme.text }]}>
          10. Contact Us
        </Text>
        <Text style={[styles.paragraph, { color: currentTheme.text }]}>
          Email: barkat.khattak@codeshop.biz{"\n"}
          App Name: RentStore
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 5,
    textAlign: "center",
  },
  date: {
    fontSize: 14,
    marginBottom: 30,
    textAlign: "center",
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
});
