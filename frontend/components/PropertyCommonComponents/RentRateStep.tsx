import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

interface RentRateStepProps {
  formData: any;
  setFormData: (data: any) => void;
}

const RentRateStep: React.FC<RentRateStepProps> = ({
  formData,
  setFormData,
}) => {
  const rentRates = formData.rentRates || [{ type: "monthly", amount: 0 }];

  const updateRentRate = (index: number, key: string, value: any) => {
    const updated = [...rentRates];
    updated[index][key] = value;
    setFormData({ ...formData, rentRates: updated });
  };

  const securityDeposit = formData.securityDeposit || "";

  return (
    <View style={styles.container}>
      {rentRates.map(({ rate, i }: any) => (
        <View key={i} style={{ marginBottom: 15 }}>
          <Text style={styles.label}>Rent Type</Text>
          <Picker
            selectedValue={rate.type}
            onValueChange={(value) => updateRentRate(i, "type", value)}
            style={styles.picker}
          >
            <Picker.Item label="Daily" value="daily" />
            <Picker.Item label="Weekly" value="weekly" />
            <Picker.Item label="Monthly" value="monthly" />
          </Picker>

          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            keyboardType="numeric"
            value={rate.amount?.toString() || ""}
            onChangeText={(text) => updateRentRate(i, "amount", Number(text))}
          />
        </View>
      ))}

      <Text style={styles.label}>Security Deposit</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter security deposit"
        keyboardType="numeric"
        value={securityDeposit?.toString()}
        onChangeText={(text) =>
          setFormData({ ...formData, securityDeposit: Number(text) })
        }
      />
    </View>
  );
};

export default RentRateStep;

const styles = StyleSheet.create({
  container: { padding: 10 },
  label: { fontWeight: "bold", marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
});
