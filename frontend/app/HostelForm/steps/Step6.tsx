import React, { useContext } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { FormContext } from "@/contextStore/HostelFormContext";

export default function Step6AmenitiesSafety() {
  const formContext = useContext(FormContext);
  if (!formContext)
    throw new Error("Step6AmenitiesSafety must be inside HostelFormProvider");

  const { data, updateForm } = formContext;

  const handleCommaSeparatedChange = (
    field: "amenities" | "safetyFeatures" | "billsIncluded",
    value: string
  ) => {
    const items = value
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i.length > 0);
    updateForm(field, items);
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>🏢 Amenities, Safety & Bills</Text>

      {/* ✅ Amenities */}
      <Text style={styles.label}>Amenities</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        placeholder="Enter amenities separated by commas"
        value={data.amenities?.join(", ") || ""}
        onChangeText={(val) => handleCommaSeparatedChange("amenities", val)}
        multiline
        numberOfLines={2}
      />

      {/* ✅ Safety Features */}
      <Text style={[styles.label, { marginTop: 10 }]}>Safety Features</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        placeholder="Enter safety features separated by commas"
        value={data.safetyFeatures?.join(", ") || ""}
        onChangeText={(val) =>
          handleCommaSeparatedChange("safetyFeatures", val)
        }
        multiline
        numberOfLines={2}
      />

      {/* ✅ Bills Included */}
      <Text style={[styles.label, { marginTop: 10 }]}>Bills Included</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        placeholder="Enter bills included (e.g., Electricity, Internet)"
        value={data.billsIncluded?.join(", ") || ""}
        onChangeText={(val) => handleCommaSeparatedChange("billsIncluded", val)}
        multiline
        numberOfLines={2}
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
