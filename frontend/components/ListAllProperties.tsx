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
  Animated,
} from "react-native";
import {
  FontAwesome,
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../constants/Colors";
import { router, useFocusEffect } from "expo-router";
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
import FilterBar from "./FilterBar";

// --- Constants ---
const POPULAR_CITIES = [
  { name: "Islamabad", image: islamabad },
  { name: "Lahore", image: lahore },
  { name: "Karachi", image: karachi },
  { name: "Peshawer", image: peshawer },
];

const RENT_OPTIONS = [
  0, 1000, 5000, 10000, 20000, 50000, 75000, 100000, 150000, 200000, 500000,
  1000000,
];

const FILTER_OPTIONS = {
  cities: pakistaniCities,
  bedrooms: [1, 2, 3, 4, 5, 6, 7],
  rentRangeOptions: RENT_OPTIONS,
  rentTypes: ["daily", "weekly", "monthly"],
  propertyTypes: ["house", "apartment", "room", "hostel"],
};
// --- Filter Chip ---
const FilterChip = ({ label, onRemove, currentTheme }: any) => (
  <TouchableOpacity
    style={{
      backgroundColor: currentTheme.primary,
      paddingVertical: 7,
      paddingHorizontal: 14,
      borderRadius: 22,
      marginRight: 6,
      marginBottom: 6,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 3,
    }}
    onPress={onRemove}
    activeOpacity={0.8}
  >
    <Text
      style={{ color: "#fff", marginRight: 6, fontWeight: "600", fontSize: 13 }}
    >
      {label}
    </Text>
    <Feather name="x" size={14} color="#fff" />
  </TouchableOpacity>
);

// --- Main Component ---
export default function ListAllProperties() {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const [page, setPage] = useState(1);
  const limit = 5;
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch] = useDebounce(searchInput, 500);
<<<<<<< Updated upstream
=======
  const [rentRange, setRentRange] = useState<RentRange>({
    min: dummyFilterOptions.rentRange.min,
    max: dummyFilterOptions.rentRange.max,
  });
  const [beds, setBeds] = useState<number | null>(null);
  const [loadingFavId, setLoadingFavId] = useState<string | null>(null);
>>>>>>> Stashed changes

  const [filters, setFilters] = useState({
    beds: null as number | null,
    propertyType: "house",
    minRent: FILTER_OPTIONS.rentRangeOptions[0],
    maxRent: FILTER_OPTIONS.rentRangeOptions[6],
    rentType: "",
  });

  const { beds, propertyType, minRent, maxRent, rentType } = filters;

  const handleApplyFilters = () => setPage(1);
  const handleCityPress = (city: string) => {
    setSearchInput(city);
    setPage(1);
  };
  const resetFilters = () => {
    setFilters({
      beds: null,
      propertyType: "house",
      minRent: FILTER_OPTIONS.rentRangeOptions[0],
      maxRent: FILTER_OPTIONS.rentRangeOptions[6],
      rentType: "",
    });
    setSearchInput("");
    setPage(1);
  };

  const filteredPropertiesParams = useMemo(() => {
    const params: Record<string, any> = {
      page,
      limit,
      city: debouncedSearch || "",
      propertyType: filters.propertyType,
    };
    if (filters.beds !== null) params.beds = filters.beds;
    if (filters.minRent != null) params.minRent = Number(filters.minRent);
    if (filters.maxRent != null) params.maxRent = Number(filters.maxRent);
    if (filters.rentType) params.rentType = filters.rentType;
    return params;
  }, [page, limit, debouncedSearch, filters]);

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

  const handleToggleFav = async (propertyId: string, isFav?: boolean) => {
    try {
      if (isFav) await removeUserFavorite({ propertyId });
      else await addToFav({ propertyId });
      refetch();
    } catch (err) {
      console.log("Fav error:", err);
    }
  };

  const handleOpenDetails = (id: string) => router.push(`/property/${id}`);

  const header = useMemo(
    () => (
      <View
        style={[
          styles.headerContainer,
          { backgroundColor: currentTheme.background },
        ]}
      >
        {/* Search */}
        <View style={[styles.searchRow, { marginTop: 10 }]}>
          <View
            style={[
              styles.searchInputContainer,
              {
                borderColor: currentTheme.border,
                backgroundColor: currentTheme.card,
                elevation: 4,
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

        {/* Popular Cities */}
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
          Explore Destinations
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 10 }}
        >
          {POPULAR_CITIES.map((city) => (
            <TouchableOpacity
              key={city.name}
              onPress={() => handleCityPress(city.name)}
              style={[
                styles.cityImageCard,
                { backgroundColor: currentTheme.card },
              ]}
              activeOpacity={0.85}
            >
              <Image source={city.image} style={styles.cityImage} />
              <View style={styles.cityGradientOverlay} />
              <View style={styles.cityTextOverlay}>
                <Text style={styles.cityOverlayName}>{city.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Active Filters */}
        <View
          style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 10 }}
        >
          {beds && (
            <FilterChip
              label={`${beds} Beds`}
              onRemove={() => setFilters((prev) => ({ ...prev, beds: null }))}
              currentTheme={currentTheme}
            />
          )}
          {propertyType && (
            <FilterChip
              label={propertyType}
              onRemove={() =>
                setFilters((prev) => ({ ...prev, propertyType: "" }))
              }
              currentTheme={currentTheme}
            />
          )}
          {(minRent !== FILTER_OPTIONS.rentRangeOptions[0] ||
            maxRent !== FILTER_OPTIONS.rentRangeOptions[6]) && (
            <FilterChip
              label={`Rs ${minRent?.toLocaleString()} - ${maxRent?.toLocaleString()}`}
              onRemove={() =>
                setFilters((prev) => ({
                  ...prev,
                  minRent: FILTER_OPTIONS.rentRangeOptions[0],
                  maxRent: FILTER_OPTIONS.rentRangeOptions[6],
                }))
              }
              currentTheme={currentTheme}
            />
          )}
          {rentType && (
            <FilterChip
              label={rentType.charAt(0).toUpperCase() + rentType.slice(1)}
              onRemove={() =>
                setFilters((prev) => ({ ...prev, rentType: "monthly" }))
              }
              currentTheme={currentTheme}
            />
          )}
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 10,
            gap: 10,
            marginBottom: 15,
          }}
        >
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            onApply={handleApplyFilters}
          />

          <TouchableOpacity
            style={{
              paddingVertical: 8,
              paddingHorizontal: 18,
              backgroundColor: currentTheme.danger,
              borderRadius: 20,
              elevation: 2,
            }}
            onPress={resetFilters}
            activeOpacity={0.8}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              Reset All Filters
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.resultsTitle, { color: currentTheme.text }]}>
          Available Listings ({propertiesData?.total || 0})
        </Text>
      </View>
    ),
    [
      currentTheme,
      searchInput,
      beds,
      propertyType,
      minRent,
      maxRent,
      propertiesData?.total,
      rentType,
    ]
  );

  // --- Property Card ---
  const renderItem = ({ item }: { item: any }) => {
    const imageUri =
      item.photos?.[0] ||
      "https://images.unsplash.com/photo-1579737222180-863a35b1c97a?fit=crop&w=600&q=80";

    // Determine which rent rate to show
    const selectedRate =
      item.rentRates?.find((r: any) => r.type === rentType) ||
      item.rentRates?.[0];

    return (
      <TouchableOpacity
        style={[styles.propertyCard, { backgroundColor: currentTheme.card }]}
        onPress={() => handleOpenDetails(item._id)}
        activeOpacity={0.9}
      >
        <Image source={{ uri: imageUri }} style={styles.cardImage} />

        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.favButton}
          onPress={() => handleToggleFav(item._id, item.isFav)}
        >
          <FontAwesome
            name={item.isFav ? "heart" : "heart-o"}
            size={20}
            color={item.isFav ? currentTheme.danger : "#fff"}
          />
        </TouchableOpacity>

        <View style={styles.cardContent}>
          {/* Title */}
          <Text
            style={[styles.cardTitle, { color: currentTheme.text }]}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          {/* Location */}
          <Text
            style={[styles.locationText, { color: currentTheme.muted }]}
            numberOfLines={1}
          >
            <Feather name="map-pin" size={14} color={currentTheme.muted} />{" "}
            {item.location?.city}, {item.location?.country || ""}
          </Text>

          {/* Capacity Row */}
          <View style={styles.capacityRowCard}>
            <Text style={[styles.capacityText, { color: currentTheme.muted }]}>
              <MaterialCommunityIcons
                name="account-group-outline"
                size={14}
                color={currentTheme.muted}
              />{" "}
              {item.capacity?.persons || "N/A"} persons
            </Text>

            <Text style={[styles.capacityText, { color: currentTheme.muted }]}>
              <MaterialCommunityIcons
                name="bed-outline"
                size={14}
                color={currentTheme.muted}
              />{" "}
              {item.capacity?.beds || "N/A"} Beds
            </Text>

            <Text style={[styles.capacityText, { color: currentTheme.muted }]}>
              <MaterialCommunityIcons
                name="bathtub-outline"
                size={14}
                color={currentTheme.muted}
              />{" "}
              {item.capacity?.bathrooms || "N/A"} Baths
            </Text>
          </View>

          {/* Price Section */}
          <View style={styles.priceContainerCard}>
            <Text style={[styles.priceText, { color: currentTheme.primary }]}>
              Rs. {selectedRate?.amount?.toLocaleString() || "N/A"}
            </Text>
            <Text
              style={[styles.priceDurationText, { color: currentTheme.muted }]}
            >
              / {selectedRate?.type || ""}
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
        activeOpacity={0.8}
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
          setPage((p) => Math.min(propertiesData?.totalPages || 1, p + 1))
        }
        disabled={page >= (propertiesData?.totalPages || 1)}
        activeOpacity={0.8}
      >
        <Text style={styles.paginationButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && page === 1)
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

  if (isError)
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
          activeOpacity={0.8}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <FlatList
      data={propertiesData?.data}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      ListHeaderComponent={header}
      ListFooterComponent={renderFooter}
      contentContainerStyle={{ paddingBottom: 40 }}
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
  loadingText: { marginTop: 12, fontSize: 16, fontWeight: "500" },
  errorText: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  retryButton: { padding: 12, borderRadius: 25 },
  retryButtonText: { color: "#fff", fontWeight: "600" },

  headerContainer: { paddingHorizontal: 16, paddingBottom: 20 },
  searchRow: { flexDirection: "row", marginBottom: 15 },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    flex: 1,
    height: 45,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    marginTop: 15,
  },
  resultsTitle: { fontSize: 20, fontWeight: "700", marginVertical: 15 },

  cityImageCard: {
    width: 130,
    height: 90,
    borderRadius: 14,
    marginRight: 12,
    overflow: "hidden",
    elevation: 4,
  },
  cityImage: { width: "100%", height: "100%", borderRadius: 14 },
  cityGradientOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  cityTextOverlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingVertical: 5,
    alignItems: "center",
  },
  cityOverlayName: { color: "#fff", fontWeight: "700", fontSize: 14 },

  filterScrollView: { marginBottom: 10 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  chipText: { marginLeft: 6, fontWeight: "500" },

  dropdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  dropdownContainer: { flex: 1, marginRight: 8 },
  dropdownLabel: { marginBottom: 5, fontWeight: "600" },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dropdownButtonText: { fontWeight: "500" },
  dropdownOptionsContainer: {
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 160,
    zIndex: 999,
  },
  dropdownScrollView: { paddingVertical: 5 },
  dropdownOption: { paddingVertical: 8, paddingHorizontal: 12 },

  propertyCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cardImage: { width: "100%", height: 200 },
  favButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  cardContent: { padding: 14 },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  locationText: { fontSize: 12, marginBottom: 6 },
  capacityRowCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  capacityText: { fontSize: 12, flex: 1, textAlign: "center" },
  priceContainerCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  priceText: { fontWeight: "700", fontSize: 16 },
  priceDurationText: { marginLeft: 6, fontSize: 12 },

  paginationRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  paginationButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 25,
    marginHorizontal: 10,
  },
  paginationButtonText: { color: "#fff", fontWeight: "600" },
  pageIndicator: { fontSize: 16, fontWeight: "600" },
});

