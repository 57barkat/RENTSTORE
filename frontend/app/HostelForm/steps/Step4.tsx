import React, { useContext } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { FormContext } from "@/contextStore/HostelFormContext";

export default function Step4DescriptionHighlights() {
  const formContext = useContext(FormContext);
  if (!formContext)
    throw new Error(
      "Step4DescriptionHighlights must be inside HostelFormProvider"
    );

  const { data, updateForm } = formContext;

  // ✅ Safe default for description
  const description = data.description ?? { details: "", highlights: [] };

  const handleHighlightsChange = (value: string) => {
    const highlights = value
      .split(",")
      .map((h) => h.trim())
      .filter((h) => h.length > 0);
    updateForm("description", { ...description, highlights });
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>📝 Description & Highlights</Text>

      <Text style={styles.label}>Detailed Description</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        placeholder="Provide a detailed description of the hostel"
        value={description.details}
        onChangeText={(val) =>
          updateForm("description", { ...description, details: val })
        }
        multiline
        numberOfLines={4}
      />

      <Text style={[styles.label, { marginTop: 10 }]}>Highlights</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        placeholder="Enter key highlights separated by commas"
        value={description.highlights.join(", ")}
        onChangeText={handleHighlightsChange}
        multiline
        numberOfLines={3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stepContainer: { marginBottom: 25, paddingHorizontal: 10 },
  stepTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  label: { fontSize: 14, fontWeight: "500", color: "#444", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    marginBottom: 15,
  },
  multilineInput: { minHeight: 50, textAlignVertical: "top" },
});
