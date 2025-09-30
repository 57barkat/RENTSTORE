import { useLocalSearchParams, router } from "expo-router";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  useFindPropertyByIdQuery,
  useFindPropertyByIdAndUpdateMutation,
} from "@/services/api";
import { Colors } from "@/constants/Colors";
import { useState, useEffect } from "react";
import LocationPicker from "@/utils/LocationPicker";
import { useTheme } from "@/contextStore/ThemeContext";

export const options = {
  headerShown: false,
};

// --- Reusable Section Component ---
const FormSection = ({ title, children, theme }: any) => (
  <View style={[styles.section, { backgroundColor: theme.card }]}>
    <Text style={[styles.sectionTitle, { color: theme.secondary }]}>
      {title}
    </Text>
    {children}
  </View>
);

export default function EditProperty() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const currentTheme = Colors[theme];

  const {
    data: property,
    isLoading,
    error,
  } = useFindPropertyByIdQuery(id!, {
    skip: !id,
  });

  const [updateProperty, { isLoading: isUpdating }] =
    useFindPropertyByIdAndUpdateMutation();

  const [form, setForm] = useState({
    title: "",
    rentPrice: "",
    description: "",
    city: "",
    address: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    if (property) {
      setForm({
        title: property.title ?? "",
        rentPrice: property.rentPrice?.toString() ?? "",
        description: property.description ?? "",
        city: property.city ?? "",
        address: property.address ?? "",
        latitude: property.latitude?.toString() ?? "",
        longitude: property.longitude?.toString() ?? "",
      });
    }
  }, [property]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      await updateProperty({ id: id!, data: form }).unwrap();
      Alert.alert("Updated!", "Property details have been saved.");
      router.back();
    } catch (err) {
      console.error("Update failed:", err);
      Alert.alert("Error", "Failed to update property.");
    }
  };

  // --- Render Loading, Error, and Not Found States ---
  if (isLoading || error || !property) {
    let message = "Loading property...";
    if (error) message = "Error loading property.";
    if (!property) message = "No property found.";

    const messageColor = error ? currentTheme.error : currentTheme.text;

    return (
      <View
        style={[
          styles.centeredContainer,
          { backgroundColor: currentTheme.background },
        ]}
      >
        <ActivityIndicator size="large" color={currentTheme.primary} />
        <Text style={[styles.text, { color: messageColor }]}>{message}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.heading, { color: currentTheme.text }]}>
        Edit Property
      </Text>

      {/* --- Property Information Section --- */}
      <FormSection title="Property Information" theme={currentTheme}>
        <Text style={[styles.label, { color: currentTheme.secondary }]}>Title</Text>
        <TextInput
          style={[styles.input, { borderColor: currentTheme.border, color: currentTheme.text }]}
          placeholder="Title"
          placeholderTextColor={currentTheme.muted}
          value={form.title}
          onChangeText={(t) => handleChange("title", t)}
        />

        <Text style={[styles.label, { color: currentTheme.secondary }]}>Rent Price (Rs.)</Text>
        <TextInput
          style={[styles.input, { borderColor: currentTheme.border, color: currentTheme.text }]}
          placeholder="Rent Price"
          placeholderTextColor={currentTheme.muted}
          value={form.rentPrice}
          keyboardType="numeric"
          onChangeText={(t) => handleChange("rentPrice", t)}
        />

        <Text style={[styles.label, { color: currentTheme.secondary }]}>Description</Text>
        <TextInput
          style={[styles.input, styles.textarea, { borderColor: currentTheme.border, color: currentTheme.text }]}
          placeholder="Description"
          placeholderTextColor={currentTheme.muted}
          multiline
          value={form.description}
          onChangeText={(t) => handleChange("description", t)}
        />
      </FormSection>

      {/* --- Location Details Section --- */}
      <FormSection title="Location Details" theme={currentTheme}>
        <Text style={[styles.label, { color: currentTheme.secondary }]}>City</Text>
        <TextInput
          style={[styles.input, { borderColor: currentTheme.border, color: currentTheme.text }]}
          placeholder="City"
          placeholderTextColor={currentTheme.muted}
          value={form.city}
          onChangeText={(t) => handleChange("city", t)}
        />

        <Text style={[styles.label, { color: currentTheme.secondary }]}>Address</Text>
        <TextInput
          style={[styles.input, { borderColor: currentTheme.border, color: currentTheme.text }]}
          placeholder="Address"
          placeholderTextColor={currentTheme.muted}
          value={form.address}
          onChangeText={(t) => handleChange("address", t)}
        />

        <Text style={[styles.label, { color: currentTheme.secondary }]}>
          Map Location
        </Text>
        <LocationPicker
          onPick={(lat, lng, address) => {
            handleChange("latitude", lat.toString());
            handleChange("longitude", lng.toString());
            handleChange("address", address ?? "");
          }}
        />
      </FormSection>

      {/* --- Save Button --- */}
      <TouchableOpacity
        style={[
          styles.saveButton,
          { backgroundColor: currentTheme.primary },
          isUpdating && styles.saveButtonDisabled,
        ]}
        onPress={handleSave}
        disabled={isUpdating}
      >
        <Text style={styles.saveText}>
          {isUpdating ? "Saving..." : "Save Changes"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 16,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 24,
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    marginTop: 8,
  },
  // --- Section Styles ---
  section: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
  },
  // --- Form Element Styles ---
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  textarea: {
    minHeight: 120,
    textAlignVertical: "top",
    paddingTop: 14,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
});