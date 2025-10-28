import React, { useContext, useState, useEffect } from "react";
import { View, Text, TextInput, Keyboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StepContainer from "./Welcome";
import { useRouter } from "expo-router";
import { styles } from "@/styles/Location";
import { FormContext } from "@/contextStore/FormContext";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";

const LocationScreen = () => {
  const formContext = useContext(FormContext);
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  if (!formContext) {
    throw new Error(
      "FormContext is missing! Make sure LocationScreen is wrapped in <FormProvider>."
    );
  }

  const { data, updateForm } = formContext;
  const [address, setAddress] = useState<string>(data.location ?? "");
  const [isFocused, setIsFocused] = useState(false);

  const router = useRouter();

  useEffect(() => {
    updateForm("location", address);
  }, [address]);

  const handleNext = () => {
    if (!address || address.length < 5) return;
    router.push("/upload/PropertyDetails" as `${string}:param`);
  };

  return (
    <StepContainer
      onNext={handleNext}
      isNextDisabled={address.length < 5}
      title="Where's your place located?"
      progress={20}
    >
      <Text style={[styles.subtitle, { color: currentTheme.text }]}>
        Your address is only shared with guests after they&apos;ve made a
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
          placeholder="Enter your address"
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
        {/* <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker coordinate={{ latitude, longitude }} />
        </MapView> */}
        <Text style={[styles.mapCredit, { color: currentTheme.muted }]}>
          © OpenStreetMap contributors
        </Text>
      </View>
    </StepContainer>
  );
};

export default LocationScreen;
