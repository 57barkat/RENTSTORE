import React, { FC, useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Switch,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import StepContainer from "@/app/upload/Welcome";
import { FormContext } from "@/contextStore/FormContext";

import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";

export type BillType = "electricity" | "water" | "gas";
const ALL_BILLS: BillType[] = ["electricity", "water", "gas"];
const MIN_RENT = 100;

type RentType = "daily" | "weekly" | "monthly";

const ApartmentRentScreen: FC = () => {
  const context = useContext(FormContext);
  if (!context)
    throw new Error(
      "ApartmentRentScreen must be used within an ApartmentFormProvider"
    );

  const { data, updateForm } = context;
  const router = useRouter();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const [rents, setRents] = useState<Record<RentType, number>>({
    daily: data.dailyRent ?? 0,
    weekly: data.weeklyRent ?? 0,
    monthly: data.monthlyRent ?? 0,
  });

  const [offer, setOffer] = useState<Record<RentType, boolean>>({
    daily: !!data.dailyRent,
    weekly: !!data.weeklyRent,
    monthly: !!data.monthlyRent,
  });

  const [includedBills, setIncludedBills] = useState<BillType[]>(
    data.ALL_BILLS ?? []
  );

  useEffect(() => {
    setRents({
      daily: data.dailyRent ?? 0,
      weekly: data.weeklyRent ?? 0,
      monthly: data.monthlyRent ?? 0,
    });
    setIncludedBills(data.ALL_BILLS ?? []);
  }, [data]);

  const handleRentChange = (text: string, type: RentType) => {
    const numericValue = Number(text.replace(/[^0-9]/g, ""));
    if (!isNaN(numericValue)) {
      setRents((prev) => ({ ...prev, [type]: numericValue }));
    }
  };

  const handleOfferToggle = (type: RentType, value: boolean) => {
    setOffer((prev) => ({ ...prev, [type]: value }));
  };

  const handleBillToggle = (bill: BillType, value: boolean) => {
    setIncludedBills((prev) =>
      value ? [...new Set([...prev, bill])] : prev.filter((b) => b !== bill)
    );
  };

  const handleNext = () => {
    updateForm("dailyRent", offer.daily ? rents.daily : undefined);
    updateForm("weeklyRent", offer.weekly ? rents.weekly : undefined);
    updateForm("monthlyRent", offer.monthly ? rents.monthly : undefined);
    updateForm("ALL_BILLS", includedBills);

    router.push("/upload/apartmentForm/SafetyDetailsScreen");
  };

  const isNextDisabled =
    !Object.values(offer).some(Boolean) ||
    (offer.daily && rents.daily < MIN_RENT) ||
    (offer.weekly && rents.weekly < MIN_RENT) ||
    (offer.monthly && rents.monthly < MIN_RENT);

  return (
    <StepContainer
      title="Set your apartment rent"
      onNext={handleNext}
      isNextDisabled={isNextDisabled}
      progress={88}
    >
      {/* Inline Rent Inputs with styled toggles */}
      <View style={{ marginTop: 20 }}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
          Set rent and toggle availability
        </Text>

        {(["daily", "weekly", "monthly"] as RentType[]).map((type) => (
          <View key={type} style={styles.inlineRow}>
            {/* Label */}
            <Text style={[styles.label, { color: currentTheme.text }]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>

            {/* Centered Input */}
            {offer[type] && (
              <TextInput
                keyboardType="numeric"
                value={String(rents[type])}
                onChangeText={(text) => handleRentChange(text, type)}
                style={[
                  styles.centerInput,
                  {
                    color: currentTheme.text,
                    borderColor: currentTheme.border,
                  },
                ]}
                placeholder="Amount"
                placeholderTextColor={currentTheme.border}
              />
            )}

            {/* Styled Toggle */}
            <Switch
              value={offer[type]}
              onValueChange={(val) => handleOfferToggle(type, val)}
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

      {/* Bills Section */}
      <View style={{ marginTop: 30 }}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
          Check bills included in rent
        </Text>

        {ALL_BILLS.map((bill) => (
          <View key={bill} style={styles.row}>
            <Text style={[styles.label, { color: currentTheme.text }]}>
              {bill.charAt(0).toUpperCase() + bill.slice(1)}
            </Text>
            <Switch
              value={includedBills.includes(bill)}
              onValueChange={(val) => handleBillToggle(bill, val)}
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

export default ApartmentRentScreen;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  inlineRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 15,
  },
  centerInput: {
    width: 100,
    textAlign: "center",
    borderBottomWidth: 2,
    paddingVertical: 5,
    fontSize: 18,
    fontWeight: "700",
  },
});
