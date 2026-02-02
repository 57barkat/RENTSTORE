import React, { useState, FC, useContext, useEffect } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import StepContainer from "@/app/upload/Welcome";
import { styles } from "@/styles/PropertyDetails";
import { CapacityState } from "@/types/PropertyDetails.types";
import { CounterInput } from "@/components/UploadPropertyComponents/PropertyCounterInput";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { FormContext } from "@/contextStore/FormContext";

const HostelPropertyDetails: FC = () => {
  const context = useContext(FormContext);
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const router = useRouter();

  if (!context)
    throw new Error(
      "HostelPropertyDetails must be used within a HostelFormProvider",
    );
  const { data, updateForm } = context;

  // Hostel capacity
  const [capacity, setCapacity] = useState<CapacityState>(
    data.capacityState || { Persons: 1, bedrooms: 0, beds: 1, bathrooms: 1 },
  );

  // Hostel type
  const [hostelType, setHostelType] = useState<"male" | "female" | "mixed">(
    data.hostelType || "male",
  );

  const updateCapacity = (
    key: keyof CapacityState,
    action: "increment" | "decrement",
  ) => {
    setCapacity((prev) => {
      const current = prev[key] ?? 0;
      const newValue = action === "increment" ? current + 1 : current - 1;
      return { ...prev, [key]: newValue < 0 ? 0 : newValue };
    });
  };

  const handleNext = () => {
    updateForm("capacityState", capacity);
    updateForm("hostelType", hostelType); // ✅ Update hostel type in context
    router.push("/upload/hostelForm/AmenitiesScreen");
  };

  const isNextDisabled =
    capacity.Persons < 1 || capacity.beds < 1 || !hostelType;

  return (
    <StepContainer
      title="Share some basics about your hostel"
      onNext={handleNext}
      isNextDisabled={isNextDisabled}
      progress={25}
    >
      <Text style={[styles.subtitle, { color: currentTheme.text }]}>
        You&apos;ll add more details later, like bed types and shared
        facilities.
      </Text>

      {/* Hostel Type Selection */}
      <Text
        style={[styles.subtitle, { color: currentTheme.text, marginTop: 16 }]}
      >
        Select Hostel Type
      </Text>
      <View style={{ flexDirection: "row", marginVertical: 8 }}>
        {["male", "female", "mixed"].map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setHostelType(type as "male" | "female" | "mixed")}
            style={{
              flex: 1,
              padding: 12,
              marginHorizontal: 4,
              borderRadius: 8,
              backgroundColor:
                hostelType === type ? currentTheme.primary : currentTheme.card,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: hostelType === type ? "#fff" : currentTheme.text,
                fontWeight: "bold",
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Capacity Counters */}
      <View style={styles.listContainer}>
        <CounterInput
          label="Total Guests"
          value={capacity.Persons}
          minValue={1}
          onIncrement={() => updateCapacity("Persons", "increment")}
          onDecrement={() => updateCapacity("Persons", "decrement")}
          textColor={currentTheme.text}
          buttonColor={currentTheme.primary}
        />
        <CounterInput
          label="Rooms"
          value={capacity.bedrooms}
          minValue={0}
          onIncrement={() => updateCapacity("bedrooms", "increment")}
          onDecrement={() => updateCapacity("bedrooms", "decrement")}
          textColor={currentTheme.text}
          buttonColor={currentTheme.primary}
        />
        <CounterInput
          label="Beds (per room)"
          value={capacity.beds}
          minValue={1}
          onIncrement={() => updateCapacity("beds", "increment")}
          onDecrement={() => updateCapacity("beds", "decrement")}
          textColor={currentTheme.text}
          buttonColor={currentTheme.primary}
        />
      </View>
    </StepContainer>
  );
};

export default HostelPropertyDetails;
