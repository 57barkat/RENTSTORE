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
import { HostelFormContext } from "@/contextStore/HostelFormContext";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
// import { styles } from "@/styles/HostelRentScreenStyles";

export type BillType = "electricity" | "water" | "gas";
const ALL_BILLS: BillType[] = ["electricity", "water", "gas"];
const MIN_RENT = 100;

const HostelRentScreen: FC = () => {
  const context = useContext(HostelFormContext);
  if (!context)
    throw new Error(
      "HostelRentScreen must be used within a HostelFormProvider"
    );

  const { data, updateForm } = context;
  const router = useRouter();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const [dailyRent, setDailyRent] = useState<number>(data.dailyRent ?? 0);
  const [weeklyRent, setWeeklyRent] = useState<number>(data.weeklyRent ?? 0);
  const [monthlyRent, setMonthlyRent] = useState<number>(data.monthlyRent ?? 0);
  const [includedBills, setIncludedBills] = useState<BillType[]>(
    data.ALL_BILLS ?? []
  );

  useEffect(() => {
    if (data.dailyRent !== undefined) setDailyRent(data.dailyRent);
    if (data.weeklyRent !== undefined) setWeeklyRent(data.weeklyRent);
    if (data.monthlyRent !== undefined) setMonthlyRent(data.monthlyRent);
    if (data.ALL_BILLS !== undefined) setIncludedBills(data.ALL_BILLS);
  }, [data]);

  const handleRentChange = (
    text: string,
    type: "daily" | "weekly" | "monthly"
  ) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    const value = Number(numericValue);
    if (isNaN(value) || value < 0) return;

    if (type === "daily") setDailyRent(value);
    else if (type === "weekly") setWeeklyRent(value);
    else setMonthlyRent(value);
  };

  const handleBillToggle = (billType: BillType, isIncluded: boolean) => {
    setIncludedBills((prev) => {
      if (isIncluded) return [...new Set([...prev, billType])];
      return prev.filter((b) => b !== billType);
    });
  };

  const handleNext = () => {
    updateForm("dailyRent", dailyRent);
    updateForm("weeklyRent", weeklyRent);
    updateForm("monthlyRent", monthlyRent);
    updateForm("ALL_BILLS", includedBills);
    router.push("/upload/hostelForm/SafetyDetailsScreen");
  };

  const isNextDisabled =
    dailyRent < MIN_RENT && weeklyRent < MIN_RENT && monthlyRent < MIN_RENT;

  return (
    <StepContainer
      title="Set your hostel rent"
      onNext={handleNext}
      isNextDisabled={isNextDisabled}
      progress={88}
    >
      {/* Rents in a row */}
      <View style={styles.rentRow}>
        {[
          { label: "Daily", value: dailyRent, type: "daily" },
          { label: "Weekly", value: weeklyRent, type: "weekly" },
          { label: "Monthly", value: monthlyRent, type: "monthly" },
        ].map((item) => (
          <View key={item.type} style={styles.rentColumn}>
            <Text style={[styles.currencySymbol, { color: currentTheme.text }]}>
              PKR
            </Text>
            <TextInput
              keyboardType="numeric"
              value={String(item.value)}
              onChangeText={(text) =>
                handleRentChange(
                  text,
                  item.type as "daily" | "weekly" | "monthly"
                )
              }
              onBlur={() => Keyboard.dismiss()}
              style={[
                styles.priceInput,
                { color: currentTheme.text, borderColor: currentTheme.border },
              ]}
              maxLength={7}
              placeholder={`${item.label} rent`}
              placeholderTextColor={currentTheme.border}
            />
            <MaterialCommunityIcons
              name="pencil"
              size={20}
              color={currentTheme.icon}
              style={styles.editIcon}
            />
            <Text style={[styles.label, { color: currentTheme.text }]}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Bills switches */}
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

export default HostelRentScreen;

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  rentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },

  rentColumn: {
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },

  currencySymbol: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 5,
  },

  priceInput: {
    fontSize: 24,
    fontWeight: "700",
    width: "100%",
    textAlign: "center",
    paddingVertical: 5,
    borderBottomWidth: 2,
    borderBottomColor: "#ccc",
    minHeight: 50,
  },

  label: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 5,
  },

  editIcon: {
    marginLeft: 5,
  },

  billsContainer: {
    marginTop: 30,
    paddingHorizontal: 10,
  },
  billInstructionText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 15,
    textAlign: "center",
  },
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  billLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
});