// import React, { useState, useMemo, useCallback } from "react";
// import {
//   Text,
//   View,
//   FlatList,
//   ActivityIndicator,
//   TouchableOpacity,
//   StyleSheet,
//   TextInput,
//   Image,
//   ScrollView,
// } from "react-native";
// import {
//   FontAwesome,
//   MaterialCommunityIcons,
//   Feather,
// } from "@expo/vector-icons";
// import { useTheme } from "@/contextStore/ThemeContext";
// import { Colors } from "../constants/Colors";
// import { router, useFocusEffect } from "expo-router";
// import { useDebounce } from "use-debounce";
// import {
//   useAddToFavMutation,
//   useGetFilteredPropertiesQuery,
//   useRemoveUserFavoriteMutation,
// } from "@/services/api";
// import { pakistaniCities } from "@/utils/cities";
// import karachi from "../assets/images/karachi.jpg";
// import lahore from "../assets/images/lahore.jpg";
// import islamabad from "../assets/images/islamabad.jpg";
// import peshawer from "../assets/images/peshawer.jpg";

// // --- Constants ---
// const POPULAR_CITIES = [
//   { name: "Islamabad", image: islamabad },
//   { name: "Lahore", image: lahore },
//   { name: "Karachi", image: karachi },
//   { name: "Peshawer", image: peshawer },
// ];

