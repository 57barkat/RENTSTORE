import React, { useContext } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { FormContext } from "@/contextStore/HostelFormContext";

export default function Step3Capacity() {
  const formContext = useContext(FormContext);
  if (!formContext)
    throw new Error("Step3Capacity must be inside HostelFormProvider");

  const { data, updateForm } = formContext;

  // ✅ Ensure safe defaults to avoid undefined errors
  const capacity = data.capacity ?? {
    persons: 0,
    beds: 0,
    bedrooms: 0,
    bathrooms: 0,
  };
  const billsIncluded = data.billsIncluded ?? [];

  const handleCapacityChange = (
    field: "persons" | "beds" | "bedrooms" | "bathrooms",
    value: string
  ) => {
    updateForm("capacity", { ...capacity, [field]: Number(value) || 0 });
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>👥 Capacity & Bills</Text>

      {(["persons", "beds", "bedrooms", "bathrooms"] as const).map((field) => (
        <View key={field} style={{ marginBottom: 12 }}>
          <Text style={styles.label}>
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={`Enter number of ${field}`}
            keyboardType="numeric"
            value={capacity[field]?.toString() || ""}
            onChangeText={(val) => handleCapacityChange(field, val)}
          />
        </View>
      ))}

      <Text style={styles.label}>Bills Included</Text>
      <TextInput
        style={styles.input}
        placeholder="Electricity, Water, Internet..."
        value={billsIncluded.join(", ")}
        onChangeText={(val) =>
          updateForm(
            "billsIncluded",
            val.split(",").map((i) => i.trim())
          )
        }
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
});
