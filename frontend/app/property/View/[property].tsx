import React, { useState } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
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

  const selectedChips = buildSelectedChips(hostOption, filters);

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
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

      <FilterChips
        chips={selectedChips}
        onRemove={(key) => setFilters({ ...filters, [key]: undefined })}
        onOpenModal={() => setModalVisible(true)}
        theme={currentTheme}
      />

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
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <PropertyCard
              item={item}
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
            if (!loadingMore && allProperties.length >= 10) setPage(page + 1);
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
