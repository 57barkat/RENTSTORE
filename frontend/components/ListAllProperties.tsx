import {
  useAddToFavMutation,
  useGetFilteredPropertiesQuery,
  useRemoveUserFavoriteMutation,
} from "@/services/api";
import React, { useState, useMemo, useCallback } from "react";
import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { FontAwesome, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../constants/Colors";
import { router, useFocusEffect } from "expo-router";
import Slider from "@react-native-community/slider";
import { useDebounce } from "use-debounce";
import { pakistaniCities } from "@/utils/cities";

const dummyFilterOptions = {
  cities: pakistaniCities,
  bedrooms: [1, 2, 3, 4, 5, 6, 7],
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

  const [rentRange, setRentRange] = useState<{ min?: number; max?: number }>({});
  const [bedrooms, setBedrooms] = useState<number | null>(null);

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

  const [addToFav] = useAddToFavMutation();
  const [removeUserFavorite] = useRemoveUserFavoriteMutation();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleToggleFav = async (propertyId: string, isFav: boolean) => {
    try {
      if (isFav) {
        await removeUserFavorite({ propertyId });
      } else {
        await addToFav({ propertyId });
      }
      refetch();
    } catch (err) {
      console.log("Fav error:", err);
    }
  };

  const handleOpenDetails = (id: string) => {
    router.push(`/property/${id}`);
  };

  const handleCityChange = (value: string) => {
    setCityInput(value);
    setShowSuggestions(true);
    setPage(1);
  };

  const handleBedroomsChange = (value: number) => {
    setBedrooms((prev) => (prev === value ? null : value));
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

  const renderHeader = () => (
    <View style={styles.filterContainer}>
      <Text style={[styles.filterTitle, { color: currentTheme.text }]}>Filters</Text>
      <View style={styles.filterSection}>
        <TextInput
          placeholder="Search by city..."
          value={cityInput}
          onChangeText={handleCityChange}
          style={[
            styles.input,
            {
              borderColor: currentTheme.border,
              color: currentTheme.text,
              backgroundColor: currentTheme.background,
            },
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
      </View>

      <View style={styles.filterSection}>
        <Text style={[styles.filterLabel, { color: currentTheme.text }]}>
          Rent Range:
        </Text>
        <Text style={[styles.filterValue, { color: currentTheme.text }]}>
          Rs. {rentRange.min ?? filterOptions.rentRange.min} - Rs.{" "}
          {rentRange.max ?? filterOptions.rentRange.max}
        </Text>
        <View>
          <Slider
            minimumValue={filterOptions.rentRange.min}
            maximumValue={filterOptions.rentRange.max}
            step={1000}
            value={rentRange.min ?? filterOptions.rentRange.min}
            onSlidingComplete={(min) => handleRentChange(min, rentRange.max)}
            minimumTrackTintColor={currentTheme.primary}
            maximumTrackTintColor={currentTheme.border}
            thumbTintColor={currentTheme.primary}
          />
          <Slider
            minimumValue={filterOptions.rentRange.min}
            maximumValue={filterOptions.rentRange.max}
            step={1000}
            value={rentRange.max ?? filterOptions.rentRange.max}
            onSlidingComplete={(max) => handleRentChange(rentRange.min, max)}
            minimumTrackTintColor={currentTheme.primary}
            maximumTrackTintColor={currentTheme.border}
            thumbTintColor={currentTheme.primary}
          />
        </View>
      </View>

      <View style={styles.filterSection}>
        <Text style={[styles.filterLabel, { color: currentTheme.text }]}>Bedrooms</Text>
        <View style={styles.chipsContainer}>
          {filterOptions.bedrooms.map((b) => (
            <TouchableOpacity
              key={b}
              onPress={() => handleBedroomsChange(b)}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    bedrooms === b ? currentTheme.primary : "transparent",
                  borderColor:
                    bedrooms === b ? currentTheme.primary : currentTheme.border,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: bedrooms === b ? "#fff" : currentTheme.text }]}>
                {b}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => (
    <View
      style={[
        styles.card,
        {
          backgroundColor: currentTheme.card,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.favButton}
        onPress={() => handleToggleFav(item._id, item.isFav)}
      >
        <FontAwesome
          name={item.isFav ? "heart" : "heart-o"}
          size={24}
          color={item.isFav ? currentTheme.danger : currentTheme.muted}
        />
      </TouchableOpacity>

      <View style={styles.cardContent}>
        <Text style={[styles.title, { color: currentTheme.text }]}>
          {item.title}
        </Text>

        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={16}
            color={currentTheme.secondary}
          />
          <Text style={[styles.infoText, { color: currentTheme.secondary }]}>
            {item.city}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="currency-usd"
            size={16}
            color={currentTheme.secondary}
          />
          <Text style={[styles.infoText, { color: currentTheme.secondary }]}>
            Rent: Rs. {item.rentPrice}
          </Text>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons
              name="bed-outline"
              size={16}
              color={currentTheme.secondary}
            />
            <Text style={[styles.detailText, { color: currentTheme.secondary }]}>
              {item.bedrooms}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons
              name="sofa-outline"
              size={16}
              color={currentTheme.secondary}
            />
            <Text style={[styles.detailText, { color: currentTheme.secondary }]}>
              {item.furnished ? "Furnished" : "Unfurnished"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.viewButton, { backgroundColor: currentTheme.primary }]}
          onPress={() => handleOpenDetails(item._id)}
        >
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.paginationRow}>
      <TouchableOpacity
        style={[
          styles.paginationButton,
          {
            backgroundColor: page === 1 ? currentTheme.muted : currentTheme.primary,
          },
        ]}
        onPress={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1}
      >
        <Text style={styles.paginationButtonText}>Previous</Text>
      </TouchableOpacity>

      <Text style={[styles.pageIndicator, { color: currentTheme.text }]}>
        Page {page} of {propertiesData?.totalPages || 1}
      </Text>

      <TouchableOpacity
        style={[
          styles.paginationButton,
          {
            backgroundColor:
              page >= (propertiesData?.totalPages || 1) ? currentTheme.muted : currentTheme.primary,
          },
        ]}
        onPress={() => setPage((p) => (p < (propertiesData?.totalPages || 1) ? p + 1 : p))}
        disabled={page >= (propertiesData?.totalPages || 1)}
      >
        <Text style={styles.paginationButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: currentTheme.background }]}>
        <ActivityIndicator size="large" color={currentTheme.primary} />
        <Text style={[styles.loadingText, { color: currentTheme.text }]}>
          Loading properties...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.center, { backgroundColor: currentTheme.background }]}>
        <Text style={[styles.errorText, { color: currentTheme.error }]}>
          Error loading properties.
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: currentTheme.primary }]}
          onPress={() => refetch()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.mainContainer, { backgroundColor: currentTheme.background }]}>
      {renderHeader()}

      <FlatList
        data={propertiesData?.data}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <Text style={[styles.emptyText, { color: currentTheme.muted }]}>
              No properties found matching your filters.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 10,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  filterContainer: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  filterSection: {
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  filterValue: {
    fontSize: 14,
    fontWeight: "400",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 16,
  },
  suggestions: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  favButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 5,
  },
  infoText: {
    fontSize: 14,
  },
  detailsRow: {
    flexDirection: "row",
    gap: 20,
    marginTop: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  detailText: {
    fontSize: 14,
  },
  viewButton: {
    marginTop: 15,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  viewButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  paginationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  paginationButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  paginationButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  pageIndicator: {
    fontWeight: "600",
  },
  emptyList: {
    flex: 1,
    alignItems: "center",
    marginTop: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
});