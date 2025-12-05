import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contextStore/ThemeContext";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import DropDownPicker from "react-native-dropdown-picker";

type FilterBarProps = {
  onApply: (filters: {
    city?: string;
    minRent?: number;
    maxRent?: number;
    beds?: number;
  }) => void;
};

export default function FilterBar({ onApply }: FilterBarProps) {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const [cityOpen, setCityOpen] = useState(false);
  const [bedOpen, setBedOpen] = useState(false);

  const [cityValue, setCityValue] = useState<string | null>(null);
  const [bedValue, setBedValue] = useState<number | null>(null);
  const [rentRange, setRentRange] = useState<[number, number]>([0, 100000]);

  const [cityItems, setCityItems] = useState([
    { label: "Islamabad", value: "Islamabad" },
    { label: "Lahore", value: "Lahore" },
    { label: "Karachi", value: "Karachi" },
    { label: "Rawalpindi", value: "Rawalpindi" },
  ]);

  const [bedItems, setBedItems] = useState([
    { label: "1 Bed", value: 1 },
    { label: "2 Beds", value: 2 },
    { label: "3 Beds", value: 3 },
    { label: "4 Beds", value: 4 },
  ]);

  const handleApply = () => {
    onApply({
      city: cityValue ?? undefined,
      beds: bedValue ?? undefined,
      minRent: rentRange[0],
      maxRent: rentRange[1],
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.card }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {/* City Dropdown */}
        <DropDownPicker
          open={cityOpen}
          setOpen={setCityOpen}
          value={cityValue}
          setValue={setCityValue}
          items={cityItems}
          placeholder="Select City"
          style={[
            styles.dropdown,
            { backgroundColor: currentTheme.background },
          ]}
          dropDownContainerStyle={{
            backgroundColor: currentTheme.background,
          }}
          textStyle={{ color: currentTheme.text }}
        />

        {/* Beds Dropdown */}
        <DropDownPicker
          open={bedOpen}
          setOpen={setBedOpen}
          value={bedValue}
          setValue={setBedValue}
          items={bedItems}
          placeholder="Select Beds"
          style={[
            styles.dropdown,
            { backgroundColor: currentTheme.background },
          ]}
          dropDownContainerStyle={{
            backgroundColor: currentTheme.background,
          }}
          textStyle={{ color: currentTheme.text }}
        />

        {/* Rent Range Slider */}
        <View style={{ width: 250, marginHorizontal: 10 }}>
          <Text style={{ color: currentTheme.text, marginBottom: 5 }}>
            Rent: Rs. {rentRange[0].toLocaleString()} - Rs.{" "}
            {rentRange[1].toLocaleString()}
          </Text>
          <MultiSlider
            values={rentRange}
            min={0}
            max={200000}
            step={1000}
            onValuesChange={(values: number[]) =>
              setRentRange([values[0], values[1]])
            }
            selectedStyle={{ backgroundColor: currentTheme.primary }}
            markerStyle={{ backgroundColor: currentTheme.primary }}
          />
        </View>

        {/* Apply Button */}
        <TouchableOpacity
          onPress={handleApply}
          style={[
            styles.applyButton,
            { backgroundColor: currentTheme.primary },
          ]}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Apply</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
  },
  dropdown: {
    width: 150,
    marginHorizontal: 5,
    zIndex: 10,
  },
  applyButton: {
    paddingHorizontal: 15,
    justifyContent: "center",
    borderRadius: 8,
    marginHorizontal: 5,
  },
});
