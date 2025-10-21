import React, { useState, FC, useContext } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import StepContainer from "@/app/upload/Welcome";
import { styles } from "@/styles/PropertyDetails";
import { CapacityState } from "@/types/PropertyDetails.types";
import { CounterInput } from "@/components/UploadPropertyComponents/PropertyCounterInput";
import { FormContext } from "@/contextStore/FormContext";

const PropertyDetails: FC = () => {
  const context = useContext(FormContext);

  if (!context) {
    throw new Error("PropertyDetails must be used within a FormProvider");
  }

  const { data, updateForm } = context;
  const router = useRouter();

  const [capacity, setCapacity] = useState<CapacityState>(
    data.capacityState || {
      guests: 1,
      bedrooms: 0,
      beds: 1,
      bathrooms: 1,
    }
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

  // ... inside PropertyDetails component

  const handleNext = () => {
    // Save the current capacity state to the global context before navigating
    updateForm("capacityState", capacity); // Assuming you meant 'updateForm'
    router.push("/upload/AmenitiesScreen");
  };

  const isNextDisabled = capacity.guests < 1 || capacity.beds < 1;

  return (
    <StepContainer
      title="Share some basics about your place"
      onNext={handleNext}
      isNextDisabled={isNextDisabled}
      progress={25}
    >
      <Text style={styles.subtitle}>
        You&apos;ll add more details later, like bed types.
      </Text>

      <View style={styles.listContainer}>
        <CounterInput
          label="Guests"
          value={capacity.guests}
          minValue={1} // Minimum guest is typically 1
          onIncrement={() => updateCapacity("guests", "increment")}
          onDecrement={() => updateCapacity("guests", "decrement")}
        />
        <CounterInput
          label="Bedrooms"
          value={capacity.bedrooms}
          minValue={0}
          onIncrement={() => updateCapacity("bedrooms", "increment")}
          onDecrement={() => updateCapacity("bedrooms", "decrement")}
        />
        <CounterInput
          label="Beds"
          value={capacity.beds}
          minValue={1} // Minimum beds is typically 1
          onIncrement={() => updateCapacity("beds", "increment")}
          onDecrement={() => updateCapacity("beds", "decrement")}
        />
        <CounterInput
          label="Bathrooms"
          value={capacity.bathrooms}
          minValue={0}
          onIncrement={() => updateCapacity("bathrooms", "increment")}
          onDecrement={() => updateCapacity("bathrooms", "decrement")}
        />
      </View>
    </StepContainer>
  );
};

export default PropertyDetails;
