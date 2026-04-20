import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

import StepContainer from "@/app/upload/Welcome";
import { InputField } from "@/components/UploadPropertyComponents/AdderssInputField";
import { Colors } from "@/constants/Colors";
import { FormContext } from "@/contextStore/FormContext";
import { useTheme } from "@/contextStore/ThemeContext";
import { styles } from "@/styles/FinalAddressDetailsScreen";
import { Address } from "@/types/FinalAddressDetailsScreen.types";
import { validateAddresses } from "@/utils/propertyValidator";
import {
  PROPERTY_UPLOAD_TOTAL_STEPS,
  getPropertyTypeLabel,
} from "@/utils/propertyTypes";

const initialAddress: Address = {
  country: "PAKISTAN",
  street: "",
  aptSuiteUnit: "",
  city: "",
  stateTerritory: "",
  zipCode: "",
};

const toArray = (addr: unknown): Address[] => {
  if (Array.isArray(addr)) {
    return addr as Address[];
  }

  if (addr && typeof addr === "object") {
    return [addr as Address];
  }

  return [initialAddress];
};

const FinalAddressDetailsScreen: FC = () => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const { data, updateForm, submitData, clearForm } = useContext(FormContext)!;
  const propertyLabel = getPropertyTypeLabel(data.hostOption).toLowerCase();

  const [addresses, setAddresses] = useState<Address[]>(toArray(data?.address));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAddresses(toArray(data?.address));
  }, [data?.address]);

  const validation = useMemo(() => validateAddresses(addresses), [addresses]);
  const firstError = Object.values(validation.errors)
    .flatMap((entry) => Object.values(entry))
    .find((value): value is string => Boolean(value));

  const handleChange = useCallback(
    (index: number, field: keyof Address, value: string) => {
      setAddresses((prev) =>
        prev.map((addr, currentIndex) =>
          currentIndex === index ? { ...addr, [field]: value } : addr,
        ),
      );
    },
    [],
  );

  const handleNext = async () => {
    if (!validation.valid) {
      Toast.show({
        type: "error",
        text1: "Address details missing",
        text2: "Please correct the highlighted fields before publishing.",
      });
      return;
    }

    setLoading(true);
    updateForm("address", addresses);

    const result = await submitData({
      ...data,
      address: addresses,
      status: true,
    });

    setLoading(false);

    if (result.success) {
      clearForm();
      Toast.show({
        type: "success",
        text1: "Property queued successfully",
        text2: "Uploads will continue in the background.",
      });
      router.replace("/MyListingsScreen");
      return;
    }

    Toast.show({
      type: "error",
      text1: "Queueing failed",
      text2: "Please try again later.",
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <StepContainer
        title={`Review your ${propertyLabel} address`}
        onNext={handleNext}
        isNextDisabled={loading || !validation.valid}
        nextDisabledReason={
          loading
            ? "Publishing your property now."
            : firstError || "Complete the address fields before publishing."
        }
        progress={100}
        stepNumber={11}
        totalSteps={PROPERTY_UPLOAD_TOTAL_STEPS}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              Property address
            </Text>
            <Text
              style={[
                styles.sectionSubtitle,
                { color: currentTheme.muted, marginBottom: 18 },
              ]}
            >
              Double-check these details before publishing. We&apos;ll use them
              to verify the listing and improve search accuracy.
            </Text>

            {addresses.map((address, index) => {
              const fieldErrors = validation.errors[index] || {};

              return (
                <View key={index} style={{ marginBottom: 25 }}>
                  <Text
                    style={[
                      styles.sectionSubtitle,
                      { color: currentTheme.text, fontWeight: "700" },
                    ]}
                  >
                    Address {index + 1}
                  </Text>

                  <InputField
                    label="Street address"
                    value={address.street || ""}
                    onChange={(text) => handleChange(index, "street", text)}
                    themeColors={currentTheme}
                    error={fieldErrors.street}
                    isInvalid={Boolean(fieldErrors.street)}
                  />

                  <InputField
                    label="Apt, suite, unit (if applicable)"
                    value={address.aptSuiteUnit || ""}
                    onChange={(text) =>
                      handleChange(index, "aptSuiteUnit", text)
                    }
                    themeColors={currentTheme}
                  />

                  <InputField
                    label="City / town"
                    value={address.city || ""}
                    onChange={(text) => handleChange(index, "city", text)}
                    themeColors={currentTheme}
                    error={fieldErrors.city}
                    isInvalid={Boolean(fieldErrors.city)}
                  />

                  <InputField
                    label="State / territory"
                    value={address.stateTerritory || ""}
                    onChange={(text) =>
                      handleChange(index, "stateTerritory", text)
                    }
                    themeColors={currentTheme}
                    error={fieldErrors.stateTerritory}
                    isInvalid={Boolean(fieldErrors.stateTerritory)}
                  />

                  <InputField
                    label="ZIP code"
                    value={address.zipCode || ""}
                    onChange={(text) => handleChange(index, "zipCode", text)}
                    themeColors={currentTheme}
                    error={fieldErrors.zipCode}
                    isInvalid={Boolean(fieldErrors.zipCode)}
                  />
                </View>
              );
            })}

            <TouchableOpacity
              onPress={() => setAddresses((prev) => [...prev, initialAddress])}
              disabled={loading}
            >
              <Text
                style={{
                  color: loading ? "#999" : currentTheme.primary,
                  textAlign: "center",
                  marginTop: 10,
                  fontWeight: "600",
                }}
              >
                + Add Another Address
              </Text>
            </TouchableOpacity>

            <Toast />
          </ScrollView>
        </KeyboardAvoidingView>
      </StepContainer>

      {loading ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "#fff", marginTop: 10, fontSize: 16 }}>
            Queueing your property...
          </Text>
        </View>
      ) : null}
    </View>
  );
};

export default FinalAddressDetailsScreen;