// const RENT_OPTIONS = [
//   0, 1000, 5000, 10000, 20000, 50000, 75000, 100000, 150000, 200000, 500000,
//   1000000,
// ];

// const FILTER_OPTIONS = {
//   cities: pakistaniCities,
//   bedrooms: [1, 2, 3, 4, 5, 6, 7],
//   rentRangeOptions: RENT_OPTIONS,
//   rentTypes: ["daily", "weekly", "monthly"],
//   propertyTypes: ["house", "apartment", "room", "hostel"],
// };

// // --- Dropdown Selector ---
// const SimpleDropdown = ({
//   label,
//   value,
//   options,
//   onSelect,
//   currentTheme,
// }: any) => {
//   const [isOpen, setIsOpen] = useState(false);

//   const filteredOptions = useMemo(() => {
//     return options.sort((a: number, b: number) => a - b);
//   }, [options]);

//   return (
//     <View style={styles.dropdownContainer}>
//       <Text style={[styles.dropdownLabel, { color: currentTheme.text }]}>
//         {label}
//       </Text>
//       <TouchableOpacity
//         style={[
//           styles.dropdownButton,
//           {
//             borderColor: currentTheme.border,
//             backgroundColor: currentTheme.card,
//           },
//         ]}
//         onPress={() => setIsOpen(!isOpen)}
//       >
//         <Text style={[styles.dropdownButtonText, { color: currentTheme.text }]}>
//           Rs. {value.toLocaleString()}
//         </Text>
//         <Feather
//           name={isOpen ? "chevron-up" : "chevron-down"}
//           size={18}
//           color={currentTheme.muted}
//         />
//       </TouchableOpacity>
//       {isOpen && (
//         <View
//           style={[
//             styles.dropdownOptionsContainer,
//             {
//               backgroundColor: currentTheme.card,
//               borderColor: currentTheme.border,
//             },
//           ]}
//         >
//           <ScrollView style={styles.dropdownScrollView} nestedScrollEnabled>
//             {filteredOptions.map((option: number) => (
//               <TouchableOpacity
//                 key={option}
//                 style={[
//                   styles.dropdownOption,
//                   {
//                     backgroundColor:
//                       option === value ? currentTheme.primary : "transparent",
//                   },
//                 ]}
//                 onPress={() => {
//                   onSelect(option);
//                   setIsOpen(false);
//                 }}
//               >
//                 <Text
//                   style={{
//                     color: option === value ? "#fff" : currentTheme.text,
//                     fontWeight: option === value ? "700" : "400",
//                   }}
//                 >
//                   Rs. {option.toLocaleString()}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         </View>
//       )}
//     </View>
//   );
// };

