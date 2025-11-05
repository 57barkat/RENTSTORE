import React, { useContext } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { FormContext } from "@/contextStore/HostelFormContext";

export default function Step2Location() {
  const formContext = useContext(FormContext);
  if (!formContext)
    throw new Error("Step2Location must be inside HostelFormProvider");

  const { data, updateForm } = formContext;

  // Ensure location always has a fallback
  const location = data.location ?? {
    city: "",
    area: "",
    street: "",
    fullAddress: "",
    contact:""
  };

  const handleChange = (
    field: "city" | "area" | "street" | "fullAddress"|"contact",
    value: string
  ) => {
    updateForm("location", { ...location, [field]: value });
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>📍 Location Details</Text>

      <Text style={styles.label}>City</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter city"
        value={location.city}
        onChangeText={(val) => handleChange("city", val)}
      />

      <Text style={styles.label}>Area</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter area or neighborhood"
        value={location.area}
        onChangeText={(val) => handleChange("area", val)}
      />

      <Text style={styles.label}>Street</Text>
      <TextInput
        style={styles.input}
        placeholder="Street / Block (optional)"
        value={location.street || ""}
        onChangeText={(val) => handleChange("street", val)}
      />

      <Text style={styles.label}>Full Address</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        placeholder="Enter complete address"
        value={location.fullAddress || ""}
        onChangeText={(val) => handleChange("fullAddress", val)}
        multiline
        numberOfLines={3}
      />
            <Text style={styles.label}>Contact Number</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        placeholder="Enter Phone number"
         keyboardType="numeric"
        value={location.contact || ""}
        onChangeText={(val) => handleChange("contact", val)}
        multiline
        numberOfLines={3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stepContainer: { marginBottom: 25, paddingHorizontal: 10 },
  stepTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  label: { fontSize: 14, fontWeight: "500", color: "#444", marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
    fontSize: 14,
  },
  multilineInput: { minHeight: 70, textAlignVertical: "top" },
});
