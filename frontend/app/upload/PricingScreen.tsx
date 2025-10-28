import React, { useState, FC, useContext } from "react";
import { Text, View, TextInput, Keyboard } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import StepContainer from "@/app/upload/Welcome";
import { styles } from "@/styles/PricingScreen";
import { PricingScreenProps } from "@/types/PricingScreen.types";
import { FormContext } from "@/contextStore/FormContext";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";

const INITIAL_BASE_PRICE = 10;

const PricingScreen: FC<PricingScreenProps> = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("Component must be used within a FormProvider");
  }

  const { data, updateForm } = context;
  const router = useRouter();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  // Initialize from global context or default
  const [basePrice, setBasePrice] = useState<number>(
    data.SecuritybasePrice ?? INITIAL_BASE_PRICE
  );

  const [priceInput, setPriceInput] = useState<string>(
    data.SecuritybasePrice ? String(data.SecuritybasePrice) : ""
  );

  const MIN_PRICE = 10;

  const handlePriceChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    setPriceInput(numericValue);

    const newPrice = Number(numericValue);
    if (!isNaN(newPrice) && newPrice >= 0) {
      setBasePrice(newPrice);
    }
  };

  const handleNext = () => {
    updateForm("SecuritybasePrice", basePrice);
    console.log("Security Base Price saved:", basePrice);
    router.push("/upload/WeekendPricingScreen");
  };

  const isNextDisabled = basePrice < MIN_PRICE;

  return (
    <StepContainer
      title="Now, set a House Security price"
      onNext={handleNext}
      isNextDisabled={isNextDisabled}
      progress={80}
    >
      <View style={styles.priceInputRow}>
        <Text style={[styles.currencySymbol, { color: currentTheme.text }]}>
          PKR
        </Text>
        <TextInput
          keyboardType="numeric"
          value={priceInput}
          onChangeText={handlePriceChange}
          onBlur={() => Keyboard.dismiss()}
          style={[
            styles.priceInput,
            { color: currentTheme.text, borderColor: currentTheme.border },
          ]}
          maxLength={7}
          placeholder="price"
          placeholderTextColor={currentTheme.border}
        />
        <MaterialCommunityIcons
          name="pencil"
          size={20}
          color={currentTheme.icon}
          style={styles.editIcon}
        />
      </View>
    </StepContainer>
  );
};

export default PricingScreen;
