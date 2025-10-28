import React, { useState, FC, useContext, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  Keyboard,
  Platform,
  Switch,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import StepContainer from "@/app/upload/Welcome";
import { styles } from "@/styles/WeekendPricingScreen";
import { WeekendPricingScreenProps } from "@/types/WeekendPricingScreen.types";
import { FormContext } from "@/contextStore/FormContext";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";

export type BillType = "electricity" | "water" | "gas";
const ALL_BILLS: BillType[] = ["electricity", "water", "gas"];
const MIN_RENT = 100;

const WeekendPricingScreen: FC<WeekendPricingScreenProps> = ({
  weekdayBasePrice = 83,
}) => {
  const context = useContext(FormContext);
  if (!context) throw new Error("Component must be used within a FormProvider");

  const { data, updateForm } = context;
  const router = useRouter();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const [monthlyRent, setMonthlyRent] = useState<number>(
    data.monthlyRent ?? 500
  );
  const [includedBills, setIncludedBills] = useState<BillType[]>(
    data.ALL_BILLS ?? []
  );

  useEffect(() => {
    if (data.monthlyRent !== undefined) setMonthlyRent(data.monthlyRent);
    if (data.ALL_BILLS !== undefined) setIncludedBills(data.ALL_BILLS);
  }, [data]);

  const handleRentChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    const newRent = Number(numericValue);
    if (!isNaN(newRent) && newRent >= 0) {
      setMonthlyRent(newRent);
    }
  };

  const handleBillToggle = (billType: BillType, isIncluded: boolean) => {
    setIncludedBills((prev) => {
      if (isIncluded) return [...new Set([...prev, billType])];
      return prev.filter((b) => b !== billType);
    });
  };

  const handleNext = () => {
    updateForm("ALL_BILLS", includedBills);
    updateForm("monthlyRent", monthlyRent);
    router.push("/upload/SafetyDetailsScreen");
  };

  const isNextDisabled = monthlyRent < MIN_RENT;

  return (
    <StepContainer
      title="Set House Monthly Rent"
      onNext={handleNext}
      isNextDisabled={isNextDisabled}
      progress={88}
    >
      {/* Monthly Rent Input */}
      <View style={styles.priceInputRow}>
        <Text style={[styles.currencySymbol, { color: currentTheme.text }]}>
          PKR
        </Text>
        <TextInput
          keyboardType="numeric"
          value={String(monthlyRent)}
          onChangeText={handleRentChange}
          onBlur={() => Keyboard.dismiss()}
          style={[
            styles.priceInput,
            { color: currentTheme.text, borderColor: currentTheme.border },
          ]}
          maxLength={7}
        />
        <MaterialCommunityIcons
          name="pencil"
          size={20}
          color={currentTheme.icon}
          style={styles.editIcon}
        />
      </View>

      {/* Bills Included */}
      <View style={styles.billsContainer}>
        <Text
          style={[styles.billInstructionText, { color: currentTheme.text }]}
        >
          Check only those which are{" "}
          <Text style={{ fontWeight: "bold" }}>included</Text> in the rent:
        </Text>

        {ALL_BILLS.map((type) => (
          <View key={type} style={styles.billRow}>
            <Text style={[styles.billLabel, { color: currentTheme.text }]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
            <Switch
              value={includedBills.includes(type)}
              onValueChange={(value) => handleBillToggle(type, value)}
              trackColor={{
                false: currentTheme.border,
                true: currentTheme.primary,
              }}
              thumbColor={
                Platform.OS === "ios" ? currentTheme.card : currentTheme.primary
              }
            />
          </View>
        ))}
      </View>
    </StepContainer>
  );
};

export default WeekendPricingScreen;
