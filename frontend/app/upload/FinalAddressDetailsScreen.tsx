import React, { FC, useContext, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import StepContainer from "@/app/upload/Welcome";
import { styles } from "@/styles/FinalAddressDetailsScreen";
import { Address } from "@/types/FinalAddressDetailsScreen.types";
import { InputField } from "@/components/UploadPropertyComponents/AdderssInputField";
import { FormContext } from "@/contextStore/FormContext";
import { validateAddresses, AddressErrors } from "@/utils/propertyValidator";

const COUNTRIES = ["PAKISTAN"];

const FinalAddressDetailsScreen: FC = () => {
  const { data, updateForm } = useContext(FormContext)!;

  const [addresses, setAddresses] = useState<Address[]>(
    data.address ?? [
      {
        country: "PAKISTAN",
        street: "",
        aptSuiteUnit: "",
        city: "",
        stateTerritory: "",
        zipCode: "",
      },
    ]
  );

  const [errors, setErrors] = useState<AddressErrors>({});

  const handleChange = useCallback(
    (index: number, field: keyof Address, value: string) => {
      setAddresses((prev) =>
        prev.map((addr, i) =>
          i === index ? { ...addr, [field]: value } : addr
        )
      );

      // Clear error on change
      setErrors((prev: any) => ({
        ...prev,
        [index]: { ...prev[index], [field]: undefined },
      }));
    },
    []
  );

  const handleNext = () => {
    const { valid, errors } = validateAddresses(addresses);
    setErrors(errors);

    if (!valid) {
      Alert.alert("Validation Error", "Please correct the highlighted fields.");
      return;
    }

    updateForm("address", addresses);
    Alert.alert("Success", "All addresses validated and saved!");
  };

  return (
    <StepContainer
      title="Provide a few final details"
      onNext={handleNext}
      isNextDisabled={false}
      progress={100}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <Text style={styles.sectionTitle}>Residential Addresses</Text>

          {addresses.map((address, index) => (
            <View key={index} style={{ marginBottom: 25 }}>
              <Text style={styles.sectionSubtitle}>Address {index + 1}</Text>

              <InputField
                label="Street address"
                value={address.street}
                onChange={(text) => handleChange(index, "street", text)}
              />
              {errors[index]?.street && (
                <Text style={styles.errorText}>{errors[index]?.street}</Text>
              )}

              <InputField
                label="Apt, suite, unit (if applicable)"
                value={address.aptSuiteUnit}
                onChange={(text) => handleChange(index, "aptSuiteUnit", text)}
              />

              <InputField
                label="City / town"
                value={address.city}
                onChange={(text) => handleChange(index, "city", text)}
              />
              {errors[index]?.city && (
                <Text style={styles.errorText}>{errors[index]?.city}</Text>
              )}

              <InputField
                label="State / territory"
                value={address.stateTerritory}
                onChange={(text) => handleChange(index, "stateTerritory", text)}
              />
              {errors[index]?.stateTerritory && (
                <Text style={styles.errorText}>
                  {errors[index]?.stateTerritory}
                </Text>
              )}

              <InputField
                label="ZIP code"
                value={address.zipCode}
                onChange={(text) => handleChange(index, "zipCode", text)}
              />
              {errors[index]?.zipCode && (
                <Text style={styles.errorText}>{errors[index]?.zipCode}</Text>
              )}
            </View>
          ))}

          <TouchableOpacity
            onPress={() =>
              setAddresses((prev) => [
                ...prev,
                {
                  country: "PAKISTAN",
                  street: "",
                  aptSuiteUnit: "",
                  city: "",
                  stateTerritory: "",
                  zipCode: "",
                },
              ])
            }
          >
            <Text>+ Add Another Address</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </StepContainer>
  );
};

export default FinalAddressDetailsScreen;