// // --- Filter Chip ---
// const FilterChip = ({ label, onRemove, currentTheme }: any) => (
//   <TouchableOpacity
//     style={{
//       backgroundColor: currentTheme.primary,
//       paddingVertical: 6,
//       paddingHorizontal: 12,
//       borderRadius: 20,
//       marginRight: 6,
//       marginBottom: 6,
//       flexDirection: "row",
//       alignItems: "center",
//       elevation: 2,
//     }}
//     onPress={onRemove}
//   >
//     <Text style={{ color: "#fff", marginRight: 5, fontWeight: "600" }}>
//       {label}
//     </Text>
//     <Feather name="x" size={14} color="#fff" />
//   </TouchableOpacity>
// );

// // --- Main Component ---
// export default function ListAllProperties() {
//   const { theme } = useTheme();
//   const currentTheme = Colors[theme ?? "light"];

//   const [page, setPage] = useState(1);
//   const limit = 5;

//   const [searchInput, setSearchInput] = useState("");
//   const [debouncedSearch] = useDebounce(searchInput, 500);

//   const [rentRange, setRentRange] = useState({
//     min: FILTER_OPTIONS.rentRangeOptions[0],
//     max: FILTER_OPTIONS.rentRangeOptions[6],
//     type: "monthly",
//   });
//   const [beds, setBeds] = useState<number | null>(null);
//   const [propertyType, setPropertyType] = useState<string>("house");

