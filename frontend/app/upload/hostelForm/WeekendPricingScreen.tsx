import React, { FC, useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Switch,
  StyleSheet,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import StepContainer from "@/app/upload/Welcome";
import { FormContext } from "@/contextStore/FormContext";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import {
  PROPERTY_UPLOAD_TOTAL_STEPS,
  buildDisabledReason,
} from "@/utils/propertyTypes";

type RentType = "daily" | "weekly" | "monthly";
type BillType = "electricity" | "water" | "gas";

const ALL_BILLS: BillType[] = ["electricity", "water", "gas"];
const MIN_RENT = 100;

const HostelRentScreen: FC = () => {
  const context = useContext(FormContext);

  if (!context) {
    throw new Error(
      "HostelRentScreen must be used within a HostelFormProvider",
    );
  }

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
    data.ALL_BILLS ?? [],
  );

  const [defaultRentType, setDefaultRentType] = useState<RentType>(
    data.defaultRentType ?? "monthly",
  );

  useEffect(() => {
    setRents({
      daily: data.dailyRent ?? 0,
      weekly: data.weeklyRent ?? 0,
      monthly: data.monthlyRent ?? 0,
    });

    setOffer({
      daily: !!data.dailyRent,
      weekly: !!data.weeklyRent,
      monthly: !!data.monthlyRent,
    });

    setIncludedBills(data.ALL_BILLS ?? []);
    setDefaultRentType(data.defaultRentType ?? "monthly");
  }, [data]);

  const handleRentChange = (text: string, type: RentType) => {
    const numericValue = Number(text.replace(/[^0-9]/g, ""));
    if (!isNaN(numericValue)) {
      setRents((prev) => ({ ...prev, [type]: numericValue }));
    }
  };

  const handleOfferToggle = (type: RentType, value: boolean) => {
    const nextOffer = { ...offer, [type]: value };
    setOffer(nextOffer);

    if (!value && defaultRentType === type) {
      const fallbackType =
        (["monthly", "weekly", "daily"] as RentType[]).find(
          (rentType) => rentType !== type && nextOffer[rentType],
        ) ?? "monthly";

      setDefaultRentType(fallbackType);
    }
  };

  const handleBillToggle = (bill: BillType, value: boolean) => {
    setIncludedBills((prev) =>
      value ? [...new Set([...prev, bill])] : prev.filter((b) => b !== bill),
    );
  };

  const handleNext = () => {
    updateForm("dailyRent", offer.daily ? rents.daily : undefined);
    updateForm("weeklyRent", offer.weekly ? rents.weekly : undefined);
    updateForm("monthlyRent", offer.monthly ? rents.monthly : undefined);
    updateForm("defaultRentType", defaultRentType);
    updateForm("ALL_BILLS", includedBills);

    router.push("/upload/hostelForm/SafetyDetailsScreen");
  };

  const isNextDisabled =
    !Object.values(offer).some(Boolean) ||
    (offer.daily && rents.daily < MIN_RENT) ||
    (offer.weekly && rents.weekly < MIN_RENT) ||
    (offer.monthly && rents.monthly < MIN_RENT);

  const nextDisabledReason = buildDisabledReason([
    !Object.values(offer).some(Boolean)
      ? "Enable at least one rent option to continue."
      : undefined,
    offer.daily && rents.daily < MIN_RENT
      ? `Daily rent must be at least ${MIN_RENT} PKR.`
      : undefined,
    offer.weekly && rents.weekly < MIN_RENT
      ? `Weekly rent must be at least ${MIN_RENT} PKR.`
      : undefined,
    offer.monthly && rents.monthly < MIN_RENT
      ? `Monthly rent must be at least ${MIN_RENT} PKR.`
      : undefined,
  ]);

  return (
    <StepContainer
      title="Set your hostel rent"
      onNext={handleNext}
      isNextDisabled={isNextDisabled}
      progress={88}
      nextDisabledReason={nextDisabledReason}
      stepNumber={9}
      totalSteps={PROPERTY_UPLOAD_TOTAL_STEPS}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardWrapper}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: currentTheme.card,
                borderColor: currentTheme.border,
                shadowColor: currentTheme.shadow,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              Set rent and toggle availability
            </Text>

            <Text
              style={[styles.sectionSubtitle, { color: currentTheme.muted }]}
            >
              Choose which rent options you want to offer and enter the amount
              for each active type.
            </Text>

            {(["daily", "weekly", "monthly"] as RentType[]).map((type) => {
              const enabled = offer[type];
              const hasValidationIssue = enabled && rents[type] < MIN_RENT;

              return (
                <View
                  key={type}
                  style={[
                    styles.rentCard,
                    {
                      backgroundColor: currentTheme.background,
                      borderColor: hasValidationIssue
                        ? currentTheme.error
                        : currentTheme.border,
                    },
                  ]}
                >
                  <View style={styles.rentTopRow}>
                    <View style={styles.rentTextWrap}>
                      <Text
                        style={[styles.rentLabel, { color: currentTheme.text }]}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                      <Text
                        style={[
                          styles.rentHelper,
                          { color: currentTheme.muted },
                        ]}
                      >
                        {enabled
                          ? `Minimum ${MIN_RENT} PKR`
                          : "Turn on to enable this rent option"}
                      </Text>
                    </View>

                    <Switch
                      value={enabled}
                      onValueChange={(val) => handleOfferToggle(type, val)}
                      trackColor={{
                        false: currentTheme.border,
                        true: currentTheme.primary,
                      }}
                      thumbColor={
                        Platform.OS === "ios"
                          ? currentTheme.card
                          : currentTheme.primary
                      }
                    />
                  </View>

                  {enabled && (
                    <View
                      style={[
                        styles.rentInputWrapper,
                        {
                          borderColor: hasValidationIssue
                            ? currentTheme.error
                            : currentTheme.border,
                          backgroundColor: currentTheme.card,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.rentInputPrefix,
                          { color: currentTheme.muted },
                        ]}
                      >
                        PKR
                      </Text>
                      <TextInput
                        keyboardType="numeric"
                        value={rents[type] ? String(rents[type]) : ""}
                        onChangeText={(text) => handleRentChange(text, type)}
                        style={[styles.rentInput, { color: currentTheme.text }]}
                        placeholder="Enter amount"
                        placeholderTextColor={currentTheme.muted}
                      />
                    </View>
                  )}
                </View>
              );
            })}

            {nextDisabledReason ? (
              <Text style={[styles.errorText, { color: currentTheme.error }]}>
                {nextDisabledReason}
              </Text>
            ) : null}
          </View>

          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: currentTheme.card,
                borderColor: currentTheme.border,
                shadowColor: currentTheme.shadow,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              Default displayed rent
            </Text>

            <Text
              style={[styles.sectionSubtitle, { color: currentTheme.muted }]}
            >
              This decides which rent type appears first across listings and
              property details.
            </Text>

            <View style={styles.priorityWrap}>
              {(["daily", "weekly", "monthly"] as RentType[]).map((type) => {
                const disabled = !offer[type] || rents[type] < MIN_RENT;
                const active = defaultRentType === type;

                return (
                  <TouchableOpacity
                    key={type}
                    activeOpacity={0.85}
                    disabled={disabled}
                    onPress={() => {
                      if (!disabled) {
                        setDefaultRentType(type);
                      }
                    }}
                    style={[
                      styles.priorityChip,
                      {
                        backgroundColor: active
                          ? currentTheme.primary
                          : currentTheme.background,
                        borderColor: active
                          ? currentTheme.primary
                          : currentTheme.border,
                        opacity: disabled ? 0.45 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityChipText,
                        {
                          color: active ? "#fff" : currentTheme.text,
                        },
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: currentTheme.card,
                borderColor: currentTheme.border,
                shadowColor: currentTheme.shadow,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              Bills included in rent
            </Text>

            <Text
              style={[styles.sectionSubtitle, { color: currentTheme.muted }]}
            >
              Select the utility bills that are already included in the rent.
            </Text>

            {ALL_BILLS.map((bill, index) => (
              <View
                key={bill}
                style={[
                  styles.billRow,
                  {
                    borderBottomColor: currentTheme.border,
                    borderBottomWidth:
                      index === ALL_BILLS.length - 1
                        ? 0
                        : StyleSheet.hairlineWidth,
                  },
                ]}
              >
                <Text style={[styles.billLabel, { color: currentTheme.text }]}>
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
                    Platform.OS === "ios"
                      ? currentTheme.card
                      : currentTheme.primary
                  }
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </StepContainer>
  );
};

export default HostelRentScreen;

const styles = StyleSheet.create({
  keyboardWrapper: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 18,
    paddingBottom: 40,
    gap: 18,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  rentCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  rentTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  rentTextWrap: {
    flex: 1,
  },
  rentLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  rentHelper: {
    fontSize: 12,
    marginTop: 4,
  },
  rentInputWrapper: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 14,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  rentInputPrefix: {
    fontSize: 13,
    fontWeight: "700",
    marginRight: 10,
  },
  rentInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
  },
  errorText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
  },
  priorityWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  priorityChip: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 999,
    borderWidth: 1,
  },
  priorityChipText: {
    fontSize: 13,
    fontWeight: "700",
  },
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  billLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
});
