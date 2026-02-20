import React, { FC, useContext, useState } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import StepContainer from "@/app/upload/Welcome";
import { styles as globalStyles } from "@/styles/PropertyDetails";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { FormContext, FormData } from "@/contextStore/FormContext";
import { CounterInput } from "@/components/UploadPropertyComponents/PropertyCounterInput";

const ApartmentPropertyDetails: FC = () => {
  const context = useContext(FormContext);
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const router = useRouter();

  if (!context)
    throw new Error(
      "ApartmentPropertyDetails must be used within an ApartmentFormProvider",
    );

  const { data, updateForm } = context;

  const [apartmentType, setApartmentType] = useState<FormData["apartmentType"]>(
    data.apartmentType ?? "1BHK",
  );

  const [capacityState, setCapacityState] = useState({
    bedrooms: data.capacityState?.bedrooms ?? 1,
    bathrooms: data.capacityState?.bathrooms ?? 1,
    floorLevel: data.capacityState?.floorLevel ?? 0,
  });

  const [furnishing, setFurnishing] = useState<FormData["furnishing"]>(
    data.furnishing ?? "unfurnished",
  );
  const [parking, setParking] = useState<boolean>(data.parking ?? false);

  const handleNext = () => {
    updateForm("apartmentType", apartmentType);
    updateForm("furnishing", furnishing);
    updateForm("parking", parking);
    updateForm("capacityState", capacityState);

    router.push("/upload/apartmentForm/AmenitiesScreen");
  };

  const updateCapacity = (
    key: keyof typeof capacityState,
    type: "inc" | "dec",
  ) => {
    setCapacityState((prev) => {
      const newValue = type === "inc" ? prev[key] + 1 : prev[key] - 1;
      const minLimit = key === "floorLevel" ? 0 : 1;
      return { ...prev, [key]: Math.max(newValue, minLimit) };
    });
  };

  const isNextDisabled =
    !apartmentType || capacityState.bedrooms < 1 || capacityState.bathrooms < 1;

  return (
    <StepContainer
      title="Share the basics about your apartment"
      onNext={handleNext}
      isNextDisabled={isNextDisabled}
      progress={25}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text style={[globalStyles.subtitle, { color: currentTheme.text }]}>
          Add essential details like apartment type, rooms, and facilities.
        </Text>

        {/* Apartment Type Selection */}
        <Text
          style={[
            globalStyles.subtitle,
            { color: currentTheme.text, marginTop: 16 },
          ]}
        >
          Select Apartment Type
        </Text>
        <View style={localStyles.selectionRow}>
          {["studio", "1BHK", "2BHK", "3BHK", "penthouse"].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() =>
                setApartmentType(type as FormData["apartmentType"])
              }
              style={[
                localStyles.selectionButton,
                {
                  backgroundColor:
                    apartmentType === type
                      ? currentTheme.primary
                      : currentTheme.card,
                  borderColor:
                    apartmentType === type
                      ? currentTheme.primary
                      : currentTheme.border,
                },
              ]}
            >
              <Text
                style={{
                  color: apartmentType === type ? "#fff" : currentTheme.text,
                  fontWeight: "bold",
                  fontSize: 13,
                }}
              >
                {type.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Counters */}
        <View style={globalStyles.listContainer}>
          <CounterInput
            label="Bedrooms"
            value={capacityState.bedrooms}
            minValue={1}
            onIncrement={() => updateCapacity("bedrooms", "inc")}
            onDecrement={() => updateCapacity("bedrooms", "dec")}
            textColor={currentTheme.text}
            buttonColor={currentTheme.primary}
          />

          <CounterInput
            label="Bathrooms"
            value={capacityState.bathrooms}
            minValue={1}
            onIncrement={() => updateCapacity("bathrooms", "inc")}
            onDecrement={() => updateCapacity("bathrooms", "dec")}
            textColor={currentTheme.text}
            buttonColor={currentTheme.primary}
          />

          <View style={{ marginBottom: 10 }}>
            <CounterInput
              label="Floor Level"
              value={capacityState.floorLevel}
              minValue={0}
              onIncrement={() => updateCapacity("floorLevel", "inc")}
              onDecrement={() => updateCapacity("floorLevel", "dec")}
              textColor={currentTheme.text}
              buttonColor={currentTheme.primary}
            />
            {capacityState.floorLevel === 0 && (
              <Text
                style={{
                  color: currentTheme.primary,
                  fontSize: 12,
                  marginLeft: 10,
                  marginTop: -20,
                  fontWeight: "600",
                }}
              >
                Note: 0 is considered Ground Floor
              </Text>
            )}
          </View>
        </View>

        {/* Furnishing */}
        <Text
          style={[
            globalStyles.subtitle,
            { color: currentTheme.text, marginTop: 16 },
          ]}
        >
          Furnishing
        </Text>
        <View style={localStyles.selectionRow}>
          {["furnished", "semi-furnished", "unfurnished"].map((furn) => (
            <TouchableOpacity
              key={furn}
              onPress={() => setFurnishing(furn as FormData["furnishing"])}
              style={[
                localStyles.selectionButton,
                {
                  flex: 1,
                  backgroundColor:
                    furnishing === furn
                      ? currentTheme.primary
                      : currentTheme.card,
                  borderColor:
                    furnishing === furn
                      ? currentTheme.primary
                      : currentTheme.border,
                },
              ]}
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={{
                  color: furnishing === furn ? "#fff" : currentTheme.text,
                  fontWeight: "bold",
                  fontSize: 11,
                }}
              >
                {furn.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text
          style={[
            globalStyles.subtitle,
            { color: currentTheme.text, marginTop: 16 },
          ]}
        >
          Parking Available
        </Text>
        <View style={localStyles.selectionRow}>
          {["Yes", "No"].map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => setParking(option === "Yes")}
              style={[
                localStyles.selectionButton,
                {
                  flex: 1,
                  backgroundColor: (option === "Yes" ? parking : !parking)
                    ? currentTheme.primary
                    : currentTheme.card,
                  borderColor: (option === "Yes" ? parking : !parking)
                    ? currentTheme.primary
                    : currentTheme.border,
                },
              ]}
            >
              <Text
                style={{
                  color: (option === "Yes" ? parking : !parking)
                    ? "#fff"
                    : currentTheme.text,
                  fontWeight: "bold",
                }}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </StepContainer>
  );
};

const localStyles = StyleSheet.create({
  selectionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 8,
    gap: 8,
  },
  selectionButton: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
});

export default ApartmentPropertyDetails;