//   const filteredPropertiesParams = useMemo(() => {
//     const params: Record<string, any> = {
//       page,
//       limit,
//       city: debouncedSearch || "",
//       propertyType,
//     };
//     if (beds !== null) params.beds = beds;
//     if (rentRange.min != null) params.minRent = Number(rentRange.min);
//     if (rentRange.max != null) params.maxRent = Number(rentRange.max);
//     if (rentRange.type) params.rentType = rentRange.type;
//     return params;
//   }, [page, limit, debouncedSearch, rentRange, beds, propertyType]);

//   const {
//     data: propertiesData,
//     isError,
//     isLoading,
//     refetch,
//   } = useGetFilteredPropertiesQuery(filteredPropertiesParams);

//   const [addToFav] = useAddToFavMutation();
//   const [removeUserFavorite] = useRemoveUserFavoriteMutation();

//   useFocusEffect(
//     useCallback(() => {
//       refetch();
//     }, [refetch])
//   );

//   const handleToggleFav = async (propertyId: string, isFav?: boolean) => {
//     try {
//       if (isFav) await removeUserFavorite({ propertyId });
//       else await addToFav({ propertyId });
//       refetch();
//     } catch (err) {
//       console.log("Fav error:", err);
//     }
//   };

//   const handleOpenDetails = (id: string) => router.push(`/property/${id}`);
//   const handleCityPress = (city: string) => {
//     setSearchInput(city);
//     setPage(1);
//   };
//   const handleBedsChange = (value: number) => {
//     setBeds((prev) => (prev === value ? null : value));
//     setPage(1);
//   };
//   const handlePropertyTypeChange = (type: string) => {
//     setPropertyType(type);
//     setPage(1);
//   };
//   const handleMinRentChange = (value: number) => {
//     setRentRange((prev) => ({
//       ...prev,
//       min: value,
//       max: value > prev.max ? value : prev.max,
//     }));
//     setPage(1);
//   };
//   const handleMaxRentChange = (value: number) => {
//     setRentRange((prev) => ({
//       ...prev,
//       max: value,
//       min: value < prev.min ? value : prev.min,
//     }));
//     setPage(1);
//   };
//   const handleRentTypeChange = (type: string) => {
//     setRentRange((prev) => ({ ...prev, type }));
//     setPage(1);
//   };

//   const resetFilters = () => {
//     setBeds(null);
//     setPropertyType("house");
//     setRentRange({
//       min: FILTER_OPTIONS.rentRangeOptions[0],
//       max: FILTER_OPTIONS.rentRangeOptions[6],
//       type: "monthly",
//     });
//     setSearchInput("");
//     setPage(1);
//   };

//   const header = useMemo(
//     () => (
//       <View
//         style={[
//           styles.headerContainer,
//           { backgroundColor: currentTheme.background },
//         ]}
//       >
//         {/* Search */}
//         <View style={styles.searchRow}>
//           <View
//             style={[
//               styles.searchInputContainer,
//               {
//                 borderColor: currentTheme.border,
//                 backgroundColor: currentTheme.card,
//               },
//             ]}
//           >
//             <Feather name="search" size={20} color={currentTheme.primary} />
//             <TextInput
//               style={[styles.searchInput, { color: currentTheme.text }]}
//               placeholder="Search city, neighborhood..."
//               placeholderTextColor={currentTheme.muted}
//               value={searchInput}
//               onChangeText={setSearchInput}
//               autoCorrect={false}
//             />
//           </View>
//         </View>

//         {/* Popular Cities */}
//         <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
//           Explore Destinations
//         </Text>
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           style={{ marginBottom: 10 }}
//         >
//           {POPULAR_CITIES.map((city) => (
//             <TouchableOpacity
//               key={city.name}
//               onPress={() => handleCityPress(city.name)}
//               style={[
//                 styles.cityImageCard,
//                 { backgroundColor: currentTheme.card },
//               ]}
//             >
//               <Image source={city.image} style={styles.cityImage} />
//               <View style={styles.cityTextOverlay}>
//                 <Text style={styles.cityOverlayName}>{city.name}</Text>
//               </View>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>

//         {/* Active Filters */}
//         <View
//           style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 10 }}
//         >
//           {beds && (
//             <FilterChip
//               label={`${beds} Beds`}
//               onRemove={() => setBeds(null)}
//               currentTheme={currentTheme}
//             />
//           )}
//           {propertyType && (
//             <FilterChip
//               label={propertyType}
//               onRemove={() => setPropertyType("")}
//               currentTheme={currentTheme}
//             />
//           )}
//           {(rentRange.min || rentRange.max) && (
//             <FilterChip
//               label={`Rs ${rentRange.min?.toLocaleString()} - ${rentRange.max?.toLocaleString()}`}
//               onRemove={() =>
//                 setRentRange({ min: 0, max: 100000, type: "monthly" })
//               }
//               currentTheme={currentTheme}
//             />
//           )}
//         </View>

