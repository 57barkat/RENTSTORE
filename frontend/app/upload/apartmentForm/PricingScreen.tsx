import React, { useState, FC, useContext } from "react";
import { Text, View, TextInput, Keyboard } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import StepContainer from "@/app/upload/Welcome";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { StyleSheet } from "react-native";
import { ApartmentFormContext } from "@/contextStore/ApartmentFormContextType";

const MIN_PRICE = 0; // Allow 0 if no deposit

const HostelSecurityDepositScreen: FC = () => {
  const context = useContext(ApartmentFormContext);
  if (!context)
    throw new Error(
      "HostelSecurityDepositScreen must be used within a HostelFormProvider"
    );

  const { data, updateForm } = context;
  const router = useRouter();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const [deposit, setDeposit] = useState<string>(
    data.securityDeposit !== undefined ? String(data.securityDeposit) : ""
  );

  const handleDepositChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    setDeposit(numericValue);
  };

  const handleNext = () => {
    const numericDeposit = Number(deposit) || 0;
    updateForm("securityDeposit", numericDeposit);
    router.push("/upload/apartmentForm/WeekendPricingScreen"); // Next step
  };

  const isNextDisabled = deposit === "" || Number(deposit) < MIN_PRICE;

  return (
    <StepContainer
      title="Set Hostel Security Deposit"
      onNext={handleNext}
      isNextDisabled={isNextDisabled}
      progress={70}
    >
      <View style={styles.container}>
        <Text style={[styles.label, { color: currentTheme.muted }]}>
          Enter hostel security deposit. Leave 0 if none.
        </Text>

        <View style={[styles.inputRow, { borderColor: currentTheme.border }]}>
          <Text style={[styles.currencySymbol, { color: currentTheme.text }]}>
            PKR
          </Text>

          <TextInput
            keyboardType="numeric"
            value={deposit}
            onChangeText={handleDepositChange}
            onBlur={() => Keyboard.dismiss()}
            style={[
              styles.input,
              {
                color: currentTheme.text,
                borderBottomColor: currentTheme.border,
              },
            ]}
            placeholder="0"
            placeholderTextColor={currentTheme.muted}
            maxLength={7}
          />

          <MaterialCommunityIcons
            name="pencil"
            size={22}
            color={currentTheme.icon}
            style={styles.icon}
          />
        </View>
      </View>
    </StepContainer>
  );
};

export default HostelSecurityDepositScreen;

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: "700",
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    minHeight: 60,
    borderBottomWidth: 2,
    backgroundColor: "transparent",
  },
  icon: {
    marginLeft: 10,
  },
});
