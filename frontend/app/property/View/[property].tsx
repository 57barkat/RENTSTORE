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
import LoadingScreen from "@/components/Common/LoadingScreen";
import { useAuth } from "@/contextStore/AuthContext";
import AuthModal from "@/components/AuthModal";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
  const { isGuest } = useAuth();

  const {
    property,
    type,
    title,
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
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [isSwitching, setIsSwitching] = useState(false);
  const initialFilters = {
    title: title || undefined,
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
      shop: type === "shop" ? { ...initialFilters } : {},
      office: type === "office" ? { ...initialFilters } : {},
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

  const onPressFav = (id: string) => {
    if (isGuest) {
      setAuthModalVisible(true);
    } else {
      handleToggleFav(id);
    }
  };

  useEffect(() => {
    setHostFiltersStore((prev) => ({
      ...prev,
      [hostOption]: filters,
    }));
  }, [filters, hostOption]);
  const handleHostChange = (newHost: string) => {
    setIsSwitching(true);
    setHostOption(newHost);
    setPage(1);
    const savedFilters = hostFiltersStore[newHost] || {};
    setFilters(savedFilters);
    setTimeout(() => setIsSwitching(false), 300);
  };
  const selectedChips = buildSelectedChips(hostOption, filters).filter(
    (chip) =>
      (chip.key as string) !== "type" && (chip.key as string) !== "hostOption",
  );
  const toggleFilterVisibility = () => setShowFilters(!showFilters);
  const handleSortSelect = (value: string) => {
    setIsSwitching(true);
    setSortBy(value);
    setSortModalVisible(false);
    setPage(1);
    setTimeout(() => setIsSwitching(false), 1300);
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
      {(isLoading || isSwitching) && page === 1 ? (
        <LoadingScreen currentTheme={currentTheme} />
      ) : (
        <FlatList
          data={allProperties}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PropertyCard
              item={item}
              theme={currentTheme}
              onPress={() => router.push(`/property/${item.id}`)}
              onToggleFav={onPressFav}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 20,
            flexGrow: 1,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[currentTheme.secondary]}
              tintColor={currentTheme.secondary}
            />
          }
          onScroll={({ nativeEvent }) => {
            const offsetY = nativeEvent.contentOffset.y;
            const contentHeight = nativeEvent.contentSize.height;
            const layoutHeight = nativeEvent.layoutMeasurement.height;
            if (
              !loadingMore &&
              allProperties.length >= page * 30 &&
              offsetY + layoutHeight >= contentHeight * 0.25
            ) {
              setPage((prev) => prev + 1);
            }
          }}
          scrollEventThrottle={16}
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
          ListEmptyComponent={
            !isLoading && !isSwitching ? (
              <EmptyState theme={currentTheme} />
            ) : null
          }
        />
      )}

      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
        featureName="Favorites"
      />

      <FilterModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onApply={() => {
          setIsSwitching(true);
          setModalVisible(false);
          setPage(1);
          setTimeout(() => setIsSwitching(false), 300);
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    elevation: 10,
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
