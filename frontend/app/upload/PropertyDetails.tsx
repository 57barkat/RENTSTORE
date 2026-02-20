import React, { useState, FC, useContext } from "react";
import { Text, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import StepContainer from "@/app/upload/Welcome";
import { styles } from "@/styles/PropertyDetails";
import { CapacityState } from "@/types/PropertyDetails.types";
import { CounterInput } from "@/components/UploadPropertyComponents/PropertyCounterInput";
import { FormContext } from "@/contextStore/FormContext";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";

const PropertyDetails: FC = () => {
  const context = useContext(FormContext);
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  if (!context) {
    throw new Error("PropertyDetails must be used within a FormProvider");
  }

  const { data, updateForm } = context;
  const router = useRouter();

  const defaultCapacity: CapacityState = {
    floorLevel: 0,
    bedrooms: 1,
    bathrooms: 1,
  };

  const [capacity, setCapacity] = useState<CapacityState>(() => {
    const c = data.capacityState;
    if (!c || typeof c !== "object") return defaultCapacity;
    return {
      floorLevel: c.floorLevel ?? 0,
      bedrooms: c.bedrooms ?? 1,
      bathrooms: c.bathrooms ?? 1,
    };
  });

  const updateCapacity = (
    key: keyof CapacityState,
    action: "increment" | "decrement",
  ) => {
    setCapacity((prev) => {
      const current = Number(prev[key] ?? 0);
      const newValue = action === "increment" ? current + 1 : current - 1;

      // Fix: Allow floorLevel to be 0, others must be at least 1
      const minLimit = key === "floorLevel" ? 0 : 1;

      return { ...prev, [key]: Math.max(newValue, minLimit) };
    });
  };

  const handleNext = () => {
    updateForm("capacityState", capacity);
    router.push("/upload/AmenitiesScreen");
  };

  const isNextDisabled = capacity.bedrooms < 1 || capacity.bathrooms < 1;

  return (
    <StepContainer
      title="Share the basic layout of your house"
      onNext={handleNext}
      isNextDisabled={isNextDisabled}
      progress={25}
    >
      <Text style={[styles.subtitle, { color: currentTheme.text }]}>
        Just the structural details for now. No furniture needed.
      </Text>

      <View style={styles.listContainer}>
        <View style={{ marginBottom: 10 }}>
          <CounterInput
            label="Floor Level"
            value={capacity.floorLevel ?? 0}
            minValue={0}
            onIncrement={() => updateCapacity("floorLevel", "increment")}
            onDecrement={() => updateCapacity("floorLevel", "decrement")}
            textColor={currentTheme.text}
            buttonColor={currentTheme.primary}
          />
          {capacity.floorLevel === 0 && (
            <Text
              style={{
                color: currentTheme.primary,
                fontSize: 12,
                marginLeft: 10,
                marginBottom: -10,
                fontWeight: "600",
              }}
            >
              Note: 0 is considered Ground Floor
            </Text>
          )}
        </View>

        <CounterInput
          label="Bedrooms"
          value={capacity.bedrooms}
          minValue={1}
          onIncrement={() => updateCapacity("bedrooms", "increment")}
          onDecrement={() => updateCapacity("bedrooms", "decrement")}
          textColor={currentTheme.text}
          buttonColor={currentTheme.primary}
        />

        <CounterInput
          label="Bathrooms"
          value={capacity.bathrooms}
          minValue={1}
          onIncrement={() => updateCapacity("bathrooms", "increment")}
          onDecrement={() => updateCapacity("bathrooms", "decrement")}
          textColor={currentTheme.text}
          buttonColor={currentTheme.primary}
        />
      </View>
    </StepContainer>
  );
};

export default PropertyDetails;
