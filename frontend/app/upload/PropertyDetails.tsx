import React, { useState, FC, useContext } from "react";
import { Text, View, StyleSheet, TextInput, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import StepContainer from "@/app/upload/Welcome";
import { styles } from "@/styles/PropertyDetails";
import { CapacityState } from "@/types/PropertyDetails.types";
import { CounterInput } from "@/components/UploadPropertyComponents/PropertyCounterInput";
import { FormContext } from "@/contextStore/FormContext";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { Dropdown } from "react-native-element-dropdown";
import {
  PROPERTY_UPLOAD_TOTAL_STEPS,
  buildDisabledReason,
  getPropertyLayoutLabels,
} from "@/utils/propertyTypes";

const PropertyDetails: FC = () => {
  const context = useContext(FormContext);
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  if (!context) {
    throw new Error("PropertyDetails must be used within a FormProvider");
  }

  const { data, updateForm } = context;
  const router = useRouter();
  const hostOption = data.hostOption;
  const layoutCopy = getPropertyLayoutLabels(hostOption);

  const defaultCapacity: CapacityState = {
    floorLevel: 0,
    bedrooms: 1,
    bathrooms: 1,
  };

  const [sizeValue, setSizeValue] = useState(
    data.size?.value?.toString() || "",
  );
  const [sizeUnit, setSizeUnit] = useState(data.size?.unit || "Marla");

  const units = [
    { label: "Marla", value: "Marla" },
    { label: "Kanal", value: "Kanal" },
    { label: "Sq. Ft.", value: "Sq. Ft." },
    { label: "Sq. Yd.", value: "Sq. Yd." },
  ];

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
      const minLimit = key === "floorLevel" ? 0 : 1;
      return { ...prev, [key]: Math.max(newValue, minLimit) };
    });
  };

  const handleNext = () => {
    updateForm("capacityState", capacity);
    updateForm("size", {
      value: parseFloat(sizeValue) || 0,
      unit: sizeUnit as any,
    });
    router.push("/upload/AmenitiesScreen");
  };

  const isNextDisabled =
    capacity.bedrooms < 1 || capacity.bathrooms < 1 || !sizeValue;
  const sizeError =
    !sizeValue.trim() || Number(sizeValue) <= 0
      ? `Enter a valid ${layoutCopy.sizeLabel.toLowerCase()} to continue.`
      : undefined;
  const nextDisabledReason = buildDisabledReason([
    sizeError,
    capacity.bedrooms < 1
      ? `Add at least one ${layoutCopy.roomLabel.toLowerCase()} to continue.`
      : undefined,
    capacity.bathrooms < 1
      ? "Add at least one bathroom to continue."
      : undefined,
  ]);

  return (
    <StepContainer
      title={layoutCopy.title}
      onNext={handleNext}
      isNextDisabled={isNextDisabled}
      progress={25}
      nextDisabledReason={nextDisabledReason}
      stepNumber={3}
      totalSteps={PROPERTY_UPLOAD_TOTAL_STEPS}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <Text style={[styles.subtitle, { color: currentTheme.text }]}>
          {layoutCopy.subtitle}
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
            label={layoutCopy.roomLabel}
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

          <View style={{ marginTop: 20 }}>
            <Text
              style={{
                color: currentTheme.text,
                fontSize: 16,
                fontWeight: "600",
                marginBottom: 10,
              }}
              >
              {layoutCopy.sizeLabel}
            </Text>
            <View style={localStyles.sizeRow}>
              <TextInput
                style={[
                  localStyles.input,
                  {
                    color: currentTheme.text,
                    borderColor: sizeError
                      ? currentTheme.error
                      : currentTheme.border,
                    backgroundColor: currentTheme.background,
                  },
                ]}
                placeholder="Value"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={sizeValue}
                onChangeText={setSizeValue}
              />
              <Dropdown
                style={[
                  localStyles.dropdown,
                  {
                    borderColor: currentTheme.border,
                    backgroundColor: currentTheme.background,
                  },
                ]}
                placeholderStyle={{ color: "#999", fontSize: 14 }}
                selectedTextStyle={{ color: currentTheme.text, fontSize: 14 }}
                containerStyle={{
                  backgroundColor: currentTheme.background,
                  borderColor: currentTheme.border,
                }}
                itemTextStyle={{ color: currentTheme.text }}
                activeColor={currentTheme.primary + "20"}
                data={units}
                labelField="label"
                valueField="value"
                value={sizeUnit}
                onChange={(item) => setSizeUnit(item.value)}
              />
            </View>
            {sizeError ? (
              <Text
                style={{
                  color: currentTheme.error,
                  fontSize: 12,
                  marginTop: 8,
                  fontWeight: "600",
                }}
              >
                {sizeError}
              </Text>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </StepContainer>
  );
};

const localStyles = StyleSheet.create({
  sizeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  dropdown: {
    width: 130,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
});

export default PropertyDetails;
