import React, { useState } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { useLocalSearchParams, router } from "expo-router";
import { HostPicker } from "@/components/Filters/HostPicker";
import { FilterChips } from "@/components/Filters/FilterChips";
import { FilterModal } from "@/components/Filters/FilterModal";
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

export default function PropertiesPage() {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const {
    type,
    city,
    addressQuery,
    minRent,
    maxRent,
    beds,
    bathrooms,
    openFilters,
  } = useLocalSearchParams<any>();

  const [hostOption, setHostOption] = useState(type ?? "home");
  const [modalVisible, setModalVisible] = useState(openFilters === "true");
  const [showFilters, setShowFilters] = useState(true);

  const initialFilters = {
    city: city || undefined,
    addressQuery: addressQuery || undefined,
    minRent: minRent ? parseInt(minRent) : undefined,
    maxRent: maxRent ? parseInt(maxRent) : undefined,
    beds: beds ? parseInt(beds) : undefined,
    bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
  };

  const [hostFilters, setHostFilters] = useState<
    Record<string, typeof initialFilters>
  >({
    [hostOption]: initialFilters,
  });

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
  } = usePropertiesPage(initialFilters, hostOption);

  const selectedChips = buildSelectedChips(hostOption, filters).filter(
    (chip) =>
      (chip.key as string) !== "type" && (chip.key as string) !== "hostOption",
  );

  const toggleFilterVisibility = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilters(!showFilters);
  };

  const handleClearAll = () => {
    const cleared = {};
    setFilters(cleared);
    setHostFilters((prev) => ({ ...prev, [hostOption]: cleared }));
    setPage(1);
  };

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
      {/* ===== Top Header ===== */}
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
          />
        </TouchableOpacity>
      </View>

      {/* ===== Host Picker ===== */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <HostPicker
          value={hostOption}
          onChange={(newHost) => {
            setHostFilters((prev) => ({ ...prev, [hostOption]: filters }));
            setHostOption(newHost);
            setFilters(hostFilters[newHost] || initialFilters);
            setPage(1);
          }}
          theme={currentTheme}
        />
      </View>

      {/* ===== Filters Header (Collapsible Section) ===== */}
      <View style={styles.filterSectionContainer}>
        <View style={styles.filterControls}>
          <Text
            style={[
              styles.activeFilterCount,
              { color: currentTheme.text + "80" },
            ]}
          >
            {selectedChips.length} active filters
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {selectedChips.length > 0 && (
              <>
                <TouchableOpacity
                  onPress={handleClearAll}
                  style={styles.controlButton}
                >
                  <Text
                    style={{ color: currentTheme.primary, fontWeight: "700" }}
                  >
                    Clear All
                  </Text>
                </TouchableOpacity>
                <View
                  style={[
                    styles.divider,
                    { backgroundColor: currentTheme.border },
                  ]}
                />
              </>
            )}
            <TouchableOpacity
              onPress={toggleFilterVisibility}
              style={styles.controlButton}
            >
              <MaterialIcons
                name={showFilters ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                size={24}
                color={currentTheme.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {showFilters && (
          <View style={styles.filterHeader}>
            <View style={{ flex: 1 }}>
              <FilterChips
                chips={selectedChips}
                onRemove={(key) => setFilters({ ...filters, [key]: undefined })}
                onOpenModal={() => setModalVisible(true)}
                theme={currentTheme}
              />
            </View>
          </View>
        )}
      </View>

      {/* ===== Content ===== */}
      {isLoading && page === 1 ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color={currentTheme.primary} />
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
          contentContainerStyle={{
            paddingTop: 8,
            paddingBottom: 20,
          }}
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
              colors={[currentTheme.primary]}
              tintColor={currentTheme.primary}
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
                color={currentTheme.primary}
                style={{ marginVertical: 20 }}
              />
            ) : (
              <View style={{ height: 20 }} />
            )
          }
          ListEmptyComponent={<EmptyState theme={currentTheme} />}
        />
      )}

      {/* ===== Filter Modal ===== */}
      <FilterModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onApply={() => {
          setHostFilters((prev) => ({ ...prev, [hostOption]: filters }));
          setModalVisible(false);
          setPage(1);
        }}
        hostOption={hostOption}
        onHostChange={setHostOption}
        filters={filters}
        setFilters={setFilters}
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
  filterSectionContainer: {
    marginTop: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  filterControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  activeFilterCount: {
    fontSize: 12,
    fontWeight: "500",
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 16,
    paddingBottom: 8,
  },
  controlButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: 16,
    marginHorizontal: 4,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
