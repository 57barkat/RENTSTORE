import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { AMENITIES_DATA, getAmenityLabel } from "../Aminities";

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

import { ScrollView } from "react-native";

export const MultiSelectChips = ({
  options,
  selectedOptions,
  onChange,
  theme,
  useAmenityLabels = false,
}: {
  options: string[];
  selectedOptions: string[];
  onChange: (v: string[]) => void;
  theme: any;
  useAmenityLabels?: boolean;
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.horizontalRow}
  >
    {options.map((opt) => {
      const selected = selectedOptions.includes(opt);

      return (
        <TouchableOpacity
          key={opt}
          onPress={() => {
            if (selected) {
              onChange(selectedOptions.filter((o) => o !== opt));
            } else {
              onChange([...selectedOptions, opt]);
            }
          }}
          style={[
            styles.chip,
            {
              backgroundColor: selected ? theme.secondary : theme.card,
              borderColor: selected ? theme.secondary : "#ddd",
            },
          ]}
        >
          <Text
            numberOfLines={1}
            style={{
              color: selected ? "#fff" : theme.text,
              fontWeight: selected ? "700" : "500",
            }}
          >
            {useAmenityLabels ? getAmenityLabel(opt) : opt}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  horizontalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginRight: 8,
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

export const AMENITIES: string[] = AMENITIES_DATA.flatMap((section) =>
  section.items.map((item) => item.key),
);

export const BILLS = ["water", "electricity", "gas"];
export const MEAL_PLAN = ["breakfast", "lunch", "dinner"];
export const RULES = [
  "No smoking",
  "No loud music after 10 PM",
  "Visitors not allowed",
  "Keep rooms clean",
];

export interface FilterOption {
  label: string;
  value: string | number;
}

export type ChipKey = keyof Filters | "hostOption";

export const buildSelectedChips = (hostOption: string, filters: Filters) => {
  return Object.entries(filters)
    .filter(
      ([_, value]) =>
        value !== undefined &&
        value !== null &&
        value !== "" &&
        !(Array.isArray(value) && value.length === 0),
    )
    .flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map((v) => ({
          key: key as ChipKey,
          label: key === "amenities" ? getAmenityLabel(v) : v.toString(),
          removable: true,
        }));
      }

      return [
        {
          key: key as ChipKey,
          label: value.toString(),
          removable: true,
        },
      ];
    });
};

export const formatFilterOptions = (
  items: string[] | number[],
): FilterOption[] =>
  items.map((item) => ({
    label: item.toString(),
    value: item,
  }));
