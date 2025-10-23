import React, { FC, useContext, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import StepContainer from "@/app/upload/Welcome";
import { styles } from "@/styles/FinalAddressDetailsScreen";
import { Address } from "@/types/FinalAddressDetailsScreen.types";
import { InputField } from "@/components/UploadPropertyComponents/AdderssInputField";
import { FormContext } from "@/contextStore/FormContext";
import { validateAddresses, AddressErrors } from "@/utils/propertyValidator";
import Toast from "react-native-toast-message";
import { router } from "expo-router";

const FinalAddressDetailsScreen: FC = () => {
  const { data, updateForm, submitData } = useContext(FormContext)!;

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
  const [loading, setLoading] = useState(false);

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

  const handleFinish = async () => {
    if (loading) return;
    setLoading(true);

    const { valid, errors } = validateAddresses(addresses);
    setErrors(errors);

    if (!valid) {
      Alert.alert("Validation Error", "Please correct the highlighted fields.");
      setLoading(false);
      return;
    }

    updateForm("address", addresses);
    const result = await submitData();

    if (result.success) {
      Toast.show({ type: "success", text1: "Property uploaded successfully!" });
      setTimeout(() => router.replace("/MyListingsScreen"), 1500);
    } else {
      Toast.show({
        type: "error",
        text1: "Upload failed",
        text2: "Please try again later.",
      });
    }

    setLoading(false);
  };

  const handleNext = () => {
    const { valid, errors } = validateAddresses(addresses);
    setErrors(errors);

    if (!valid) {
      Alert.alert("Validation Error", "Please correct the highlighted fields.");
      return;
    }

    updateForm("address", addresses);
    handleFinish();
  };

  return (
    <View style={{ flex: 1 }}>
      <StepContainer
        title="Provide a few final details"
        onNext={handleNext}
        isNextDisabled={loading}
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
                  onChange={(text) =>
                    handleChange(index, "stateTerritory", text)
                  }
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
              disabled={loading}
            >
              <Text
                style={{
                  color: loading ? "#999" : "#007AFF",
                  textAlign: "center",
                  marginTop: 10,
                }}
              >
                + Add Another Address
              </Text>
            </TouchableOpacity>

            <Toast />
          </ScrollView>
        </KeyboardAvoidingView>
      </StepContainer>

      {/* ✅ Fullscreen loading overlay */}
      {loading && (
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
            Uploading your property...
          </Text>
        </View>
      )}
    </View>
  );
};

export default FinalAddressDetailsScreen;
