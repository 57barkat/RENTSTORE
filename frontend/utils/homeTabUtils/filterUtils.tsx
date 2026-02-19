import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";

export interface Filters {
  city?: string;
  addressQuery?: string;
  minRent?: number;
  maxRent?: number;
  bedrooms?: number;
  bathrooms?: number;
  floorLevel?: number;
  hostelType?: "female" | "male" | "mixed";
  amenities?: string[];
  bills?: string[];
  mealPlan?: string[];
  rules?: string[];
}

export const NumberChip = ({
  value,
  selected,
  onPress,
  theme,
}: {
  value: number;
  selected: boolean;
  onPress: () => void;
  theme: any;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.chip,
      { backgroundColor: selected ? theme.secondary : theme.card },
      selected && styles.activeChip,
    ]}
  >
    <Text
      style={{
        color: selected ? "#fff" : theme.text,
        fontWeight: selected ? "700" : "400",
      }}
    >
      {value === 0 ? "Any" : `${value}+`}
    </Text>
  </TouchableOpacity>
);

export const MultiSelectChips = ({
  options,
  selectedOptions,
  onChange,
  theme,
}: {
  options: string[];
  selectedOptions: string[];
  onChange: (v: string[]) => void;
  theme: any;
}) => (
  <View style={styles.chipRow}>
    {options.map((opt) => {
      const selected = selectedOptions.includes(opt);
      return (
        <TouchableOpacity
          key={opt}
          onPress={() => {
            if (selected) onChange(selectedOptions.filter((o) => o !== opt));
            else onChange([...selectedOptions, opt]);
          }}
          style={[
            styles.chip,
            { backgroundColor: selected ? theme.secondary : theme.card },
            selected && styles.activeChip,
          ]}
        >
          <Text
            style={{
              color: selected ? "#fff" : theme.text,
              fontWeight: selected ? "700" : "400",
            }}
          >
            {opt}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    minWidth: 60,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
    marginRight: 6,
    marginBottom: 6,
  },
  activeChip: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

export const hostelTypeOptions = [
  { label: "Girls", value: "female" },
  { label: "Boys", value: "male" },
  { label: "Co-ed", value: "mixed" },
];

export const AMENITIES = ["WiFi", "Parking", "AC", "Gym", "Laundry"];
export const BILLS = ["Water", "Electricity", "Gas", "Internet", "Maintenance"];
export const MEAL_PLAN = ["Breakfast", "Lunch", "Dinner"];
export const RULES = ["No Party", "No Smoking", "Pets Allowed"];
export interface FilterOption {
  label: string;
  value: string | number;
}

export type ChipKey = keyof Filters | "hostOption";

export const buildSelectedChips = (hostOption: string, filters: Filters) => {
  return Object.entries(filters)
    .filter(
      ([key, value]) =>
        key !== "hostOption" &&
        value !== undefined &&
        value !== null &&
        value !== "",
    )
    .map(([key, value]) => ({
      key: key as ChipKey,
      label: value.toString(),
      removable: true,
    }));
};

export const formatFilterOptions = (
  items: string[] | number[],
): FilterOption[] =>
  items.map((item) => ({ label: item.toString(), value: item }));
