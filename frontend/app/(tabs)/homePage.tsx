import HeroSection from "@/components/heroSection";
import React from "react";
import { View, StyleSheet, Text, FlatList } from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../../constants/Colors";
import ListAllProperties from "@/components/ListAllProperties";

const featuredProperties = [
  { id: "1", text: "🏠 2 Bed Apartment in Lahore" },
  { id: "2", text: "🏡 3 Marla House in Karachi" },
  { id: "3", text: "🏘️ Luxury Villa in Islamabad" },
];

const HomePage: React.FC = () => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const renderHeader = () => (
    <>
      <HeroSection />
      <View style={styles.intro}>
        <Text style={[styles.title, { color: currentTheme.primary }]}>
          Looking for Residence?
        </Text>
        <Text style={[styles.subtitle, { color: currentTheme.text }]}>
          This is the right place for you! Explore a wide variety of properties
          tailored to your needs.
        </Text>
      </View>
      <View style={styles.properties}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
          Featured Properties
        </Text>
        {featuredProperties.map((property) => (
          <View
            key={property.id}
            style={[
              styles.propertyCard,
              {
                backgroundColor: currentTheme.card,
                borderLeftColor: currentTheme.primary,
              },
            ]}
          >
            <Text style={[styles.propertyText, { color: currentTheme.text }]}>
              {property.text}
            </Text>
          </View>
        ))}
      </View>
    </>
  );

  return (
    <FlatList
      ListHeaderComponent={renderHeader}
      data={[]}
      renderItem={null}
      ListFooterComponent={<ListAllProperties />}
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    />
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
