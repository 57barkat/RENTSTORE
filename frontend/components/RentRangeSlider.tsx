// RentRangeSlider.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { useTheme } from "@/contextStore/ThemeContext";

interface Props {
  min: number;
  max: number;
  values: [number, number];
  step?: number;
  onValuesChange: (values: number[]) => void;
}

export default function RentRangeSlider({
  min,
  max,
  values,
  step = 5000,
  onValuesChange,
}: Props) {
  const { theme } = useTheme();

  const formatPrice = (num: number) => `Rs. ${num.toLocaleString()}`;

  return (
    <View style={styles.container}>
      <Text
        style={[styles.title, { color: theme === "dark" ? "white" : "black" }]}
      >
        Monthly Rent Range
      </Text>

      <Text
        style={[
          styles.rangeText,
          { color: theme === "dark" ? "white" : "black" },
        ]}
      >
        {formatPrice(values[0])} - {formatPrice(values[1])}
      </Text>

      <MultiSlider
        values={values}
        min={min}
        max={max}
        step={step}
        sliderLength={300}
        onValuesChange={onValuesChange}
        selectedStyle={{
          backgroundColor: theme === "dark" ? "white" : "black",
        }}
        unselectedStyle={{
          backgroundColor: theme === "dark" ? "#555" : "#ccc",
        }}
        markerStyle={{
          backgroundColor: theme === "dark" ? "white" : "black",
          height: 20,
          width: 20,
          borderRadius: 10,
        }}
        containerStyle={{ alignSelf: "center", marginVertical: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 18 },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  rangeText: { fontSize: 16, fontWeight: "600", textAlign: "center" },
});
