import React, { useState, FC, useMemo, useContext } from "react";
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
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
// Assuming the path aliases are correctly configured
import StepContainer from "@/app/upload/Welcome";
import { styles } from "@/styles/WeekendPricingScreen";
import { WeekendPricingScreenProps } from "@/types/WeekendPricingScreen.types";
// Assuming these utility functions and components exist
import { calculatePrices } from "@/utils/WeekendPricingScreen";
import { PriceBreakdown } from "@/components/UploadPropertyComponents/WeekendPricingPriceBreakdown";
import { FormContext } from "@/contextStore/FormContext";

const INITIAL_PREMIUM = 20;
const MIN_RENT = 100;

// Define the available bill types
export type BillType = "electricity" | "water" | "gas";
const ALL_BILLS: BillType[] = ["electricity", "water", "gas"];

const WeekendPricingScreen: FC<WeekendPricingScreenProps> = ({
  weekdayBasePrice = 83,
}) => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("Component must be used within a FormProvider");
  }
  const { data, updateForm } = context;
  const router = useRouter();
  const [monthlyRent, setMonthlyRent] = useState<number>(
    data.monthlyRent ?? 500
  );
  const [rentInput, setRentInput] = useState<string>("500");
  const [premiumPercent, setPremiumPercent] = useState<number>(INITIAL_PREMIUM);
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);

  // 1. Log in one state: An array to hold the names of included bills
  const [includedBills, setIncludedBills] = useState<BillType[]>(
    data.ALL_BILLS ?? []
  );

  // Helper function to convert the array state back to the object format
  // which the PriceBreakdown component likely expects.
  const getBillsObject = (billsArray: BillType[]) => {
    return {
      electricity: billsArray.includes("electricity"),
      water: billsArray.includes("water"),
      gas: billsArray.includes("gas"),
    };
  };

  // Handle numeric input for rent
  const handleRentChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    setRentInput(numericValue);

    const newRent = Number(numericValue);
    if (!isNaN(newRent) && newRent >= 0) {
      setMonthlyRent(newRent);
    }
  };

  // Handler: Toggle bill inclusion in the single state (array)
  const handleBillToggle = (billType: BillType, isIncluded: boolean) => {
    setIncludedBills((prevBills) => {
      if (isIncluded) {
        // Add the bill type if it's not already there
        if (!prevBills.includes(billType)) {
          return [...prevBills, billType];
        }
      } else {
        // Remove the bill type
        return prevBills.filter((bill) => bill !== billType);
      }
      return prevBills;
    });
  };

  // Calculate prices
  const prices = useMemo(() => {
    return calculatePrices(monthlyRent, premiumPercent);
  }, [monthlyRent, premiumPercent]);

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
          value={rentInput}
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

      {/* Bills Included Switches */}
      <View style={styles.billsContainer}>
        {/* 2. Text to show check only those which are included in rent */}
        <Text style={styles.billInstructionText}>
          Check only those which are **included** in the rent (e.g.,
          electricity, water, gas):
        </Text>

        {ALL_BILLS.map((type) => (
          <View key={type} style={styles.billRow}>
            <Text style={styles.billLabel}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
            <Switch
              // Check if the current bill is in the includedBills array
              value={includedBills.includes(type)}
              // Use the new toggle handler
              onValueChange={(value) => handleBillToggle(type, value)}
              trackColor={{ false: "#ccc", true: "#000" }}
              thumbColor={Platform.OS === "ios" ? "#fff" : "#000"}
            />
          </View>
        ))}
      </View>

      {/* Weekend Premium (commented out in original) */}
      {/* <View style={styles.premiumSection}>
        <View style={styles.premiumHeader}>
          <Text style={styles.premiumLabel}>Weekend premium</Text>
          <Text style={styles.premiumTip}>Tip: Try {INITIAL_PREMIUM}%</Text>
          <Text style={styles.premiumValue}>{premiumPercent}%</Text>
        </View>

        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={99}
          step={1}
          value={premiumPercent}
          onValueChange={(value) => setPremiumPercent(Math.round(value))}
          minimumTrackTintColor="#000"
          maximumTrackTintColor="#ccc"
          thumbTintColor={Platform.OS === "ios" ? "#000" : "#000"}
        />

        <View style={styles.sliderMarks}>
          <Text style={styles.sliderMarkText}>0%</Text>
          <Text style={styles.sliderMarkText}>99%</Text>
        </View>
      </View> */}

      {/* Price Breakdown (Toggle) */}
      {/* <TouchableOpacity
        onPress={() => setShowBreakdown(!showBreakdown)}
        style={styles.priceToggle}
      >
        <Text style={styles.priceToggleText}>
          Guest price before taxes ${prices.guestPriceBeforeTaxes}
        </Text>
        <MaterialCommunityIcons
          name={showBreakdown ? "chevron-up" : "chevron-down"}
          size={20}
          color="#000"
        />
      </TouchableOpacity> */}

      <PriceBreakdown
        basePrice={prices.weekendBasePrice}
        guestServiceFee={prices.guestServiceFee}
        guestPriceBeforeTaxes={prices.guestPriceBeforeTaxes}
        youEarn={prices.hostEarns}
        // Use the helper function to convert the array state for the PriceBreakdown component
        billsIncluded={getBillsObject(includedBills)}
        isVisible={showBreakdown}
      />
    </StepContainer>
  );
};

export default WeekendPricingScreen;
