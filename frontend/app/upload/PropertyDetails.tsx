import React, { useState, FC, useContext } from "react";
import { Text, View } from "react-native";
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

  const [capacity, setCapacity] = useState<CapacityState>(
    data.capacityState || { persons: 1, bedrooms: 0, beds: 1, bathrooms: 1 }
  );

  const updateCapacity = (
    key: keyof CapacityState,
    action: "increment" | "decrement"
  ) => {
    setCapacity((prev) => {
      const newValue = action === "increment" ? prev[key] + 1 : prev[key] - 1;
      return { ...prev, [key]: newValue };
    });
  };

  const handleNext = () => {
    updateForm("capacityState", capacity);
    router.push("/upload/AmenitiesScreen");
  };

  const isNextDisabled = capacity.persons < 1 || capacity.beds < 1;

  return (
    <StepContainer
      title="Share some basics about your place"
      onNext={handleNext}
      isNextDisabled={isNextDisabled}
      progress={25}
    >
      <Text style={[styles.subtitle, { color: currentTheme.text }]}>
        You&apos;ll add more details later, like bed types.
      </Text>

      <View style={styles.listContainer}>
        <CounterInput
          label="persons"
          value={capacity.persons}
          minValue={1}
          onIncrement={() => updateCapacity("persons", "increment")}
          onDecrement={() => updateCapacity("persons", "decrement")}
          textColor={currentTheme.text}
          buttonColor={currentTheme.primary}
        />
        <CounterInput
          label="Bedrooms"
          value={capacity.bedrooms}
          minValue={0}
          onIncrement={() => updateCapacity("bedrooms", "increment")}
          onDecrement={() => updateCapacity("bedrooms", "decrement")}
          textColor={currentTheme.text}
          buttonColor={currentTheme.primary}
        />
        <CounterInput
          label="Beds"
          value={capacity.beds}
          minValue={1}
          onIncrement={() => updateCapacity("beds", "increment")}
          onDecrement={() => updateCapacity("beds", "decrement")}
          textColor={currentTheme.text}
          buttonColor={currentTheme.primary}
        />
        <CounterInput
          label="Bathrooms"
          value={capacity.bathrooms}
          minValue={0}
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
