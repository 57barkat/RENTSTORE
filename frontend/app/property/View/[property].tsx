import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Image,
} from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { useLocalSearchParams, router } from "expo-router";
import { formatProperties } from "@/utils/homeTabUtils/formatProperties";
import {
  useGetFilteredPropertiesQuery,
  useGetUserFavoritesQuery,
  useAddToFavMutation,
  useRemoveUserFavoriteMutation,
} from "@/services/api";
import { useDebounce } from "use-debounce";
import { HostPicker } from "@/components/Filters/HostPicker";
import { FilterChips } from "@/components/Filters/FilterChips";
import { FilterModal } from "@/components/Filters/FilterModal";
import { Ionicons } from "@expo/vector-icons";
import { PropertyCardProps } from "@/types/TabTypes/TabTypes";
import { ChipKey, Filters } from "@/utils/homeTabUtils/filterUtils";
import { buildSelectedChips } from "@/utils/homeTabUtils/selectedChips";

const { width: WINDOW_WIDTH } = Dimensions.get("window");
const CARD_MARGIN = 5;
const CARD_HEIGHT = 200;
const CARD_WIDTH = (WINDOW_WIDTH - CARD_MARGIN * 3) / 2;

const PropertiesPage: React.FC = () => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  // Params from navigation / voice redirect
  const { type, city, addressQuery, minRent, maxRent, beds, bathrooms } =
    useLocalSearchParams<{
      type: string;
      city?: string;
      addressQuery?: string;
      minRent?: string;
      maxRent?: string;
      beds?: string;
      bathrooms?: string;
    }>();

  const [hostOption, setHostOption] = useState(type ?? "home");

  const [filters, setFilters] = useState<Filters>({
    city: city || undefined,
    addressQuery: addressQuery || undefined,
    minRent: minRent ? parseInt(minRent) : undefined,
    maxRent: maxRent ? parseInt(maxRent) : undefined,
    beds: beds ? parseInt(beds) : undefined,
    bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
  });

  const [debouncedCity] = useDebounce(filters.city, 500);
  const [debouncedAddress] = useDebounce(filters.addressQuery, 500);

  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allProperties, setAllProperties] = useState<PropertyCardProps[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [addToFav] = useAddToFavMutation();
  const [removeFromFav] = useRemoveUserFavoriteMutation();

  // ✅ API call including addressQuery
  const { data, isLoading, refetch } = useGetFilteredPropertiesQuery({
    hostOption,
    city: debouncedCity,
    addressQuery: debouncedAddress,
    minRent: filters.minRent,
    maxRent: filters.maxRent,
    beds: filters.beds,
    bathrooms: filters.bathrooms,
    page,
    limit: 10,
  });

  const { data: favData, refetch: refetchFavorites } =
    useGetUserFavoritesQuery(null);

  const favoriteIds = useMemo(
    () => favData?.map((f: any) => f.property?._id).filter(Boolean) || [],
    [favData],
  );

  // Sync state if navigation params change
  useEffect(() => {
    if (type) setHostOption(type);
    setFilters({
      city: city || undefined,
      addressQuery: addressQuery || undefined,
      minRent: minRent ? parseInt(minRent) : undefined,
      maxRent: maxRent ? parseInt(maxRent) : undefined,
      beds: beds ? parseInt(beds) : undefined,
      bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
    });
    setPage(1);
  }, [type, city, addressQuery, minRent, maxRent, beds, bathrooms]);

  // Merge new data with existing properties for infinite scroll
  useEffect(() => {
    if (data?.data) {
      const formatted = formatProperties(
        data.data,
        filters.city || "",
        filters.addressQuery || "",
        () => {},
      ).map((p) => ({
        ...p,
        isFav: favoriteIds.includes(p.id),
      }));

      if (page === 1) {
        setAllProperties(formatted);
      } else {
        setAllProperties((prev) => [
          ...prev,
          ...formatted.filter((p) => !prev.some((pp) => pp.id === p.id)),
        ]);
      }
    }
    setLoadingMore(false);
  }, [data, favoriteIds, filters.city, filters.addressQuery, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [
    hostOption,
    debouncedCity,
    debouncedAddress,
    filters.minRent,
    filters.maxRent,
    filters.beds,
    filters.bathrooms,
  ]);

  const removeFilter = (key: ChipKey) => {
    if (key !== "hostOption") {
      setFilters({ ...filters, [key]: undefined });
      refetch();
    }
  };

  const selectedChips = buildSelectedChips(hostOption, filters);

  const handleToggleFav = async (propertyId: string) => {
    const property = allProperties.find((p) => p.id === propertyId);
    if (!property) return;

    setAllProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, isFav: !p.isFav } : p)),
    );

    try {
      property.isFav
        ? await removeFromFav({ propertyId })
        : await addToFav({ propertyId });
      refetchFavorites();
    } catch {
      setAllProperties((prev) =>
        prev.map((p) =>
          p.id === propertyId ? { ...p, isFav: property.isFav } : p,
        ),
      );
    }
  };

  const renderPropertyCard = (item: PropertyCardProps) => (
    <TouchableOpacity
      key={item.id}
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: currentTheme.card,
        borderRadius: 12,
        margin: CARD_MARGIN,
        overflow: "hidden",
      }}
      onPress={() => router.push(`/property/${item.id}`)}
    >
      <Image
        source={{ uri: item.image }}
        style={{ width: "100%", height: CARD_HEIGHT * 0.6 }}
        resizeMode="cover"
      />
      <TouchableOpacity
        style={{ position: "absolute", bottom: 5, right: 8, zIndex: 20 }}
        onPress={() => handleToggleFav(item.id)}
      >
        <Ionicons
          name={item.isFav ? "heart" : "heart-outline"}
          size={24}
          color={currentTheme.danger}
        />
      </TouchableOpacity>
      <View style={{ padding: 8, flex: 1, justifyContent: "space-between" }}>
        <Text
          style={{ fontWeight: "700", color: currentTheme.text }}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text style={{ fontSize: 12, color: currentTheme.muted }}>
          {item.city}
        </Text>
        <Text style={{ fontWeight: "600", color: currentTheme.secondary }}>
          Rs. {item.rent?.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <HostPicker
          value={hostOption}
          onChange={(value) => {
            setHostOption(value);
            setPage(1);
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

      {isLoading && page === 1 ? (
        <ActivityIndicator
          size="large"
          color={currentTheme.secondary}
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={allProperties}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          contentContainerStyle={{ padding: CARD_MARGIN }}
          renderItem={({ item }) => renderPropertyCard(item)}
          onEndReached={() => {
            if (!loadingMore) {
              setLoadingMore(true);
              setPage((prev) => prev + 1);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color={currentTheme.secondary} />
            ) : null
          }
          ListEmptyComponent={
            <View style={{ padding: 20 }}>
              <Text style={{ color: currentTheme.text }}>
                No properties found.
              </Text>
            </View>
          }
        />
      )}

      <FilterModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onApply={() => {
          setModalVisible(false);
          setPage(1);
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
