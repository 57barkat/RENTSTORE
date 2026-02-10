import React, { FC, useContext, useState } from "react";
import { Text, View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import StepContainer from "@/app/upload/Welcome";
import { styles } from "@/styles/PropertyDetails";
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

  // ✅ Use capacityState object for rooms and floor
  const [apartmentType, setApartmentType] = useState<FormData["apartmentType"]>(
    data.apartmentType ?? "1BHK",
  );

  const [capacityState, setCapacityState] = useState({
    bedrooms: data.capacityState?.bedrooms ?? 1,
    bathrooms: data.capacityState?.bathrooms ?? 1,
    floorLevel: data.capacityState?.floorLevel ?? 1,
  });

  const [furnishing, setFurnishing] = useState<FormData["furnishing"]>(
    data.furnishing ?? "unfurnished",
  );
  const [parking, setParking] = useState<boolean>(data.parking ?? false);

  const handleNext = () => {
    updateForm("apartmentType", apartmentType);
    updateForm("furnishing", furnishing);
    updateForm("parking", parking);

    router.push("/upload/apartmentForm/AmenitiesScreen");
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
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, { color: currentTheme.text }]}>
          Add essential details like apartment type, rooms, and facilities.
        </Text>

        {/* Apartment Type Selection */}
        <Text
          style={[styles.subtitle, { color: currentTheme.text, marginTop: 16 }]}
        >
          Select Apartment Type
        </Text>
        <View
          style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 8 }}
        >
          {["studio", "1BHK", "2BHK", "3BHK", "penthouse"].map((type) => (
            <View
              key={type}
              style={{
                flex: 1,
                padding: 12,
                marginHorizontal: 4,
                marginVertical: 4,
                borderRadius: 8,
                backgroundColor:
                  apartmentType === type
                    ? currentTheme.primary
                    : currentTheme.card,
                alignItems: "center",
              }}
            >
              <Text
                onPress={() =>
                  setApartmentType(type as FormData["apartmentType"])
                }
                style={{
                  color: apartmentType === type ? "#fff" : currentTheme.text,
                  fontWeight: "bold",
                }}
              >
                {type.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>

        {/* Counters */}
        <View style={styles.listContainer}>
          <CounterInput
            label="Bedrooms"
            value={capacityState.bedrooms}
            minValue={1}
            onIncrement={() =>
              setCapacityState((prev) => ({
                ...prev,
                bedrooms: prev.bedrooms + 1,
              }))
            }
            onDecrement={() =>
              setCapacityState((prev) => ({
                ...prev,
                bedrooms: prev.bedrooms - 1,
              }))
            }
            textColor={currentTheme.text}
            buttonColor={currentTheme.primary}
          />

          <CounterInput
            label="Bathrooms"
            value={capacityState.bathrooms}
            minValue={1}
            onIncrement={() =>
              setCapacityState((prev) => ({
                ...prev,
                bathrooms: prev.bathrooms + 1,
              }))
            }
            onDecrement={() =>
              setCapacityState((prev) => ({
                ...prev,
                bathrooms: prev.bathrooms - 1,
              }))
            }
            textColor={currentTheme.text}
            buttonColor={currentTheme.primary}
          />

          <CounterInput
            label="Floor Level"
            value={capacityState.floorLevel}
            minValue={1}
            onIncrement={() =>
              setCapacityState((prev) => ({
                ...prev,
                floorLevel: prev.floorLevel + 1,
              }))
            }
            onDecrement={() =>
              setCapacityState((prev) => ({
                ...prev,
                floorLevel: prev.floorLevel - 1,
              }))
            }
            textColor={currentTheme.text}
            buttonColor={currentTheme.primary}
          />
        </View>

        {/* Furnishing */}
        <Text
          style={[styles.subtitle, { color: currentTheme.text, marginTop: 16 }]}
        >
          Furnishing
        </Text>
        <View style={{ flexDirection: "row", marginVertical: 8 }}>
          {["furnished", "semi-furnished", "unfurnished"].map((furn) => (
            <View
              key={furn}
              style={{
                flex: 1,
                padding: 12,
                marginHorizontal: 4,
                borderRadius: 8,
                backgroundColor:
                  furnishing === furn
                    ? currentTheme.primary
                    : currentTheme.card,
                alignItems: "center",
              }}
            >
              <Text
                onPress={() => setFurnishing(furn as FormData["furnishing"])}
                style={{
                  color: furnishing === furn ? "#fff" : currentTheme.text,
                  fontWeight: "bold",
                }}
              >
                {furn.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>

        {/* Parking */}
        <Text
          style={[styles.subtitle, { color: currentTheme.text, marginTop: 16 }]}
        >
          Parking Available
        </Text>
        <View style={{ flexDirection: "row", marginVertical: 8 }}>
          {["Yes", "No"].map((option) => (
            <View
              key={option}
              style={{
                flex: 1,
                padding: 12,
                marginHorizontal: 4,
                borderRadius: 8,
                backgroundColor: (option === "Yes" ? parking : !parking)
                  ? currentTheme.primary
                  : currentTheme.card,
                alignItems: "center",
              }}
            >
              <Text
                onPress={() => setParking(option === "Yes")}
                style={{
                  color: (option === "Yes" ? parking : !parking)
                    ? "#fff"
                    : currentTheme.text,
                  fontWeight: "bold",
                }}
              >
                {option}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </StepContainer>
  );
};

export default ApartmentPropertyDetails;
