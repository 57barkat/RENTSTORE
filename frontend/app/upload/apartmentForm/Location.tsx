import React, { useContext, useState, useEffect } from "react";
import { View, Text, TextInput, Keyboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StepContainer from "../Welcome";
import { useRouter } from "expo-router";
import { styles } from "@/styles/Location";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { ApartmentFormContext } from "@/contextStore/ApartmentFormContextType";

const ApartmentLocationScreen = () => {
  const formContext = useContext(ApartmentFormContext);
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  if (!formContext) {
    throw new Error(
      "ApartmentFormContext is missing! Make sure LocationScreen is wrapped in <ApartmentFormProvider>."
    );
  }

  const { data, updateForm } = formContext;

  const [address, setAddress] = useState<string>(data.location ?? "");
  const [isFocused, setIsFocused] = useState(false);

  const router = useRouter();

  // ✅ Update apartment location on change
  useEffect(() => {
    updateForm("location", address);
  }, [address]);

  const handleNext = () => {
    if (!address || address.length < 5) return;

    router.push("/upload/apartmentForm/PropertyDetails" as `${string}:param`);
  };

  return (
    <StepContainer
      onNext={handleNext}
      isNextDisabled={address.length < 5}
      title="Where's your apartment located?"
      progress={20}
    >
      <Text style={[styles.subtitle, { color: currentTheme.text }]}>
        Your apartment address is shown to guests only after a confirmed
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
          placeholder="Enter your apartment address"
          placeholderTextColor={currentTheme.muted}
          value={address}
          onChangeText={setAddress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.input, { color: currentTheme.text }]}
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
        />
      </View>

      <View style={styles.mapContainer}>
        <Text style={[styles.mapCredit, { color: currentTheme.muted }]}>
          © OpenStreetMap contributors
        </Text>
      </View>
    </StepContainer>
  );
};

export default ApartmentLocationScreen;
