// @ts-ignore
import { useGetFilteredPropertiesQuery } from "@/services/api";
import React, { useState, useMemo } from "react";
import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../constants/Colors";
import { router } from "expo-router";
import Slider from "@react-native-community/slider";
import { useDebounce } from "use-debounce";
import { pakistaniCities } from "@/utils/cities";

const dummyFilterOptions = {
  cities: pakistaniCities,
  bedrooms: [1, 2, 3, 4],
  rentRange: { min: 0, max: 100000 },
};

export default function ListAllProperties() {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const [page, setPage] = useState(1);
  const limit = 5;


  const [cityInput, setCityInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedCity] = useDebounce(cityInput, 500);

  const [rentRange, setRentRange] = useState<{ min?: number; max?: number }>(
    {}
  );
  const [bedrooms, setBedrooms] = useState<number | undefined>(undefined);

  const filterOptions = dummyFilterOptions;

  const filteredPropertiesParams = useMemo(
    () => ({
      page,
      limit,
      city: debouncedCity || "",
      minRent: rentRange.min ?? filterOptions.rentRange.min ?? 0,
      maxRent: rentRange.max ?? filterOptions.rentRange.max ?? 9999999,
      bedrooms: bedrooms ?? undefined,
    }),
    [
      page,
      limit,
      debouncedCity,
      rentRange.min,
      rentRange.max,
      bedrooms,
      filterOptions.rentRange.min,
      filterOptions.rentRange.max,
    ]
  );

  const {
    data: propertiesData,
    isError,
    isLoading,
    refetch,
  } = useGetFilteredPropertiesQuery(filteredPropertiesParams, {
    refetchOnMountOrArgChange: true,
  });

  const handleOpenDetails = (id: string) => {
    router.push(`/property/${id}`);
  };

  const handleCityChange = (value: string) => {
    setCityInput(value);
    setShowSuggestions(true);
    setPage(1);
  };

  const handleBedroomsChange = (value: number) => {
    setBedrooms(value);
    setPage(1);
  };
  const handleSuggestionPress = (city: string) => {
    setCityInput(city);
    setShowSuggestions(false);
    setPage(1);
  };
  const handleRentChange = (min?: number, max?: number) => {
    setRentRange({ min, max });
    setPage(1);
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={currentTheme.primary} />
        <Text style={{ marginTop: 8, color: currentTheme.text }}>
          Loading properties...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={{ color: currentTheme.error }}>
          Error loading properties.
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: currentTheme.primary }]}
          onPress={() => refetch()}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalPages = propertiesData.totalPages || 1;
  const paginatedProperties = propertiesData.data;

  return (
    <View
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      {/* Filters */}
      <View
        style={[
          styles.filterCard,
          {
            backgroundColor: currentTheme.card,
            borderColor: currentTheme.border,
            marginBottom: 10,
          },
        ]}
      >
        {/* City Search */}
        <TextInput
          placeholder="Search by city..."
          value={cityInput}
          onChangeText={handleCityChange}
          style={[
            styles.input,
            { borderColor: currentTheme.border, color: currentTheme.text },
          ]}
          placeholderTextColor={currentTheme.muted}
        />
        {showSuggestions && cityInput.length > 0 && (
          <View
            style={[
              styles.suggestions,
              {
                backgroundColor: currentTheme.card,
                borderColor: currentTheme.border,
              },
            ]}
          >
            {filterOptions.cities
              .filter((c) => c.toLowerCase().includes(cityInput.toLowerCase()))
              .map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => handleSuggestionPress(c)}
                  style={[
                    styles.suggestionItem,
                    { borderBottomColor: currentTheme.border },
                  ]}
                >
                  <Text style={{ color: currentTheme.text }}>{c}</Text>
                </TouchableOpacity>
              ))}
          </View>
        )}

        {/* Rent Range */}
        <View style={{ marginVertical: 12 }}>
          <Text style={{ color: currentTheme.text, marginBottom: 4 }}>
            Rent Range: {rentRange.min ?? filterOptions.rentRange.min} -{" "}
            {rentRange.max ?? filterOptions.rentRange.max}
          </Text>

          <Slider
            minimumValue={filterOptions.rentRange.min}
            maximumValue={filterOptions.rentRange.max}
            step={1000}
            value={rentRange.min ?? filterOptions.rentRange.min}
            onValueChange={(min) => handleRentChange(min, rentRange.max)}
            minimumTrackTintColor={currentTheme.primary}
            maximumTrackTintColor={currentTheme.border}
            thumbTintColor={currentTheme.success}
          />

          <Slider
            minimumValue={filterOptions.rentRange.min}
            maximumValue={filterOptions.rentRange.max}
            step={1000}
            value={rentRange.max ?? filterOptions.rentRange.max}
            onValueChange={(max) => handleRentChange(rentRange.min, max)}
            minimumTrackTintColor={currentTheme.primary}
            maximumTrackTintColor={currentTheme.border}
            thumbTintColor={currentTheme.success}
          />
        </View>

        {/* Bedrooms */}
        <View
          style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 10 }}
        >
          {filterOptions.bedrooms.map((b) => (
            <TouchableOpacity
              key={b}
              onPress={() => handleBedroomsChange(b)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 12,
                margin: 4,
                borderRadius: 20,
                backgroundColor:
                  bedrooms === b ? currentTheme.primary : currentTheme.card,
                borderWidth: 1,
                borderColor: currentTheme.border,
              }}
            >
              <Text
                style={{ color: bedrooms === b ? "#fff" : currentTheme.text }}
              >
                Bedrooms: {b}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Property List */}

      {!propertiesData ||
      !Array.isArray(propertiesData.data) ||
      propertiesData.data.length === 0 ? (
        <Text style={{ color: currentTheme.text }}>No properties found</Text>
      ) : (
        <FlatList
          style={{ marginTop: 12 }}
          data={paginatedProperties}
          keyExtractor={(item) => item._id}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={5}
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: currentTheme.card,
                  borderColor: currentTheme.border,
                },
              ]}
            >
              <Text style={[styles.title, { color: currentTheme.text }]}>
                {item.title}
              </Text>
              <Text style={{ color: currentTheme.muted }}>
                📍 {item.city} | 💰 Rent: Rs. {item.rentPrice}
              </Text>
              <Text style={{ color: currentTheme.text }}>
                🛏️ Bedrooms: {item.bedrooms} | 🛋️ Furnished:{" "}
                {item.furnished ? "Yes" : "No"}
              </Text>
              <TouchableOpacity
                style={[
                  styles.viewButton,
                  { backgroundColor: currentTheme.success },
                ]}
                onPress={() => handleOpenDetails(item._id)}
              >
                <Text style={styles.viewButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
 
      <View style={styles.paginationRow}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor:
                page === 1 ? currentTheme.muted : currentTheme.primary,
            },
          ]}
          onPress={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          <Text style={styles.buttonText}>Prev</Text>
        </TouchableOpacity>

        <Text style={{ color: currentTheme.text, fontWeight: "600" }}>
          Page {page} of {totalPages}
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor:
                page >= totalPages ? currentTheme.muted : currentTheme.primary,
            },
          ]}
          onPress={() => setPage((p) => (p < totalPages ? p + 1 : p))}
          disabled={page >= totalPages}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { marginBottom: 15, borderWidth: 1, padding: 14, borderRadius: 10 },
  title: { fontWeight: "600", fontSize: 16, marginBottom: 4 },
  paginationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  button: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "600" },
  viewButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  viewButtonText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  filterCard: {
    borderRadius: 12,
    padding: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, height: 40 },
  suggestions: {
    position: "absolute",
    top: 42,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    zIndex: 10,
  },
  suggestionItem: { padding: 8, borderBottomWidth: 1, borderColor: "#eee" },
});
