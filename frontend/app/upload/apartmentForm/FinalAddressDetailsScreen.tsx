import React, { FC, useState, useEffect, useCallback, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
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
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contextStore/ThemeContext";

const ApartmentFinalAddressDetailsScreen: FC = () => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const { data, updateForm, submitData, clearForm } = useContext(FormContext)!;

  const initialAddress: Address = {
    country: "PAKISTAN",
    street: "",
    aptSuiteUnit: "",
    city: "",
    stateTerritory: "",
    zipCode: "",
  };

  const toArray = (addr: any): Address[] => {
    if (Array.isArray(addr)) return addr;
    if (addr && typeof addr === "object") return [addr];
    return [initialAddress];
  };

  const [addresses, setAddresses] = useState<Address[]>(toArray(data?.address));

  const [errors, setErrors] = useState<AddressErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAddresses(toArray(data?.address));
  }, [data?.address]);

  const handleChange = useCallback(
    (index: number, field: keyof Address, value: string) => {
      setAddresses((prev) =>
        prev.map((addr, i) =>
          i === index ? { ...addr, [field]: value } : addr,
        ),
      );

      setErrors((prev: any) => ({
        ...prev,
        [index]: { ...prev[index], [field]: undefined },
      }));
    },
    [],
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

    setLoading(true);

    updateForm("address", addresses);

    const result = await submitData({ ...data, address: addresses });

    if (result.success) {
      Toast.show({
        type: "success",
        text1: "Property listed successfully!",
      });
      setTimeout(() => {
        router.replace("/MyListingsScreen");
        clearForm();
        setLoading(false);
      }, 1500);
    } else {
      setLoading(false);
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
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              Residential Addresses
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
                  value={address.street || ""}
                  onChange={(text) => handleChange(index, "street", text)}
                  themeColors={currentTheme.text}
                />

                <InputField
                  label="Apt, suite, unit (if applicable)"
                  value={address.aptSuiteUnit || ""}
                  onChange={(text) => handleChange(index, "aptSuiteUnit", text)}
                  themeColors={currentTheme.text}
                />

                <InputField
                  label="City / town"
                  value={address.city || ""}
                  onChange={(text) => handleChange(index, "city", text)}
                  themeColors={currentTheme.text}
                />

                <InputField
                  label="State / territory"
                  value={address.stateTerritory || ""}
                  onChange={(text) =>
                    handleChange(index, "stateTerritory", text)
                  }
                  themeColors={currentTheme.text}
                />

                <InputField
                  label="ZIP code"
                  value={address.zipCode || ""}
                  onChange={(text) => handleChange(index, "zipCode", text)}
                  themeColors={currentTheme.text}
                />
              </View>
            ))}

            <TouchableOpacity
              onPress={() => setAddresses((prev) => [...prev, initialAddress])}
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

export default ApartmentFinalAddressDetailsScreen;
