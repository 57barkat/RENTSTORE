import React, { useState, useMemo, useCallback } from "react";
import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
} from "react-native";
import {
  FontAwesome,
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../constants/Colors"; 
import { router, useFocusEffect } from "expo-router";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { useDebounce } from "use-debounce";
import {
  useAddToFavMutation,
  useGetFilteredPropertiesQuery,
  useRemoveUserFavoriteMutation,
} from "@/services/api";
import { pakistaniCities } from "@/utils/cities";
import karachi from "../assets/images/karachi.jpg";
import lahore from "../assets/images/lahore.jpg";
import islamabad from "../assets/images/islamabad.jpg";
import peshawer from "../assets/images/peshawer.jpg";

// --- Types ---
interface Property {
  _id: string;
  title: string;
  monthlyRent: number;
  photos?: string[];
  isFav?: boolean;
  address?: { city?: string; country?: string }[];
  capacityState?: { Persons?: number; beds?: number; bathrooms?: number };
}

interface RentRange {
  min?: number;
  max?: number;
}

// --- Constants ---
const POPULAR_CITIES = [
  { name: "Islamabad", image: islamabad },
  { name: "Lahore", image: lahore },
  { name: "Karachi", image: karachi },
  { name: "Peshawer", image: peshawer },
];

const dummyFilterOptions = {
  cities: pakistaniCities,
  bedrooms: [1, 2, 3, 4, 5, 6, 7],
  rentRange: { min: 0, max: 100000 },
};

// --- Component ---
export default function ListAllProperties() {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const [page, setPage] = useState(1);
  const limit = 5;

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch] = useDebounce(searchInput, 500);
  const [rentRange, setRentRange] = useState<RentRange>({
    min: dummyFilterOptions.rentRange.min,
    max: dummyFilterOptions.rentRange.max,
  });
  const [beds, setBeds] = useState<number | null>(null);
  const [loadingFavId, setLoadingFavId] = useState<string | null>(null);
  

  // ✅ Query parameters
  const filteredPropertiesParams = useMemo(
    () => ({
      page,
      limit,
      city: debouncedSearch || "",
      minRent: rentRange.min ?? dummyFilterOptions.rentRange.min,
      maxRent: rentRange.max ?? dummyFilterOptions.rentRange.max,
      beds: beds ?? undefined,
    }),
    [page, limit, debouncedSearch, rentRange.min, rentRange.max, beds]
  );

  const {
    data: propertiesData,
    isError,
    isLoading,
    refetch,
  } = useGetFilteredPropertiesQuery(filteredPropertiesParams);

  const [addToFav] = useAddToFavMutation();
  const [removeUserFavorite] = useRemoveUserFavoriteMutation();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // --- Handlers ---
  const handleToggleFav = async (propertyId: string, isFav?: boolean) => {
    try {
      setLoadingFavId(propertyId);
      if (isFav) await removeUserFavorite({ propertyId });
      else await addToFav({ propertyId });

      refetch();
    } catch (err) {
      console.log("Fav error:", err);
    } finally {
      setLoadingFavId(null);
    }
  };

  const handleOpenDetails = (id: string) => router.push(`/property/${id}`);

  const handleCityPress = (city: string) => {
    setSearchInput(city);
    setPage(1);
  };

  const handleBedsChange = (value: number) => {
    setBeds((prev) => (prev === value ? null : value));
    setPage(1);
  };

  const handleRentChange = (values: number[]) => {
    setRentRange({ min: values[0], max: values[1] });
    setPage(1);
  };

  // --- Header ---
  const header = useMemo(
    () => (
      <View
        style={[
          styles.headerContainer,
          { backgroundColor: currentTheme.background },
        ]}
      >
        {/* --- Search --- */}
        <View style={styles.searchRow}>
          <View
            style={[
              styles.searchInputContainer,
              {
                borderColor: currentTheme.border,
                backgroundColor: currentTheme.card,
              },
            ]}
          >
            <Feather name="search" size={20} color={currentTheme.primary} />
            <TextInput
              style={[styles.searchInput, { color: currentTheme.text }]}
              placeholder="Search city, neighborhood..."
              placeholderTextColor={currentTheme.muted}
              value={searchInput}
              onChangeText={setSearchInput}
              autoCorrect={false}
            />
          </View>
        </View>

        {/* --- Popular Cities --- */}
        <View style={styles.popularCitiesContainer}>
          <Text
            style={[
              styles.sectionTitle,
              { color: currentTheme.text, marginBottom: 12 },
            ]}
          >
            Explore Destinations
          </Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={POPULAR_CITIES}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.cityImageCard,
                  { backgroundColor: currentTheme.card },
                ]}
                onPress={() => handleCityPress(item.name)}
              >
                <Image
                  source={item.image}
                  style={styles.cityImage}
                  resizeMode="cover"
                />
                <View style={styles.cityTextOverlay}>
                  <Text style={styles.cityOverlayName}>{item.name}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* --- Beds Filter --- */}
        <Text
          style={[
            styles.sectionTitle,
            { color: currentTheme.text, marginTop: 15, marginBottom: 8 },
          ]}
        >
          Filter by Beds
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}
        >
          {dummyFilterOptions.bedrooms.map((b) => (
            <TouchableOpacity
              key={b}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    beds === b ? currentTheme.primary : currentTheme.card,
                  borderColor:
                    beds === b ? currentTheme.primary : currentTheme.border,
                },
              ]}
              onPress={() => handleBedsChange(b)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: beds === b ? "#fff" : currentTheme.text },
                ]}
              >
                {b} {b > 1 ? "Beds" : "Bed"}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* --- Rent Range --- */}
        <View style={styles.rangeContainer}>
          <Text
            style={[
              styles.sectionTitle,
              { color: currentTheme.text, marginBottom: 8 },
            ]}
          >
            Monthly Rent Range
          </Text>
          <Text
            style={[styles.rangeValueText, { color: currentTheme.primary }]}
          >
            Rs. {rentRange.min?.toLocaleString()} - Rs.{" "}
            {rentRange.max?.toLocaleString()}
          </Text>

          <MultiSlider
            values={[rentRange.min ?? 0, rentRange.max ?? 100000]}
            sliderLength={280}
            min={dummyFilterOptions.rentRange.min}
            max={dummyFilterOptions.rentRange.max}
            step={5000}
            onValuesChange={handleRentChange}
            selectedStyle={{ backgroundColor: currentTheme.primary }}
            unselectedStyle={{ backgroundColor: currentTheme.border }}
            markerStyle={{
              backgroundColor: currentTheme.primary,
              height: 20,
              width: 20,
            }}
            containerStyle={{ alignSelf: "center" }}
          />
        </View>

        <Text style={[styles.resultsTitle, { color: currentTheme.text }]}>
          Available Listings ({propertiesData?.total || 0})
        </Text>
      </View>
    ),
    [currentTheme, searchInput, beds, rentRange, propertiesData?.total]
  );

  // --- Property Card ---
  const renderItem = ({ item }: { item: Property }) => {
    const imageUri =
      item.photos?.[0] ||
      "https://images.unsplash.com/photo-1579737222180-863a35b1c97a?fit=crop&w=600&q=80";
    const address = item.address?.[0];
    const city = address?.city || "N/A";
    const country = address?.country || "";
    const Persons = item.capacityState?.Persons || "N/A";
    const bedsCount = item.capacityState?.beds || "N/A";
    const baths = item.capacityState?.bathrooms || "N/A";

    return (
      <TouchableOpacity
        style={[styles.propertyCard, { backgroundColor: currentTheme.card }]}
        onPress={() => handleOpenDetails(item._id)}
      >
        <Image source={{ uri: imageUri }} style={styles.cardImage} />

        <TouchableOpacity
          style={styles.favButton}
          onPress={() => handleToggleFav(item._id, item.isFav)}
          disabled={loadingFavId === item._id}
        >
          {loadingFavId === item._id ? (
            <ActivityIndicator size={18} color="#fff" />
          ) : (
            <FontAwesome
              name={item.isFav ? "heart" : "heart-o"}
              size={20}
              color={item.isFav ? currentTheme.danger : "#fff"}
            />
          )}
        </TouchableOpacity>

        <View style={styles.cardContent}>
          <Text
            style={[styles.cardTitle, { color: currentTheme.text }]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text
            style={[styles.locationText, { color: currentTheme.muted }]}
            numberOfLines={1}
          >
            <Feather name="map-pin" size={14} color={currentTheme.muted} />{" "}
            {city}, {country}
          </Text>

          <View style={styles.capacityRowCard}>
            <Text style={[styles.capacityText, { color: currentTheme.muted }]}>
              <MaterialCommunityIcons
                name="account-group-outline"
                size={14}
                color={currentTheme.muted}
              />{" "}
              {Persons} Persons
            </Text>
            <Text style={[styles.capacityText, { color: currentTheme.muted }]}>
              <MaterialCommunityIcons
                name="bed-outline"
                size={14}
                color={currentTheme.muted}
              />{" "}
              {bedsCount} Beds
            </Text>
            <Text style={[styles.capacityText, { color: currentTheme.muted }]}>
              <MaterialCommunityIcons
                name="bathtub-outline"
                size={14}
                color={currentTheme.muted}
              />{" "}
              {baths} Baths
            </Text>
          </View>

          <View style={styles.priceContainerCard}>
            <Text style={[styles.priceText, { color: currentTheme.primary }]}>
              Rs. {item.monthlyRent?.toLocaleString()}
            </Text>
            <Text
              style={[styles.priceDurationText, { color: currentTheme.muted }]}
            >
              / month
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // --- Pagination ---
  const renderFooter = () => (
    <View style={styles.paginationRow}>
      <TouchableOpacity
        style={[
          styles.paginationButton,
          {
            backgroundColor:
              page === 1 ? currentTheme.border : currentTheme.primary,
          },
        ]}
        onPress={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1}
      >
        <Text style={styles.paginationButtonText}>Previous</Text>
      </TouchableOpacity>

      <Text style={[styles.pageIndicator, { color: currentTheme.text }]}>
        {page} / {propertiesData?.totalPages || 1}
      </Text>

      <TouchableOpacity
        style={[
          styles.paginationButton,
          {
            backgroundColor:
              page >= (propertiesData?.totalPages || 1)
                ? currentTheme.border
                : currentTheme.primary,
          },
        ]}
        onPress={() =>
          setPage((p) => (p < (propertiesData?.totalPages || 1) ? p + 1 : p))
        }
        disabled={page >= (propertiesData?.totalPages || 1)}
      >
        <Text style={styles.paginationButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && page === 1) {
    return (
      <View
        style={[styles.center, { backgroundColor: currentTheme.background }]}
      >
        <ActivityIndicator size="large" color={currentTheme.primary} />
        <Text style={[styles.loadingText, { color: currentTheme.text }]}>
          Fetching beautiful homes...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View
        style={[styles.center, { backgroundColor: currentTheme.background }]}
      >
        <Text style={[styles.errorText, { color: currentTheme.danger }]}>
          Network Error. Could not load properties. 😔
        </Text>
        <TouchableOpacity
          style={[
            styles.retryButton,
            { backgroundColor: currentTheme.primary },
          ]}
          onPress={refetch}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={propertiesData?.data}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      ListHeaderComponent={header}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={
        <View style={styles.emptyList}>
          <Text style={[styles.emptyText, { color: currentTheme.muted }]}>
            No properties found matching your filters.
          </Text>
          <MaterialCommunityIcons
            name="home-search-outline"
            size={50}
            color={currentTheme.muted}
            style={{ marginTop: 10 }}
          />
        </View>
      }
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingBottom: 40,
        backgroundColor: currentTheme.background,
      }}
      showsVerticalScrollIndicator={false}
    />
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: { marginTop: 10, fontSize: 16, fontWeight: "500" },
  errorText: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  retryButton: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10 },
  retryButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  headerContainer: { paddingBottom: 16, paddingTop: 10 },
  searchRow: { flexDirection: "row", marginBottom: 15 },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 15,
    height: 55,
    elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 16, marginLeft: 10, fontWeight: "500" },
  popularCitiesContainer: { marginVertical: 10, paddingLeft: 5 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginLeft: 8 },
  resultsTitle: {
    fontSize: 18,
    marginLeft: 13,
    fontWeight: "700",
    marginTop: 15,
    marginBottom: 10,
  },
  cityImageCard: {
    width: 140,
    height: 140,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 12,
    elevation: 3,
  },
  cityImage: { width: "100%", height: "100%" },
  cityTextOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-end",
    padding: 10,
  },
  cityOverlayName: { color: "#fff", fontSize: 16, fontWeight: "700" },
  filterScrollView: { marginBottom: 10 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 25,
    borderWidth: 1,
    marginRight: 10,
  },
  chipText: { fontWeight: "600", fontSize: 14 },
  rangeContainer: { marginVertical: 10, paddingHorizontal: 5 },
  rangeValueText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 5,
  },
  propertyCard: {
    padding: 18,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  favButton: {
    position: "absolute",
    top: 25,
    right: 25,
    zIndex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: { padding: 15 },
  cardTitle: { fontSize: 20, fontWeight: "800", marginBottom: 4 },
  locationText: { fontSize: 14, marginVertical: 4, fontWeight: "500" },
  capacityRowCard: { flexDirection: "row", gap: 15, marginVertical: 8 },
  capacityText: { fontSize: 13, fontWeight: "500" },
  priceContainerCard: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 8,
  },
  priceText: { fontSize: 18, fontWeight: "700" },
  priceDurationText: { fontSize: 13, fontWeight: "500", marginLeft: 5 },
  paginationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    width: "100%",
    paddingHorizontal: 10,
  },
  paginationButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  paginationButtonText: { color: "#fff", fontWeight: "bold" },
  pageIndicator: { fontSize: 16, fontWeight: "600" },
  emptyList: { alignItems: "center", marginTop: 50 },
  emptyText: { fontSize: 16, fontWeight: "500", textAlign: "center" },
});
