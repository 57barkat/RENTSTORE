import React, { useContext, useState, useEffect } from "react";
import { View, Text, TextInput, Keyboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StepContainer from "./Welcome";
import { useRouter } from "expo-router";
import { styles } from "@/styles/Location";
import { FormContext } from "@/contextStore/FormContext";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { Address } from "@/types/FinalAddressDetailsScreen.types";

const LocationScreen = () => {
  const formContext = useContext(FormContext);
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const router = useRouter();

  if (!formContext) {
    throw new Error(
      "FormContext is missing! Make sure LocationScreen is wrapped in <FormProvider>."
    );
  }

  const { data, updateForm } = formContext;

  // Initialize as Address object
  const [address, setAddress] = useState<Address>(
    data.location ?? {
      city: "",
      street: "",
      aptSuiteUnit: "",
      stateTerritory: "",
      zipCode: "",
      country: "PAKISTAN",
    }
  );

  const [isFocused, setIsFocused] = useState(false);

  // Update form context whenever address changes
  useEffect(() => {
    updateForm("location", address);
  }, [address]);

  const handleNext = () => {
    if (!address.street || address.street.length < 5) return;
    router.push("/upload/PropertyDetails" as `${string}:param`);
  };

  return (
    <StepContainer
      onNext={handleNext}
      isNextDisabled={!address.street || address.street.length < 5}
      title="Where's your place located?"
      progress={20}
    >
      <Text style={[styles.subtitle, { color: currentTheme.text }]}>
        Your address is only shared with persons after they&apos;ve made a
        reservation.
      </Text>

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focusedInput,
          {
            backgroundColor: currentTheme.card,
            borderColor: currentTheme.border,
          },
        ]}
      >
        <Ionicons
          name="location-sharp"
          size={20}
          color={currentTheme.primary}
        />
        <TextInput
          placeholder="Enter your street address"
          placeholderTextColor={currentTheme.muted}
          value={address.street}
          onChangeText={(text) =>
            setAddress((prev) => ({ ...prev, street: text }))
          }
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.input, { color: currentTheme.text }]}
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
        />
      </View>

      <View style={styles.mapContainer}>
        {/* Map placeholder */}
        <Text style={[styles.mapCredit, { color: currentTheme.muted }]}>
          © OpenStreetMap contributors
        </Text>
      </View>
    </StepContainer>
  );
};

export default LocationScreen;
