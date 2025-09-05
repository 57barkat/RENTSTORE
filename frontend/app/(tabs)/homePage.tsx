import HeroSection from "@/components/heroSection";
import React from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../../constants/Colors";

const HomePage: React.FC = () => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      <HeroSection />

      <View style={styles.intro}>
        <Text
          style={[styles.title, { color: currentTheme.primary }]}
        >
          Looking for Residence?
        </Text>
        <Text
          style={[styles.subtitle, { color: currentTheme.text }]}
        >
          This is the right place for you! Explore a wide variety of properties
          tailored to your needs.
        </Text>
      </View>

      <View style={styles.properties}>
        <Text
          style={[styles.sectionTitle, { color: currentTheme.text }]}
        >
          Featured Properties
        </Text>

        <View
          style={[
            styles.propertyCard,
            {
              backgroundColor: currentTheme.card,
              borderLeftColor: currentTheme.primary,
            },
          ]}
        >
          <Text
            style={[styles.propertyText, { color: currentTheme.text }]}
          >
            🏠 2 Bed Apartment in Lahore
          </Text>
        </View>
        <View
          style={[
            styles.propertyCard,
            {
              backgroundColor: currentTheme.card,
              borderLeftColor: currentTheme.primary,
            },
          ]}
        >
          <Text
            style={[styles.propertyText, { color: currentTheme.text }]}
          >
            🏡 3 Marla House in Karachi
          </Text>
        </View>
        <View
          style={[
            styles.propertyCard,
            {
              backgroundColor: currentTheme.card,
              borderLeftColor: currentTheme.primary,
            },
          ]}
        >
          <Text
            style={[styles.propertyText, { color: currentTheme.text }]}
          >
            🏘️ Luxury Villa in Islamabad
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  intro: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  properties: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  propertyCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  propertyText: {
    fontSize: 15,
  },
});

export default HomePage;
