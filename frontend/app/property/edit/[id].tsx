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

export const options = {
  headerShown: false,
};

export default function EditProperty() {
  const { id } = useLocalSearchParams<{ id: string }>();
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

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading property...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>Error loading property.</Text>
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.center}>
        <Text>No property found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Edit Property</Text>

      <TextInput
        style={styles.input}
        placeholder="Title"
        value={form.title}
        onChangeText={(t) => handleChange("title", t)}
      />

      <TextInput
        style={styles.input}
        placeholder="Rent Price"
        value={form.rentPrice}
        keyboardType="numeric"
        onChangeText={(t) => handleChange("rentPrice", t)}
      />

      <TextInput
        style={styles.input}
        placeholder="City"
        value={form.city}
        onChangeText={(t) => handleChange("city", t)}
      />

      {/* Location Picker Integration */}
      <Text style={styles.label}>Pick Location</Text>
      <LocationPicker
        onPick={(lat, lng, address) => {
          handleChange("latitude", lat.toString());
          handleChange("longitude", lng.toString());
          handleChange("address", address ?? "");
        }}
      />

      <TextInput
        style={styles.input}
        placeholder="Address"
        value={form.address}
        onChangeText={(t) => handleChange("address", t)}
      />

      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Description"
        multiline
        value={form.description}
        onChangeText={(t) => handleChange("description", t)}
      />

      <TouchableOpacity
        style={[styles.saveButton, isUpdating && { opacity: 0.6 }]}
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
    backgroundColor: Colors.light.background,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    color: Colors.light.primary,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 6,
    color: "#444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
