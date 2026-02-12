import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { HostPicker } from "./HostPicker";
import { Filters } from "@/utils/homeTabUtils/filterUtils";
import { getCitySuggestions, pakistaniCities } from "@/utils/cities";

interface Props {
  visible: boolean;
  onClose: () => void;
  onApply: () => void;
  hostOption: string;
  onHostChange: (v: string) => void;
  filters: Filters;
  setFilters: (v: Filters) => void;
  theme: any;
}

export const FilterModal: React.FC<Props> = ({
  visible,
  onClose,
  onApply,
  hostOption,
  onHostChange,
  filters,
  setFilters,
  theme,
}) => {
  const [citySuggestions, setCitySuggestions] = React.useState<string[]>([]);

  // Number option component (handles numeric filters like beds, bathrooms)
  const NumberOption = ({
    value,
    selectedKey,
  }: {
    value: number;
    selectedKey: keyof Filters;
  }) => {
    // Convert filter value to number if it's string
    const currentValue =
      typeof filters[selectedKey] === "number"
        ? filters[selectedKey]
        : parseInt(filters[selectedKey] as any) || 0;

    const selected = currentValue === value;

    return (
      <TouchableOpacity
        onPress={() => setFilters({ ...filters, [selectedKey]: value })}
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
  };

  // Multi-select chip component (handles array filters like amenities, bills, safety)
  // const MultiSelectChip = ({
  //   label,
  //   options,
  //   selectedKey,
  // }: {
  //   label: string;
  //   options: string[];
  //   selectedKey: keyof Filters;
  // }) => {
  //   // Ensure value is always an array
  //   const currentArray: string[] = Array.isArray(filters[selectedKey])
  //     ? (filters[selectedKey] as string[])
  //     : [];

  //   return (
  //     <View style={{ marginBottom: 16 }}>
  //       <Text style={styles.sectionLabel}>{label}</Text>
  //       <View style={styles.chipRow}>
  //         {options.map((opt) => {
  //           const selected = currentArray.includes(opt);

  //           return (
  //             <TouchableOpacity
  //               key={opt}
  //               onPress={() => {
  //                 const updated = selected
  //                   ? currentArray.filter((i) => i !== opt)
  //                   : [...currentArray, opt];
  //                 setFilters({ ...filters, [selectedKey]: updated });
  //               }}
  //               style={[
  //                 styles.chip,
  //                 { backgroundColor: selected ? theme.secondary : theme.card },
  //                 selected && styles.activeChip,
  //               ]}
  //             >
  //               <Text
  //                 style={{
  //                   color: selected ? "#fff" : theme.text,
  //                   fontWeight: selected ? "700" : "400",
  //                 }}
  //               >
  //                 {opt}
  //               </Text>
  //             </TouchableOpacity>
  //           );
  //         })}
  //       </View>
  //     </View>
  //   );
  // };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: theme.background }}
      >
        {/* ===== Header ===== */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close-outline" size={28} color={theme.text} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Filters
          </Text>

          <TouchableOpacity onPress={() => setFilters({})}>
            <Text style={{ color: theme.secondary, fontWeight: "600" }}>
              Reset
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ===== Property Category ===== */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>Property Category</Text>
            <HostPicker
              title=""
              value={hostOption}
              onChange={onHostChange}
              theme={theme}
            />
          </View>

          {/* ===== Location ===== */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>Location</Text>

            {/* City Input */}
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Ionicons
                name="location-outline"
                size={20}
                color={theme.muted}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.cleanInput, { color: theme.text }]}
                placeholder="Search by city..."
                placeholderTextColor={theme.muted}
                value={filters.city || ""}
                onChangeText={(txt) => {
                  setFilters({ ...filters, city: txt });
                  setCitySuggestions(getCitySuggestions(txt, pakistaniCities));
                }}
              />
            </View>

            {/* City Suggestions */}
            {citySuggestions.length > 0 && (
              <View
                style={[
                  styles.suggestionBox,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                {citySuggestions.map((city) => (
                  <TouchableOpacity
                    key={city}
                    style={styles.suggestionItem}
                    onPress={() => {
                      setFilters({ ...filters, city });
                      setCitySuggestions([]);
                    }}
                  >
                    <Text style={{ color: theme.text }}>{city}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Address Search */}
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  marginTop: 12,
                },
              ]}
            >
              <Ionicons
                name="search-outline"
                size={20}
                color={theme.muted}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.cleanInput, { color: theme.text }]}
                placeholder="Search by address..."
                placeholderTextColor={theme.muted}
                value={filters.addressQuery || ""}
                onChangeText={(txt) =>
                  setFilters({ ...filters, addressQuery: txt })
                }
              />
            </View>
          </View>

          {/* ===== Price Range ===== */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>Price Range (Monthly)</Text>
            <View style={styles.row}>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    flex: 1,
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text style={styles.currencyPrefix}>$</Text>
                <TextInput
                  style={[styles.cleanInput, { color: theme.text }]}
                  keyboardType="numeric"
                  placeholder="Min"
                  placeholderTextColor={theme.muted}
                  value={filters.minRent?.toString() || ""}
                  onChangeText={(txt) =>
                    setFilters({
                      ...filters,
                      minRent: txt ? parseInt(txt) : undefined,
                    })
                  }
                />
              </View>

              <View style={styles.rangeDivider} />

              <View
                style={[
                  styles.inputWrapper,
                  {
                    flex: 1,
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text style={styles.currencyPrefix}>$</Text>
                <TextInput
                  style={[styles.cleanInput, { color: theme.text }]}
                  keyboardType="numeric"
                  placeholder="Max"
                  placeholderTextColor={theme.muted}
                  value={filters.maxRent?.toString() || ""}
                  onChangeText={(txt) =>
                    setFilters({
                      ...filters,
                      maxRent: txt ? parseInt(txt) : undefined,
                    })
                  }
                />
              </View>
            </View>
          </View>

          {/* ===== Bedrooms ===== */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>Bedrooms</Text>
            <View style={styles.chipRow}>
              {[0, 1, 2, 3, 4].map((num) => (
                <NumberOption key={num} value={num} selectedKey="bedrooms" />
              ))}
            </View>
          </View>

          {/* ===== Floor Level ===== */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>Floor Level</Text>
            <View style={styles.chipRow}>
              {[0, 1, 2, 3, 4, 5].map((num) => (
                <NumberOption key={num} value={num} selectedKey="floorLevel" />
              ))}
            </View>
          </View>

          {/* ===== Bathrooms ===== */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>Bathrooms</Text>
            <View style={styles.chipRow}>
              {[0, 1, 2, 3, 4].map((num) => (
                <NumberOption key={num} value={num} selectedKey="bathrooms" />
              ))}
            </View>
          </View>

          {/* ===== Amenities ===== */}
          {/* <MultiSelectChip
            label="Amenities"
            options={["paid_parking", "gym", "pool", "wifi"]}
            selectedKey="amenities"
          /> */}

          {/* ===== Bills Included ===== */}
          {/* <MultiSelectChip
            label="Bills Included"
            options={["water", "gas", "electricity", "internet"]}
            selectedKey="bills"
          /> */}

          {/* ===== Highlights ===== */}
          {/* <MultiSelectChip
            label="Highlights"
            options={["spacious", "modern", "furnished"]}
            selectedKey="highlighted"
          /> */}

          {/* ===== Safety Features ===== */}
          {/* <MultiSelectChip
            label="Safety Features"
            options={["cctv", "fire_extinguisher", "weapons"]}
            selectedKey="safety"
          /> */}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ===== Footer ===== */}
      <View
        style={[
          styles.footer,
          { backgroundColor: theme.background, borderTopColor: theme.border },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onApply}
          style={[styles.premiumApplyBtn, { backgroundColor: theme.secondary }]}
        >
          <Text style={styles.applyText}>Show Results</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 20,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  scrollContent: { padding: 20 },
  sectionContainer: { marginBottom: 25 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: { marginRight: 8 },
  cleanInput: { flex: 1, fontSize: 16, height: "100%" },
  currencyPrefix: { marginRight: 4, fontSize: 16, color: "#8E8E93" },
  row: { flexDirection: "row", alignItems: "center" },
  rangeDivider: {
    width: 10,
    height: 1,
    backgroundColor: "#8E8E93",
    marginHorizontal: 10,
  },
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
  suggestionBox: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 6,
    overflow: "hidden",
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    borderTopWidth: 1,
  },
  premiumApplyBtn: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  applyText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
