import React, { FC, useState, useCallback, useContext } from "react";
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

const COUNTRIES = ["PAKISTAN"];

const FinalAddressDetailsScreen: FC = () => {
  const { updateForm, data } = useContext(FormContext)!;

  const [address, setAddress] = useState<Address>(
    data.address ?? {
      country: "PAKISTAN",
      street: "",
      aptSuiteUnit: "",
      city: "",
      stateTerritory: "",
      zipCode: "",
    }
  );

  const handleChange = useCallback((field: keyof Address, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleNext = () => {
    updateForm("address", address);
    Alert.alert("Success", "Address saved! Proceeding to final review.");
  };

  const isNextDisabled = !(
    address.street.trim() &&
    address.city.trim() &&
    address.stateTerritory.trim() &&
    address.zipCode.trim()
  );

  return (
    <StepContainer
      title="Provide a few final details"
      onNext={handleNext}
      isNextDisabled={isNextDisabled}
      progress={100}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <Text style={styles.sectionTitle}>
            What&apos;s your residential address?
          </Text>
          <Text style={styles.sectionSubtitle}>
            Guests won&apos;t see this information.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Country / region</Text>
            <View style={styles.countryPicker}>
              {COUNTRIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => handleChange("country", c)}
                  style={[
                    styles.countryOption,
                    address.country === c && styles.countrySelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.countryText,
                      address.country === c && styles.countryTextSelected,
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <InputField
            label="Street address"
            value={address.street}
            onChange={(text) => handleChange("street", text)}
          />
          <InputField
            label="Apt, suite, unit (if applicable)"
            value={address.aptSuiteUnit}
            onChange={(text) => handleChange("aptSuiteUnit", text)}
          />
          <InputField
            label="City / town"
            value={address.city}
            onChange={(text) => handleChange("city", text)}
          />
          <InputField
            label="State / territory"
            value={address.stateTerritory}
            onChange={(text) => handleChange("stateTerritory", text)}
          />
          <InputField
            label="ZIP code"
            value={address.zipCode}
            onChange={(text) => handleChange("zipCode", text)}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </StepContainer>
  );
};

export default FinalAddressDetailsScreen;
