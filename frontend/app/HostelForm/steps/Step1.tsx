import React, { useContext } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { FormContext } from "@/contextStore/HostelFormContext";

export default function Step1BasicInfo() {
  const formContext = useContext(FormContext);
  if (!formContext)
    throw new Error("HostelForm must be inside HostelFormProvider");

  const { data, updateForm } = formContext;

  // Ensure rentRates always has a fallback array
  const rentRatesData = data.rentRates ?? [];

  const rentTypes: ("daily" | "weekly" | "monthly")[] = [
    "daily",
    "weekly",
    "monthly",
  ];

  const rentRates = rentTypes.map((type) => {
    const rate = rentRatesData.find((r) => r.type === type);
    return rate || { type, amount: 0 };
  });

  const handleRentChange = (
    type: "daily" | "weekly" | "monthly",
    value: string
  ) => {
    const updatedRates = rentRates.map((r) =>
      r.type === type ? { ...r, amount: Number(value) || 0 } : r
    );
    updateForm("rentRates", updatedRates);
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>🏫 Basic Info</Text>

      <Text style={styles.label}>Hostel Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter hostel title"
        value={data.title || ""}
        onChangeText={(val) => updateForm("title", val)}
      />

      <Text style={styles.label}>Subtype</Text>
      <TextInput
        style={styles.input}
        placeholder="Male / Female / Mixed"
        value={data.subType || ""}
        onChangeText={(val) =>
          updateForm(
            "subType",
            val.toLowerCase() as "male" | "female" | "mixed"
          )
        }
      />

      <Text style={styles.label}>Security Deposit</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter security deposit"
        keyboardType="numeric"
        value={data.securityDeposit?.toString() || ""}
        onChangeText={(val) =>
          updateForm("securityDeposit", val === "" ? 0 : Number(val))
        }
      />

      {/* Rent Inputs */}
      {rentRates.map((rate) => (
        <View key={rate.type} style={{ marginBottom: 12 }}>
          <Text style={styles.label}>
            Rent Amount (
            {rate.type.charAt(0).toUpperCase() + rate.type.slice(1)})
          </Text>
          <TextInput
            style={styles.input}
            placeholder={`Enter ${rate.type} rent`}
            keyboardType="numeric"
            value={rate.amount.toString()}
            onChangeText={(val) => handleRentChange(rate.type, val)}
          />
        </View>
      ))}
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
    padding: 0,
    fontSize: 14,
    marginBottom: 15,
  },
});
