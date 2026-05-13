import React from "react";
import { SafeAreaView, ScrollView, Text, StyleSheet } from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../constants/Colors";

const sections = [
  {
    title: "1. Information We Collect",
    body: "We collect account and profile information such as your name, email address, phone number, password, role, and verification status. Hosts may also provide identity or business information such as CNIC details, agency name, agency license information, listing descriptions, pricing, amenities, and uploaded property photos.",
  },
  {
    title: "2. Location Information",
    body: "If you allow it, the app collects foreground location information to show nearby properties, help place listings on the map, and improve address selection. This can include approximate or precise coordinates and address details derived from those coordinates.",
  },
  {
    title: "3. Audio, Photos, and User Content",
    body: "If you use voice search, the app records and uploads audio clips to process your request. If you upload profile images or property photos, those files and related listing content are processed and stored through our service providers.",
  },
  {
    title: "4. How We Use Information",
    body: "We use collected information to create and secure accounts, verify contact details, publish and manage listings, support messaging and favorites, improve search and map features, and respond to support, disputes, or abuse reports.",
  },
  {
    title: "5. Sharing and Service Providers",
    body: "We may share information with service providers that support hosting, media storage, maps and address lookup, and realtime features. Examples visible in the app code include Cloudinary for image uploads, Google Places for address search, Mapbox for maps, and backend services that power authentication, listings, reports, and chat.",
  },
  {
    title: "6. Local Device Storage",
    body: "The app stores certain information on your device, including session tokens, account state, phone-verification state, saved theme preference, upload queue state, and view-tracking markers. Where supported, sensitive session tokens are stored using SecureStore.",
  },
  {
    title: "7. Security",
    body: "Passwords are stored using secure hashing. Sensitive data is protected using appropriate technical and organizational safeguards. No system can guarantee absolute security, so you should keep your device secure and avoid sharing your login credentials.",
  },
  {
    title: "8. Your Choices",
    body: "You can choose whether to grant optional permissions such as location, microphone, and media-library access. To request account or data deletion, contact us at contact@anganstay.com from your registered email.",
  },
  {
    title: "9. Cookies, Ads, and Retention",
    body: "We currently do not use third-party tracking cookies. If this changes, we will update this policy. We may display promoted listings or advertising in the future. If we do, we will update this policy and explain what data is used. We retain account and listing data while your account is active. Deleted listings may be retained temporarily for security, fraud prevention, dispute handling, or legal compliance.",
  },
  {
    title: "10. Children's Privacy",
    body: "The app is not intended for children under 13, and we do not knowingly seek to collect their personal information.",
  },
  {
    title: "11. Contact Us",
    body: "For privacy questions or requests, contact contact@anganstay.com.",
  },
];

const PrivacyPolicyScreen = () => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.heading, { color: currentTheme.text }]}>
          AnganStay Privacy Policy
        </Text>
        <Text style={[styles.date, { color: currentTheme.muted }]}>
          Effective Date: May 13, 2026
        </Text>

        {sections.map((section) => (
          <React.Fragment key={section.title}>
            <Text style={[styles.sectionHeading, { color: currentTheme.text }]}>
              {section.title}
            </Text>
            <Text style={[styles.paragraph, { color: currentTheme.text }]}>
              {section.body}
            </Text>
          </React.Fragment>
        ))}
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
