import React, { useState, FC, useContext } from "react";
import { Text, View, TextInput, Keyboard, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import StepContainer from "@/app/upload/Welcome";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { FormContext } from "@/contextStore/FormContext";
import {
  PROPERTY_UPLOAD_TOTAL_STEPS,
  buildDisabledReason,
  getPropertyTypeLabel,
} from "@/utils/propertyTypes";

const MIN_PRICE = 0;

const PricingScreen: FC = () => {
  const context = useContext(FormContext);
  if (!context)
    throw new Error("PricingScreen must be used within a FormProvider");

  const { data, updateForm } = context;
  const router = useRouter();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const [price, setPrice] = useState<string>(
    data.SecuritybasePrice !== undefined ? String(data.SecuritybasePrice) : "",
  );
  const propertyLabel = getPropertyTypeLabel(data.hostOption);

  const handlePriceChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    setPrice(numericValue);
  };

  const handleNext = () => {
    const numericPrice = Number(price) || 0;
    updateForm("SecuritybasePrice", numericPrice);
    router.push("/upload/WeekendPricingScreen");
  };

  const isNextDisabled = price === "" || Number(price) < MIN_PRICE;

  return (
    <StepContainer
      title={`Now, set a ${propertyLabel} security deposit`}
      onNext={handleNext}
      isNextDisabled={isNextDisabled}
      progress={80}
      nextDisabledReason={buildDisabledReason([
        price === "" ? "Enter the security deposit amount to continue." : undefined,
        Number(price) < MIN_PRICE
          ? `Security deposit must be ${MIN_PRICE} PKR or more.`
          : undefined,
      ])}
      stepNumber={8}
      totalSteps={PROPERTY_UPLOAD_TOTAL_STEPS}
    >
      <View style={styles.container}>
        <Text style={[styles.label, { color: currentTheme.muted }]}>
          Enter the base security amount for this listing. Minimum {MIN_PRICE} PKR.
        </Text>

        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: currentTheme.card,
              borderColor: isNextDisabled
                ? currentTheme.error
                : currentTheme.border,
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
            value={price}
            onChangeText={handlePriceChange}
            onBlur={() => Keyboard.dismiss()}
            style={[styles.input, { color: currentTheme.text }]}
            placeholder="0"
            placeholderTextColor={currentTheme.placeholder}
            maxLength={7}
          />

          <MaterialCommunityIcons
            name="pencil"
            size={22}
            color={currentTheme.icon}
          />
        </View>
        {isNextDisabled ? (
          <Text
            style={{
              color: currentTheme.error,
              marginTop: 10,
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            Enter a valid deposit amount to continue.
          </Text>
        ) : null}
      </View>
    </StepContainer>
  );
};

export default PricingScreen;

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
