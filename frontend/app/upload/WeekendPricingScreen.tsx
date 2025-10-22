import React, { useState, FC, useContext, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Platform,
  Switch,
  Keyboard,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import StepContainer from "@/app/upload/Welcome";
import { styles } from "@/styles/WeekendPricingScreen";
import { WeekendPricingScreenProps } from "@/types/WeekendPricingScreen.types";
import { FormContext } from "@/contextStore/FormContext";

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

  // Initialize state from context (fallbacks included)
  const [monthlyRent, setMonthlyRent] = useState<number>(
    data.monthlyRent ?? 500
  );
  const [includedBills, setIncludedBills] = useState<BillType[]>(
    data.ALL_BILLS ?? []
  );

  // Sync local state with global context when data changes (e.g. after async load)
  useEffect(() => {
    if (data.monthlyRent !== undefined) setMonthlyRent(data.monthlyRent);
    if (data.ALL_BILLS !== undefined) setIncludedBills(data.ALL_BILLS);
  }, [data]);

  // Handle numeric input for rent
  const handleRentChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    const newRent = Number(numericValue);
    if (!isNaN(newRent) && newRent >= 0) {
      setMonthlyRent(newRent);
    }
  };

  // Handle bill toggles
  const handleBillToggle = (billType: BillType, isIncluded: boolean) => {
    setIncludedBills((prev) => {
      if (isIncluded) return [...new Set([...prev, billType])];
      return prev.filter((b) => b !== billType);
    });
  };

  // Save to global state + persist to AsyncStorage (handled by FormContext)
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
        <Text style={styles.currencySymbol}>PKR</Text>
        <TextInput
          keyboardType="numeric"
          value={String(monthlyRent)}
          onChangeText={handleRentChange}
          onBlur={() => Keyboard.dismiss()}
          style={styles.priceInput}
          maxLength={7}
        />
        <MaterialCommunityIcons
          name="pencil"
          size={20}
          color="#000"
          style={styles.editIcon}
        />
      </View>

      {/* Bills Included */}
      <View style={styles.billsContainer}>
        <Text style={styles.billInstructionText}>
          Check only those which are{" "}
          <Text style={{ fontWeight: "bold" }}>included</Text> in the rent:
        </Text>

        {ALL_BILLS.map((type) => (
          <View key={type} style={styles.billRow}>
            <Text style={styles.billLabel}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
            <Switch
              value={includedBills.includes(type)}
              onValueChange={(value) => handleBillToggle(type, value)}
              trackColor={{ false: "#ccc", true: "#000" }}
              thumbColor={Platform.OS === "ios" ? "#fff" : "#000"}
            />
          </View>
        ))}
      </View>
    </StepContainer>
  );
};

export default WeekendPricingScreen;
