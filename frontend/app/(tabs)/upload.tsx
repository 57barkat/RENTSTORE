import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../../constants/Colors";
import { useCreatePropertyMutation } from "@/services/api";
import PropertyForm from "@/components/PropertyForm";
import Toast from "react-native-toast-message";

export default function Upload() {
  const [formData, setFormData] = useState<any>({
    propertyType: "",
    title: "",
    description: "",
    address: "",
    city: "",
    bedrooms: "",
    bathrooms: "",
    kitchens: "",
    livingRooms: "",
    balconies: "",
    furnished: false,
    floor: "",
    area: "",
    rentPrice: "",
    securityDeposit: "",
    maintenanceCharges: "",
    utilitiesIncluded: false,
    ownerName: "",
    phone: "",
    email: "",
    images: [],
    videos: [],
    amenities: [],
    preferences: "",
    petsAllowed: false,
    latitude: null,
    longitude: null,
  });

  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const [createProperty, { isLoading }] = useCreatePropertyMutation();

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      await createProperty(formData).unwrap();
      Toast.show({ type: "success", text1: "Property uploaded successfully!" });
      setFormData({
        propertyType: "",
        title: "",
        description: "",
        address: "",
        city: "",
        bedrooms: "",
        bathrooms: "",
        kitchens: "",
        livingRooms: "",
        balconies: "",
        furnished: false,
        floor: "",
        area: "",
        rentPrice: "",
        securityDeposit: "",
        maintenanceCharges: "",
        utilitiesIncluded: false,
        ownerName: "",
        phone: "",
        email: "",
        images: [],
        videos: [],
        amenities: [],
        preferences: "",
        petsAllowed: false,
        latitude: null,
        longitude: null,
      });
    } catch {
      Toast.show({ type: "error", text1: "Failed to upload property" });
    }
  };
 
  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: currentTheme.background },
      ]}
    >
      <Text style={[styles.header, { color: currentTheme.primary }]}>
        Upload Property
      </Text>

      <PropertyForm formData={formData} onChange={handleChange} />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: currentTheme.primary }]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Submit Property</Text>
        )}
      </TouchableOpacity>

      <Toast />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 20,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
