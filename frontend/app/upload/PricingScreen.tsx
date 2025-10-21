import React, { useState, FC, useMemo, useContext } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import StepContainer from "@/app/upload/Welcome";
import { styles } from "@/styles/PricingScreen";
import { PricingScreenProps } from "@/types/PricingScreen.types";
import { PriceBreakdown } from "@/components/UploadPropertyComponents/PriceBreakdown";
import { FormContext } from "@/contextStore/FormContext";

const INITIAL_BASE_PRICE = 83;
const GUEST_SERVICE_FEE_RATE = 0.15; // Example 15% fee

const PricingScreen: FC<PricingScreenProps> = () => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("Component must be used within a FormProvider");
  }
  const { data, updateForm } = context;
  const router = useRouter();
  // State to hold the price input
  const [basePrice, setBasePrice] = useState<number>(
    data.SecuritybasePrice ?? INITIAL_BASE_PRICE
  );
  const [priceInput, setPriceInput] = useState<string>(
    String(INITIAL_BASE_PRICE)
  );
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);
  const MIN_PRICE = 10; // Enforce a minimum price

  const handlePriceChange = (text: string) => {
    // Allow only numbers
    const numericValue = text.replace(/[^0-9]/g, "");
    setPriceInput(numericValue);

    const newPrice = Number(numericValue);
    // Only update the actual price if it's a valid number and above 0
    if (!isNaN(newPrice) && newPrice >= 0) {
      setBasePrice(newPrice);
    }
  };

  const handleNext = () => {
    updateForm("SecuritybasePrice", basePrice);
    console.log("Weekday Base Price saved:", basePrice);
    router.push("/upload/WeekendPricingScreen");
  };

  const isNextDisabled = basePrice < MIN_PRICE;

  const guestPriceBeforeTaxes = useMemo(() => {
    return Math.round(basePrice * (1 + GUEST_SERVICE_FEE_RATE));
  }, [basePrice]);

  return (
    <StepContainer
      title="Now, set a House Security price"
      onNext={handleNext}
      isNextDisabled={isNextDisabled}
      progress={80}
    >
      {/* <Text style={styles.tipText}>
        Tip: PKR{INITIAL_BASE_PRICE}. You&apos;ll set a weekend price next.
      </Text> */}

      <View style={styles.priceInputRow}>
        <Text style={styles.currencySymbol}>PKR</Text>
        <TextInput
          keyboardType="numeric"
          value={priceInput}
          onChangeText={handlePriceChange}
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

      {/* <TouchableOpacity
        onPress={() => setShowBreakdown(!showBreakdown)}
        style={styles.priceToggle}
      >
        <Text style={styles.priceToggleText}>
          Guest price before taxes ${guestPriceBeforeTaxes}
        </Text>
        <MaterialCommunityIcons
          name={showBreakdown ? "chevron-up" : "chevron-down"}
          size={20}
          color="#000"
        />
      </TouchableOpacity> */}

      {/* <PriceBreakdown
        basePrice={basePrice}
        guestServiceFeeRate={GUEST_SERVICE_FEE_RATE}
        isVisible={showBreakdown}
      /> */}
      {/* 
      <View style={styles.linksContainer}>
        <TouchableOpacity style={styles.similarListingsButton}>
          <MaterialCommunityIcons name="map-marker" size={20} color="#E00000" />
          <Text style={styles.similarListingsText}>View similar listings</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.learnMoreText}>Learn more about pricing</Text>
        </TouchableOpacity>
      </View> */}
    </StepContainer>
  );
};

export default PricingScreen;
