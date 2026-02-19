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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { HostPicker } from "./HostPicker";
import {
  Filters,
  NumberChip,
  MultiSelectChips,
  hostelTypeOptions,
  AMENITIES,
  BILLS,
  MEAL_PLAN,
  RULES,
} from "@/utils/homeTabUtils/filterUtils";
import { getCitySuggestions, pakistaniCities } from "@/utils/cities";
import { useGetAddressSuggestionsQuery } from "@/services/api";
// import { Filters } from "@/utils/homeTabUtils/filterUtils";

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
  const [addressInput, setAddressInput] = React.useState(
    filters.addressQuery || "",
  );
  const [debouncedAddress, setDebouncedAddress] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedAddress(addressInput), 400);
    return () => clearTimeout(timer);
  }, [addressInput]);

  const { data: addressSuggestions = [], isFetching: addressLoading } =
    useGetAddressSuggestionsQuery(debouncedAddress, {
      skip: debouncedAddress.length < 2,
    });

  React.useEffect(() => {
    if (visible) setAddressInput(filters.addressQuery || "");
  }, [visible]);

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
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close-outline" size={28} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Filters
          </Text>
          <TouchableOpacity
            onPress={() => {
              setFilters({});
              setAddressInput("");
              setCitySuggestions([]);
            }}
          >
            <Text style={{ color: theme.secondary, fontWeight: "600" }}>
              Reset
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Property Category */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>Property Category</Text>
            <HostPicker
              title=""
              value={hostOption}
              onChange={onHostChange}
              theme={theme}
            />
          </View>

          {/* Location */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>Location</Text>
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
            {citySuggestions.length > 0 && (
              <View
                style={[
                  styles.suggestionBox,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                {citySuggestions.map((city, index) => (
                  <TouchableOpacity
                    key={city}
                    style={[
                      styles.suggestionItem,
                      index === citySuggestions.length - 1 && {
                        borderBottomWidth: 0,
                      },
                    ]}
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
                value={addressInput}
                onChangeText={(txt) => {
                  setAddressInput(txt);
                  setFilters({ ...filters, addressQuery: txt });
                }}
              />
              {addressLoading && (
                <ActivityIndicator size="small" color={theme.secondary} />
              )}
            </View>

            {addressSuggestions.length > 0 && (
              <View
                style={[
                  styles.suggestionBox,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                {addressSuggestions.map((item, index) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.suggestionItem,
                      index === addressSuggestions.length - 1 && {
                        borderBottomWidth: 0,
                      },
                    ]}
                    onPress={() => {
                      setAddressInput(item);
                      setFilters({ ...filters, addressQuery: item });
                    }}
                  >
                    <Text style={{ color: theme.text }}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Price Range */}
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

          {/* Bedrooms */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>Bedrooms</Text>
            <View style={styles.chipRow}>
              {[0, 1, 2, 3, 4].map((num) => (
                <NumberChip
                  key={num}
                  value={num}
                  selected={filters.bedrooms === num}
                  onPress={() => setFilters({ ...filters, bedrooms: num })}
                  theme={theme}
                />
              ))}
            </View>
          </View>

          {/* Floor Level */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>Floor Level</Text>
            <View style={styles.chipRow}>
              {[0, 1, 2, 3, 4, 5].map((num) => (
                <NumberChip
                  key={num}
                  value={num}
                  selected={filters.floorLevel === num}
                  onPress={() => setFilters({ ...filters, floorLevel: num })}
                  theme={theme}
                />
              ))}
            </View>
          </View>

          {/* Bathrooms */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>Bathrooms</Text>
            <View style={styles.chipRow}>
              {[0, 1, 2, 3, 4].map((num) => (
                <NumberChip
                  key={num}
                  value={num}
                  selected={filters.bathrooms === num}
                  onPress={() => setFilters({ ...filters, bathrooms: num })}
                  theme={theme}
                />
              ))}
            </View>
          </View>

          {/* Hostel Type - only if hostel */}
          {hostOption === "hostel" && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionLabel}>Hostel Type</Text>
              <MultiSelectChips
                options={hostelTypeOptions.map((h) => h.label)}
                selectedOptions={filters.hostelType ? [filters.hostelType] : []}
                onChange={(v) =>
                  setFilters({
                    ...filters,
                    hostelType: v[0] as "female" | "male" | "mixed" | undefined,
                  })
                }
                theme={theme}
              />
            </View>
          )}

          {/* Amenities */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>Amenities</Text>
            <MultiSelectChips
              options={AMENITIES}
              selectedOptions={filters.amenities || []}
              onChange={(v) => setFilters({ ...filters, amenities: v })}
              theme={theme}
            />
          </View>

          {/* Bills - only if home/apartment */}
          {hostOption !== "hostel" && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionLabel}>Bills</Text>
              <MultiSelectChips
                options={BILLS}
                selectedOptions={filters.bills || []}
                onChange={(v) => setFilters({ ...filters, bills: v })}
                theme={theme}
              />
            </View>
          )}

          {/* Meal Plan - only hostel */}
          {hostOption === "hostel" && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionLabel}>Meal Plan</Text>
              <MultiSelectChips
                options={MEAL_PLAN}
                selectedOptions={filters.mealPlan || []}
                onChange={(v) => setFilters({ ...filters, mealPlan: v })}
                theme={theme}
              />
            </View>
          )}

          {/* Rules - only hostel */}
          {hostOption === "hostel" && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionLabel}>Rules</Text>
              <MultiSelectChips
                options={RULES}
                selectedOptions={filters.rules || []}
                onChange={(v) => setFilters({ ...filters, rules: v })}
                theme={theme}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
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
