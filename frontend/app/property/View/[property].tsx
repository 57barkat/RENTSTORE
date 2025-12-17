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
import { buildSelectedChips } from "@/utils/homeTabUtils/selectedChips";
import { HostPicker } from "@/components/Filters/HostPicker";
import { FilterChips } from "@/components/Filters/FilterChips";
import { FilterModal } from "@/components/Filters/FilterModal";
import { Ionicons } from "@expo/vector-icons";
import { PropertyCardProps } from "@/types/TabTypes/TabTypes";

type ChipKey = "city" | "minRent" | "maxRent" | "beds" | "hostOption";

const { width: WINDOW_WIDTH } = Dimensions.get("window");
const CARD_MARGIN = 5;
const CARD_HEIGHT = 200;
const CARD_WIDTH = (WINDOW_WIDTH - CARD_MARGIN * 3) / 2;

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

  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allProperties, setAllProperties] = useState<PropertyCardProps[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [addToFav] = useAddToFavMutation();
  const [removeFromFav] = useRemoveUserFavoriteMutation();

  // Fetch filtered properties
  const { data, isLoading, refetch } = useGetFilteredPropertiesQuery({
    hostOption,
    ...filters,
    city: debouncedCity,
    page,
    limit: 10,
  });

  // Fetch user's favorites
  const { data: favData, refetch: refetchFavorites } =
    useGetUserFavoritesQuery(null);
  const favoriteIds = useMemo(
    () => favData?.map((f: any) => f.property?._id).filter(Boolean) || [],
    [favData]
  );

  // Merge favorites with properties whenever data or favorites change
  useEffect(() => {
    if (data?.data) {
      const formatted = formatProperties(
        data.data,
        filters.city || "",
        "",
        () => {}
      ).map((p) => ({
        ...p,
        isFav: favoriteIds.includes(p.id),
      }));

      if (page === 1) {
        setAllProperties(formatted);
      } else {
        // Deduplicate newly fetched properties
        setAllProperties((prev) => [
          ...prev,
          ...formatted.filter((p) => !prev.some((pp) => pp.id === p.id)),
        ]);
      }
    }
    setLoadingMore(false);
  }, [data, favoriteIds, filters.city, page]);

  // Reset page when filters or hostOption change
  useEffect(() => {
    setPage(1);
  }, [
    hostOption,
    debouncedCity,
    filters.minRent,
    filters.maxRent,
    filters.beds,
  ]);

  // Refetch favorites on mount to ensure correct state
  useEffect(() => {
    refetchFavorites();
  }, []);

  const removeFilter = (key: ChipKey) => {
    if (key !== "hostOption") {
      setFilters({ ...filters, [key]: undefined });
      refetch();
    }
  };

  const selectedChips = buildSelectedChips(hostOption, filters);

  // Toggle Favorite
  const handleToggleFav = async (propertyId: string) => {
    const property = allProperties.find((p) => p.id === propertyId);
    if (!property) return;

    // Optimistic update
    setAllProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, isFav: !p.isFav } : p))
    );

    try {
      if (property.isFav) {
        await removeFromFav({ propertyId });
      } else {
        await addToFav({ propertyId });
      }
      // Refetch favorites to sync backend state
      refetchFavorites();
    } catch (err) {
      console.log("Fav error:", err);
      // Rollback on error
      setAllProperties((prev) =>
        prev.map((p) =>
          p.id === propertyId ? { ...p, isFav: property.isFav } : p
        )
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

      {/* Favorite heart */}
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

      {/* Featured tag */}
      {item.featured && (
        <View
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 6,
            backgroundColor: currentTheme.secondary,
            zIndex: 10,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 9, fontWeight: "500" }}>
            FEATURED
          </Text>
        </View>
      )}

      <View style={{ padding: 8, flex: 1, justifyContent: "space-between" }}>
        <Text
          style={{ fontWeight: "700", color: currentTheme.text }}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text style={{ fontSize: 12, color: currentTheme.muted }}>
          {item.city}, {item.country}
        </Text>
        <Text style={{ fontWeight: "600", color: currentTheme.secondary }}>
          Rs. {item.rent?.toLocaleString()} / month
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
        <ActivityIndicator size="large" color={currentTheme.secondary} />
      ) : allProperties.length === 0 ? (
        <View style={{ padding: 20 }}>
          <Text style={{ color: currentTheme.text }}>No properties found.</Text>
        </View>
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
