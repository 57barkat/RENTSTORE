import React from "react";
import { View, Text, TextInput } from "react-native"; 
import { Colors } from "@/constants/Colors";
import { FormData } from "@/contextStore/HostelFormContext";
import { styles } from "@/styles/HostelForm.styles";

interface RentRateInputProps {
  type: "daily" | "weekly" | "monthly";
  formData: FormData;
  updateForm: (field: keyof FormData, value: any) => void;
  theme: keyof typeof Colors;
}

export const RentRateInput: React.FC<RentRateInputProps> = ({
  type,
  formData,
  updateForm,
  theme,
}) => {
  const currentTheme = Colors[theme];
  const rateItem = formData.rentRates.find((r) => r.type === type);
  const amountValue = rateItem?.amount ? rateItem.amount.toString() : "";
  const label = type.charAt(0).toUpperCase() + type.slice(1);

  const handleChange = (value: string) => {
    const newAmount = Number(value) || 0;
    const rentRates = formData.rentRates.filter((r) => r.type !== type);
    if (newAmount > 0) rentRates.push({ type, amount: newAmount });
    updateForm("rentRates", rentRates);
  };

  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: currentTheme.text }]}>
        {label} Rent
      </Text>
      <TextInput
        placeholder={`Enter ${label} Rent Amount (0 if not applicable)`}
        keyboardType="numeric"
        value={amountValue}
        onChangeText={handleChange}
        style={[
          styles.input,
          { borderColor: currentTheme.border, color: currentTheme.text },
        ]}
        placeholderTextColor={currentTheme.muted}
      />
    </View>
  );
};
