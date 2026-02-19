import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Platform,
  UIManager,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { useLocalSearchParams, router } from "expo-router";
import { HostPicker } from "@/components/Filters/HostPicker";
import { FilterModal } from "@/components/Filters/FilterModal";
import { FilterHeader } from "@/components/Filters/FilterHeader";
import { SortModal } from "@/components/Filters/SortModal";
import { PropertyCard } from "@/components/Properties/PropertyCard";
import { EmptyState } from "@/components/Properties/EmptyState";
import { usePropertiesPage } from "@/hooks/useFilteredProperties";
import { buildSelectedChips } from "@/utils/homeTabUtils/selectedChips";
import { MaterialIcons } from "@expo/vector-icons";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const GUTTER = 4;

const SORT_OPTIONS = [
  {
    label: "Price: Low to High",
    value: "price_asc",
    icon: "sort-amount-down-alt",
  },
  { label: "Price: High to Low", value: "price_desc", icon: "sort-amount-up" },
  { label: "Newest First", value: "newest", icon: "clock" },
];

export default function PropertiesPage() {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const {
    property,
    type,
    city,
    addressQuery,
    minRent,
    maxRent,
    bathrooms,
    openFilters,
    bedrooms,
    floorLevel,
    amenities,
    bills,
    meal,
    rules,
    hostelType,
  } = useLocalSearchParams<any>();

  const [hostOption, setHostOption] = useState(property ?? type ?? "home");
  const [modalVisible, setModalVisible] = useState(openFilters === "true");
  const [showFilters, setShowFilters] = useState(true);

  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  const initialFilters = {
    city: city || undefined,
    addressQuery: addressQuery || undefined,
    minRent: minRent ? parseInt(minRent) : undefined,
    maxRent: maxRent ? parseInt(maxRent) : undefined,
    bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
    floorLevel: floorLevel ? parseInt(floorLevel) : undefined,
    bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
    amenities: Array.isArray(amenities) ? amenities : undefined,
    bills: Array.isArray(bills) ? bills : undefined,
    meal: meal || undefined,
    rules: Array.isArray(rules) ? rules : undefined,
    hostelType: hostelType || undefined,
  };

  const [hostFiltersStore, setHostFiltersStore] = useState<Record<string, any>>(
    {
      home: type === "home" || !type ? { ...initialFilters } : {},
      hostel: type === "hostel" ? { ...initialFilters } : {},
      apartment: type === "apartment" ? { ...initialFilters } : {},
    },
  );

  const {
    allProperties,
    filters,
    setFilters,
    page,
    setPage,
    loadingMore,
    refreshing,
    onRefresh,
    isLoading,
    handleToggleFav,
  } = usePropertiesPage(hostFiltersStore[hostOption], hostOption, sortBy);
  console.log("Current filters:", filters);

  useEffect(() => {
    setHostFiltersStore((prev) => ({
      ...prev,
      [hostOption]: filters,
    }));
  }, [filters, hostOption]);

  const handleHostChange = (newHost: string) => {
    setHostOption(newHost);
    setPage(1);
    const savedFilters = hostFiltersStore[newHost] || {};
    setFilters(savedFilters);
  };

  const selectedChips = buildSelectedChips(hostOption, filters).filter(
    (chip) =>
      (chip.key as string) !== "type" && (chip.key as string) !== "hostOption",
  );

  const toggleFilterVisibility = () => setShowFilters(!showFilters);

  const handleSortSelect = (value: string) => {
    setSortBy(value);
    setSortModalVisible(false);
    setPage(1);
  };

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <View style={styles.topHeader}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: currentTheme.card }]}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="arrow-back-ios"
            size={16}
            color={currentTheme.text}
            style={{ marginLeft: 5 }}
          />
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <HostPicker
          value={hostOption}
          onChange={handleHostChange}
          theme={currentTheme}
        />
      </View>

      <FilterHeader
        selectedChips={selectedChips}
        filters={filters}
        setFilters={setFilters}
        showFilters={showFilters}
        toggleFilterVisibility={toggleFilterVisibility}
        openModal={() => setModalVisible(true)}
        openSort={() => setSortModalVisible(true)}
        sortBy={sortBy}
        sortOptions={SORT_OPTIONS}
        theme={currentTheme}
      />

      {isLoading && page === 1 ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color={currentTheme.secondary} />
        </View>
      ) : (
        <FlatList
          data={allProperties}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: "space-between",
            paddingHorizontal: GUTTER,
          }}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <PropertyCard
              item={item}
              color={currentTheme.danger}
              theme={currentTheme}
              onPress={() => router.push(`/property/${item.id}`)}
              onToggleFav={handleToggleFav}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[currentTheme.secondary]}
              tintColor={currentTheme.secondary}
            />
          }
          onEndReached={() => {
            if (!loadingMore && allProperties.length >= 10) {
              setPage(page + 1);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                size="small"
                color={currentTheme.secondary}
                style={{ marginVertical: 20 }}
              />
            ) : (
              <View style={{ height: 20 }} />
            )
          }
          ListEmptyComponent={<EmptyState theme={currentTheme} />}
        />
      )}

      <FilterModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onApply={() => {
          setModalVisible(false);
          setPage(1);
        }}
        hostOption={hostOption}
        onHostChange={handleHostChange}
        filters={filters}
        setFilters={setFilters}
        theme={currentTheme}
      />

      <SortModal
        visible={sortModalVisible}
        onClose={() => setSortModalVisible(false)}
        options={SORT_OPTIONS}
        selectedValue={sortBy}
        onSelect={handleSortSelect}
        theme={currentTheme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
});