//         <TouchableOpacity
//           style={{
//             padding: 10,
//             backgroundColor: currentTheme.danger,
//             borderRadius: 25,
//             alignSelf: "center",
//             marginBottom: 15,
//           }}
//           onPress={resetFilters}
//         >
//           <Text style={{ color: "#fff", fontWeight: "600" }}>
//             Reset Filters
//           </Text>
//         </TouchableOpacity>

//         {/* Beds */}
//         <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
//           Beds
//         </Text>
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           style={styles.filterScrollView}
//         >
//           {FILTER_OPTIONS.bedrooms.map((b) => (
//             <TouchableOpacity
//               key={b}
//               style={[
//                 styles.chip,
//                 {
//                   backgroundColor:
//                     beds === b ? currentTheme.primary : currentTheme.card,
//                   borderColor:
//                     beds === b ? currentTheme.primary : currentTheme.border,
//                 },
//               ]}
//               onPress={() => handleBedsChange(b)}
//             >
//               <MaterialCommunityIcons
//                 name={beds === b ? "bed-double" : "bed-outline"}
//                 size={16}
//                 color={beds === b ? "#fff" : currentTheme.text}
//               />
//               <Text
//                 style={[
//                   styles.chipText,
//                   { color: beds === b ? "#fff" : currentTheme.text },
//                 ]}
//               >
//                 {b}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>

//         {/* Property Type */}
//         <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
//           Property Type
//         </Text>
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           style={styles.filterScrollView}
//         >
//           {FILTER_OPTIONS.propertyTypes.map((pt) => (
//             <TouchableOpacity
//               key={pt}
//               style={[
//                 styles.chip,
//                 {
//                   backgroundColor:
//                     propertyType === pt
//                       ? currentTheme.primary
//                       : currentTheme.card,
//                   borderColor:
//                     propertyType === pt
//                       ? currentTheme.primary
//                       : currentTheme.border,
//                 },
//               ]}
//               onPress={() => handlePropertyTypeChange(pt)}
//             >
//               <Text
//                 style={[
//                   styles.chipText,
//                   { color: propertyType === pt ? "#fff" : currentTheme.text },
//                 ]}
//               >
//                 {pt.charAt(0).toUpperCase() + pt.slice(1)}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>

//         {/* Rent Type */}
//         <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
//           Rent Type
//         </Text>
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           style={styles.filterScrollView}
//         >
//           {FILTER_OPTIONS.rentTypes.map((rt) => (
//             <TouchableOpacity
//               key={rt}
//               style={[
//                 styles.chip,
//                 {
//                   backgroundColor:
//                     rentRange.type === rt
//                       ? currentTheme.primary
//                       : currentTheme.card,
//                   borderColor:
//                     rentRange.type === rt
//                       ? currentTheme.primary
//                       : currentTheme.border,
//                 },
//               ]}
//               onPress={() => handleRentTypeChange(rt)}
//             >
//               <Text
//                 style={[
//                   styles.chipText,
//                   { color: rentRange.type === rt ? "#fff" : currentTheme.text },
//                 ]}
//               >
//                 {rt.charAt(0).toUpperCase() + rt.slice(1)}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>

//         {/* Rent Range Dropdowns */}
//         <View style={styles.dropdownRow}>
//           <SimpleDropdown
//             label="Min Rent (Rs)"
//             value={rentRange.min}
//             options={FILTER_OPTIONS.rentRangeOptions.filter(
//               (r) => r <= rentRange.max
//             )}
//             onSelect={handleMinRentChange}
//             currentTheme={currentTheme}
//           />
//           <SimpleDropdown
//             label="Max Rent (Rs)"
//             value={rentRange.max}
//             options={FILTER_OPTIONS.rentRangeOptions.filter(
//               (r) => r >= rentRange.min
//             )}
//             onSelect={handleMaxRentChange}
//             currentTheme={currentTheme}
//           />
//         </View>

//         <Text style={[styles.resultsTitle, { color: currentTheme.text }]}>
//           Available Listings ({propertiesData?.total || 0})
//         </Text>
//       </View>
//     ),
//     [
//       currentTheme,
//       searchInput,
//       beds,
//       propertyType,
//       rentRange,
//       propertiesData?.total,
//     ]
//   );

