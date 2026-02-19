import React, { useState, FC, useContext } from "react";
import { Text, View, TextInput, Keyboard, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import StepContainer from "@/app/upload/Welcome";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { FormContext } from "@/contextStore/FormContext";

const MIN_PRICE = 0;

const HostelSecurityDepositScreen: FC = () => {
  const context = useContext(FormContext);
  if (!context)
    throw new Error(
      "HostelSecurityDepositScreen must be used within a HostelFormProvider",
    );

  const { data, updateForm } = context;
  const router = useRouter();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const [deposit, setDeposit] = useState<string>(
    data.securityDeposit !== undefined ? String(data.securityDeposit) : "",
  );

  const handleDepositChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    setDeposit(numericValue);
  };

  const handleNext = () => {
    const numericDeposit = Number(deposit) || 0;
    updateForm("securityDeposit", numericDeposit);
    router.push("/upload/apartmentForm/WeekendPricingScreen");
  };

  const isNextDisabled = deposit === "" || Number(deposit) < MIN_PRICE;

  return (
    <StepContainer
      title="Set apartment Security Deposit"
      onNext={handleNext}
      isNextDisabled={isNextDisabled}
      progress={70}
    >
      <View style={styles.container}>
        <Text style={[styles.label, { color: currentTheme.muted }]}>
          Enter apartment security deposit. Leave 0 if none.
        </Text>

        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: currentTheme.card,
              borderColor: currentTheme.border,
              shadowColor: currentTheme.shadow,
            },
          ]}
        >
          <Text
            style={[styles.currencySymbol, { color: currentTheme.primary }]}
          >
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
              },
            ]}
            placeholder="0"
            placeholderTextColor={currentTheme.placeholder}
            maxLength={7}
          />

          <MaterialCommunityIcons
            name="cash"
            size={22}
            color={currentTheme.icon}
          />
        </View>
      </View>
    </StepContainer>
  );
};

export default HostelSecurityDepositScreen;

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
    paddingHorizontal: 24,
  },
  label: {
    fontSize: 15,
    marginBottom: 18,
    textAlign: "center",
    lineHeight: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 2,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: "700",
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    paddingVertical: 6,
  },
});
