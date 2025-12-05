import React, { useState, useEffect } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { useLocalSearchParams, router } from "expo-router";
import { PropertySection } from "@/components/Filters/PropertySection";
import { formatProperties } from "@/utils/homeTabUtils/formatProperties";
import { useGetFilteredPropertiesQuery } from "@/services/api";

import { useDebounce } from "use-debounce";
import { buildSelectedChips } from "@/utils/homeTabUtils/selectedChips";
import { HostPicker } from "@/components/Filters/HostPicker";
import { FilterChips } from "@/components/Filters/FilterChips";
import { FilterModal } from "@/components/Filters/FilterModal";
type ChipKey = "city" | "minRent" | "maxRent" | "beds" | "hostOption";
const PropertiesPage: React.FC = () => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const { type } = useLocalSearchParams<{ type: string }>();

  const [hostOption, setHostOption] = useState(type ?? "home");
  const [filters, setFilters] = useState<{
    city?: string;
    minRent?: number;
    maxRent?: number;
    beds?: number;
  }>({});
  const [debouncedCity] = useDebounce(filters.city, 500);

  const { data, isLoading, refetch } = useGetFilteredPropertiesQuery({
    hostOption,
    ...filters,
    city: debouncedCity,
  });

  const [properties, setProperties] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (data?.data) {
      setProperties(
        formatProperties(data.data, filters.city || "", "", () => {})
      );
    } else {
      setProperties([]);
    }
  }, [data]);

  const removeFilter = (key: ChipKey) => {
    if (key !== "hostOption") {
      setFilters({ ...filters, [key]: undefined });
      refetch();
    }
  };

  const selectedChips = buildSelectedChips(hostOption, filters);

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <HostPicker
          value={hostOption}
          onChange={(value) => {
            setHostOption(value);
            refetch();
          }}
          theme={currentTheme}
        />
      </View>

      <FilterChips
        chips={selectedChips}
        onRemove={removeFilter}
        onOpenModal={() => setModalVisible(true)}
        theme={currentTheme}
      />

      {isLoading ? (
        <ActivityIndicator size="large" color={currentTheme.secondary} />
      ) : properties.length === 0 ? (
        <View style={{ padding: 20 }}>
          <Text style={{ color: currentTheme.text }}>No properties found.</Text>
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <PropertySection
              sectionTitle=""
              properties={[item]}
              loading={false}
              onCardPress={(id) => router.push(`/property/${id}`)}
            />
          )}
        />
      )}

      <FilterModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onApply={() => {
          setModalVisible(false);
          refetch();
        }}
        hostOption={hostOption}
        onHostChange={(v) => setHostOption(v)}
        filters={filters}
        setFilters={setFilters}
        theme={currentTheme}
      />
    </View>
  );
};

export default PropertiesPage;