//   // --- Property Card ---
//   const renderItem = ({ item }: { item: any }) => {
//     const imageUri =
//       item.photos?.[0] ||
//       "https://images.unsplash.com/photo-1579737222180-863a35b1c97a?fit=crop&w=600&q=80";
//     return (
//       <TouchableOpacity
//         style={[styles.propertyCard, { backgroundColor: currentTheme.card }]}
//         onPress={() => handleOpenDetails(item._id)}
//       >
//         <Image source={{ uri: imageUri }} style={styles.cardImage} />
//         <TouchableOpacity
//           style={styles.favButton}
//           onPress={() => handleToggleFav(item._id, item.isFav)}
//         >
//           <FontAwesome
//             name={item.isFav ? "heart" : "heart-o"}
//             size={20}
//             color={item.isFav ? currentTheme.danger : "#fff"}
//           />
//         </TouchableOpacity>
//         <View style={styles.cardContent}>
//           <Text
//             style={[styles.cardTitle, { color: currentTheme.text }]}
//             numberOfLines={1}
//           >
//             {item.title}
//           </Text>
//           <Text
//             style={[styles.locationText, { color: currentTheme.muted }]}
//             numberOfLines={1}
//           >
//             <Feather name="map-pin" size={14} color={currentTheme.muted} />{" "}
//             {item.location?.city}, {item.location?.country || ""}
//           </Text>
//           <View style={styles.capacityRowCard}>
//             <Text style={[styles.capacityText, { color: currentTheme.muted }]}>
//               <MaterialCommunityIcons
//                 name="account-group-outline"
//                 size={14}
//                 color={currentTheme.muted}
//               />{" "}
//               {item.capacity?.persons || "N/A"} persons
//             </Text>
//             <Text style={[styles.capacityText, { color: currentTheme.muted }]}>
//               <MaterialCommunityIcons
//                 name="bed-outline"
//                 size={14}
//                 color={currentTheme.muted}
//               />{" "}
//               {item.capacity?.beds || "N/A"} Beds
//             </Text>
//             <Text style={[styles.capacityText, { color: currentTheme.muted }]}>
//               <MaterialCommunityIcons
//                 name="bathtub-outline"
//                 size={14}
//                 color={currentTheme.muted}
//               />{" "}
//               {item.capacity?.bathrooms || "N/A"} Baths
//             </Text>
//           </View>
//           <View style={styles.priceContainerCard}>
//             <Text style={[styles.priceText, { color: currentTheme.primary }]}>
//               Rs.{" "}
//               {item.rentRates
//                 ?.find((r: any) => r.type === rentRange.type)
//                 ?.amount?.toLocaleString() || "N/A"}
//             </Text>
//             <Text
//               style={[styles.priceDurationText, { color: currentTheme.muted }]}
//             >
//               / {rentRange.type}
//             </Text>
//           </View>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   // --- Pagination ---
//   const renderFooter = () => (
//     <View style={styles.paginationRow}>
//       <TouchableOpacity
//         style={[
//           styles.paginationButton,
//           {
//             backgroundColor:
//               page === 1 ? currentTheme.border : currentTheme.primary,
//           },
//         ]}
//         onPress={() => setPage((p) => Math.max(1, p - 1))}
//         disabled={page === 1}
//       >
//         <Text style={styles.paginationButtonText}>Previous</Text>
//       </TouchableOpacity>
//       <Text style={[styles.pageIndicator, { color: currentTheme.text }]}>
//         {page} / {propertiesData?.totalPages || 1}
//       </Text>
//       <TouchableOpacity
//         style={[
//           styles.paginationButton,
//           {
//             backgroundColor:
//               page >= (propertiesData?.totalPages || 1)
//                 ? currentTheme.border
//                 : currentTheme.primary,
//           },
//         ]}
//         onPress={() =>
//           setPage((p) => Math.min(propertiesData?.totalPages || 1, p + 1))
//         }
//         disabled={page >= (propertiesData?.totalPages || 1)}
//       >
//         <Text style={styles.paginationButtonText}>Next</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   if (isLoading && page === 1)
//     return (
//       <View
//         style={[styles.center, { backgroundColor: currentTheme.background }]}
//       >
//         <ActivityIndicator size="large" color={currentTheme.primary} />
//         <Text style={[styles.loadingText, { color: currentTheme.text }]}>
//           Fetching beautiful homes...
//         </Text>
//       </View>
//     );

