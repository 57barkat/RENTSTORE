import {
  useGetFilteredPropertiesQuery,
  useGetFilterOptionsQuery,
} from "@/services/api";
import React, { useState } from "react";
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

export default function ListAllProperties() {
  const [page, setPage] = useState(1);
  const limit = 5;

  const [city, setCity] = useState("");
  const [rentRange, setRentRange] = useState<{ min?: number; max?: number }>(
    {}
  );
  const [bedrooms, setBedrooms] = useState<number | undefined>(undefined);

  const { data, isLoading, isError, refetch } = useGetFilteredPropertiesQuery({
    page,
    limit,
    city,
    minRent: rentRange.min,
    maxRent: rentRange.max,
    bedrooms,
  });
  
  const { data: filterOptions } = useGetFilterOptionsQuery();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

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

  const handleOpenDetails = (id: string) => {
    router.push(`/property/${id}`);
  };

 

  return (
    <View
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      {/* 🔹 Filter Card */}
      <View
        style={[
          styles.filterCard,
          {
            backgroundColor: currentTheme.card,
            shadowColor: currentTheme.text,
          },
        ]}
      >
        {/* City input */}
        <TextInput
          placeholder="Search by city..."
          value={city}
          onChangeText={setCity}
          style={[
            styles.input,
            { borderColor: currentTheme.border, color: currentTheme.text },
          ]}
          placeholderTextColor={currentTheme.muted}
        />
        {city.length > 0 && (
          <View style={styles.suggestions}>
            {filterOptions?.cities
              ?.filter((c: string) =>
                c.toLowerCase().includes(city.toLowerCase())
              )
              .map((c: string) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setCity(c)}
                  style={styles.suggestionItem}
                >
                  <Text style={{ color: currentTheme.text }}>{c}</Text>
                </TouchableOpacity>
              ))}
          </View>
        )}

        {/* Rent Sliders */}
        <View style={{ marginVertical: 12 }}>
          <Text style={{ color: currentTheme.text, marginBottom: 4 }}>
            Rent Range: {rentRange.min || filterOptions?.rentRange.min} -{" "}
            {rentRange.max || filterOptions?.rentRange.max}
          </Text>

          <Slider
            minimumValue={filterOptions?.rentRange.min || 0}
            maximumValue={filterOptions?.rentRange.max || 1000000}
            step={1000}
            minimumTrackTintColor={currentTheme.primary}
            maximumTrackTintColor={currentTheme.border}
            thumbTintColor={currentTheme.success}
            value={rentRange.min || filterOptions?.rentRange.min || 0}
            onValueChange={(min) => setRentRange((r) => ({ ...r, min }))}
          />

          <Slider
            minimumValue={filterOptions?.rentRange.min || 0}
            maximumValue={filterOptions?.rentRange.max || 1000000}
            step={1000}
            minimumTrackTintColor={currentTheme.primary}
            maximumTrackTintColor={currentTheme.border}
            thumbTintColor={currentTheme.success}
            value={rentRange.max || filterOptions?.rentRange.max || 1000000}
            onValueChange={(max) => setRentRange((r) => ({ ...r, max }))}
          />
        </View>

        <View
          style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 10 }}
        >
          {filterOptions?.bedrooms?.length ? (
            filterOptions.bedrooms.map((b: number) => (
              <TouchableOpacity
                key={b}
                onPress={() => setBedrooms(b)}
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
                  {b}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={{ color: currentTheme.muted }}>
              No bedroom options available.
            </Text>
          )}
        </View>
      </View>

      {/* 🔹 Property List */}
      <FlatList
        style={{ marginTop: 12 }}
        data={data?.data || []}
        keyExtractor={(item) => item._id}
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

      {/* 🔹 Pagination */}
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
          Page {page} of {data?.totalPages || 1}
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor:
                page >= (data?.totalPages || 1)
                  ? currentTheme.muted
                  : currentTheme.primary,
            },
          ]}
          onPress={() =>
            setPage((p) => (p < (data?.totalPages || 1) ? p + 1 : p))
          }
          disabled={page >= (data?.totalPages || 1)}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    margin: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
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
