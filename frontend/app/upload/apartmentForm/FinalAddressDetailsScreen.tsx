import React, { FC, useState, useEffect, useCallback, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import StepContainer from "@/app/upload/Welcome";
import { styles } from "@/styles/FinalAddressDetailsScreen";
import { Address } from "@/types/FinalAddressDetailsScreen.types";
import { InputField } from "@/components/UploadPropertyComponents/AdderssInputField";
import { validateAddresses, AddressErrors } from "@/utils/propertyValidator";
import Toast from "react-native-toast-message";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contextStore/ThemeContext";
import { FormContext } from "@/contextStore/FormContext";


const ApartmentFinalAddressDetailsScreen: FC = () => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const context = useContext(FormContext);
  if (!context)
    throw new Error(
      "ApartmentFinalAddressDetailsScreen must be used within an FormContext"
    );

  const { data, updateForm, submitData } = context;

  const initialAddress: Address = {
    country: "PAKISTAN",
    street: "",
    aptSuiteUnit: "",
    city: "",
    stateTerritory: "",
    zipCode: "",
  };

  const [addresses, setAddresses] = useState<Address[]>(
    data.address?.length ? data.address : [initialAddress]
  );
  const [errors, setErrors] = useState<AddressErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!data.address || data.address.length === 0) {
      setAddresses([initialAddress]);
    } else {
      setAddresses(data.address);
    }
  }, [data.address]);

  const handleChange = useCallback(
    (index: number, field: keyof Address, value: string) => {
      setAddresses((prev) =>
        prev.map((addr, i) =>
          i === index ? { ...addr, [field]: value } : addr
        )
      );
      setErrors((prev: any) => ({
        ...prev,
        [index]: { ...prev[index], [field]: undefined },
      }));
    },
    []
  );

  const handleNext = async () => {
    const { valid, errors } = validateAddresses(addresses);
    setErrors(errors);

    if (!valid) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please correct the highlighted fields.",
      });
      return;
    }

    // Pass latest addresses directly to submit
    const result = await submitData({ ...data, address: addresses });
    updateForm("address", addresses);

    if (result.success) {
      Toast.show({
        type: "success",
        text1: "Apartment listed successfully!",
      });
      setTimeout(() => router.replace("/MyListingsScreen"), 1500);
    } else {
      Toast.show({
        type: "error",
        text1: "Upload failed",
        text2: "Please try again later.",
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <StepContainer
        title="This is the final stage to submit your apartment listing"
        onNext={handleNext}
        isNextDisabled={loading}
        progress={100}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              Apartment Address
            </Text>

            {addresses.map((address, index) => (
              <View key={index} style={{ marginBottom: 25 }}>
                <Text
                  style={[styles.sectionSubtitle, { color: currentTheme.text }]}
                >
                  Address {index + 1}
                </Text>

                <InputField
                  label="Street address"
                  value={address.street}
                  onChange={(text) => handleChange(index, "street", text)}
                  themeColors={currentTheme}
                />
                {errors[index]?.street && (
                  <Text style={styles.errorText}>{errors[index]?.street}</Text>
                )}

                <InputField
                  label="Apartment / Suite / Unit"
                  value={address.aptSuiteUnit}
                  onChange={(text) => handleChange(index, "aptSuiteUnit", text)}
                  themeColors={currentTheme}
                />

                <InputField
                  label="City"
                  value={address.city}
                  onChange={(text) => handleChange(index, "city", text)}
                  themeColors={currentTheme}
                />
                {errors[index]?.city && (
                  <Text style={styles.errorText}>{errors[index]?.city}</Text>
                )}

                <InputField
                  label="State / Territory"
                  value={address.stateTerritory}
                  onChange={(text) =>
                    handleChange(index, "stateTerritory", text)
                  }
                  themeColors={currentTheme}
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
                  themeColors={currentTheme}
                />
                {errors[index]?.zipCode && (
                  <Text style={styles.errorText}>{errors[index]?.zipCode}</Text>
                )}
              </View>
            ))}

            <Toast />
          </ScrollView>
        </KeyboardAvoidingView>
      </StepContainer>

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
            Uploading your apartment...
          </Text>
        </View>
      )}
    </View>
  );
};

export default ApartmentFinalAddressDetailsScreen;