//   if (isError)
//     return (
//       <View
//         style={[styles.center, { backgroundColor: currentTheme.background }]}
//       >
//         <Text style={[styles.errorText, { color: currentTheme.danger }]}>
//           Network Error. Could not load properties. 😔
//         </Text>
//         <TouchableOpacity
//           style={[
//             styles.retryButton,
//             { backgroundColor: currentTheme.primary },
//           ]}
//           onPress={refetch}
//         >
//           <Text style={styles.retryButtonText}>Try Again</Text>
//         </TouchableOpacity>
//       </View>
//     );

//   return (
//     <FlatList
//       data={propertiesData?.data}
//       keyExtractor={(item) => item._id}
//       renderItem={renderItem}
//       ListHeaderComponent={header}
//       ListFooterComponent={renderFooter}
//       contentContainerStyle={{ paddingBottom: 40 }}
//       showsVerticalScrollIndicator={false}
//     />
//   );
// }

// // --- Styles ---
// const styles = StyleSheet.create({
//   center: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   loadingText: { marginTop: 12, fontSize: 16, fontWeight: "500" },
//   errorText: {
//     fontSize: 18,
//     marginBottom: 15,
//     fontWeight: "600",
//     textAlign: "center",
//   },
//   retryButton: { padding: 12, borderRadius: 25 },
//   retryButtonText: { color: "#fff", fontWeight: "600" },

//   headerContainer: { paddingHorizontal: 16, paddingBottom: 20 },
//   searchRow: { flexDirection: "row", marginBottom: 15 },
//   searchInputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderRadius: 25,
//     paddingHorizontal: 15,
//     flex: 1,
//     height: 45,
//   },
//   searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginBottom: 10,
//     marginTop: 15,
//   },
//   resultsTitle: { fontSize: 20, fontWeight: "700", marginVertical: 15 },

//   cityImageCard: {
//     width: 120,
//     height: 80,
//     borderRadius: 12,
//     marginRight: 12,
//     overflow: "hidden",
//     elevation: 3,
//   },
//   cityImage: { width: "100%", height: "100%", borderRadius: 12 },
//   cityTextOverlay: {
//     position: "absolute",
//     bottom: 0,
//     width: "100%",
//     paddingVertical: 4,
//     backgroundColor: "rgba(0,0,0,0.35)",
//     alignItems: "center",
//   },
//   cityOverlayName: { color: "#fff", fontWeight: "600" },

//   filterScrollView: { marginBottom: 10 },
//   chip: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderRadius: 20,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     marginRight: 8,
//   },
//   chipText: { marginLeft: 6, fontWeight: "500" },

//   dropdownRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 15,
//   },
//   dropdownContainer: { flex: 1, marginRight: 8 },
//   dropdownLabel: { marginBottom: 5, fontWeight: "600" },
//   dropdownButton: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     borderWidth: 1,
//     borderRadius: 12,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//   },
//   dropdownButtonText: { fontWeight: "500" },
//   dropdownOptionsContainer: {
//     borderWidth: 1,
//     borderRadius: 12,
//     marginTop: 4,
//     maxHeight: 160,
//     zIndex: 999,
//   },
//   dropdownScrollView: { paddingVertical: 5 },
//   dropdownOption: { paddingVertical: 8, paddingHorizontal: 12 },

//   propertyCard: {
//     marginHorizontal: 16,
//     marginBottom: 16,
//     borderRadius: 12,
//     overflow: "hidden",
//     elevation: 3,
//   },
//   cardImage: { width: "100%", height: 200 },
//   favButton: {
//     position: "absolute",
//     top: 10,
//     right: 10,
//     padding: 6,
//     borderRadius: 20,
//     backgroundColor: "rgba(0,0,0,0.3)",
//   },
//   cardContent: { padding: 12 },
//   cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
//   locationText: { fontSize: 12, marginBottom: 6 },
//   capacityRowCard: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 6,
//   },
//   capacityText: { fontSize: 12 },
//   priceContainerCard: { flexDirection: "row", alignItems: "center" },
//   priceText: { fontWeight: "700", fontSize: 16 },
//   priceDurationText: { marginLeft: 4, fontSize: 12 },

//   paginationRow: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     marginVertical: 15,
//   },
//   paginationButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 25,
//     marginHorizontal: 10,
//   },
//   paginationButtonText: { color: "#fff", fontWeight: "600" },
//   pageIndicator: { fontSize: 16, fontWeight: "600" },
// });
