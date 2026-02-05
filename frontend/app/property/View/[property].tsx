import React, { useState, useEffect, useMemo } from "react";
import { RefreshControl, StyleSheet } from "react-native";
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
const GUTTER = 16;
const CARD_WIDTH = (WINDOW_WIDTH - GUTTER * 3) / 2;
const IMAGE_HEIGHT = CARD_WIDTH * 1.1;

const PropertiesPage: React.FC = () => {
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
  } = useLocalSearchParams<{
    type: string;
    city?: string;
    addressQuery?: string;
    minRent?: string;
    maxRent?: string;
    beds?: string;
    bathrooms?: string;
    openFilters?: string;
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
  const [refreshing, setRefreshing] = useState(false);

  const [addToFav] = useAddToFavMutation();
  const [removeFromFav] = useRemoveUserFavoriteMutation();

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
  console.log("Filtered Properties Data:", data);
  const { data: favData, refetch: refetchFavorites } =
    useGetUserFavoritesQuery(null);

  const favoriteIds = useMemo(
    () => favData?.map((f: any) => f.property?._id).filter(Boolean) || [],
    [favData],
  );

  // Pull to Refresh Handler
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    setPage(1); // Reset page to 1 for fresh data
    await Promise.all([refetch(), refetchFavorites()]);
    setRefreshing(false);
  }, [refetch, refetchFavorites]);

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
  useEffect(() => {
    if (openFilters === "true") {
      setModalVisible(true);
    }
  }, [openFilters]);
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

    const wasFav = property.isFav;
    setAllProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, isFav: !wasFav } : p)),
    );

    try {
      wasFav
        ? await removeFromFav({ propertyId }).unwrap()
        : await addToFav({ propertyId }).unwrap();
      refetchFavorites();
    } catch {
      setAllProperties((prev) =>
        prev.map((p) => (p.id === propertyId ? { ...p, isFav: wasFav } : p)),
      );
    }
  };

  const renderPropertyCard = (item: PropertyCardProps) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={{
        width: CARD_WIDTH,
        backgroundColor: currentTheme.card,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: currentTheme.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 4,
        overflow: "hidden",
      }}
      onPress={() => router.push(`/property/${item.id}`)}
    >
      <View>
        <Image
          source={{ uri: item.image }}
          style={{ width: "100%", height: IMAGE_HEIGHT }}
          resizeMode="cover"
        />

        {item.featured && (
          <View
            style={[
              styles.featuredTag,
              { backgroundColor: currentTheme.secondary },
            ]}
          >
            <Text style={styles.featuredText}>FEATURED</Text>
          </View>
        )}

        <TouchableOpacity
          activeOpacity={0.7}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: 20,
            padding: 6,
            zIndex: 20,
          }}
          onPress={() => handleToggleFav(item.id)}
        >
          <Ionicons
            name={item.isFav ? "heart" : "heart-outline"}
            size={20}
            color={item.isFav ? currentTheme.danger : "#11181C"}
          />
        </TouchableOpacity>
      </View>

      <View style={{ padding: 12 }}>
        <Text
          style={{
            fontSize: 11,
            fontWeight: "700",
            color: currentTheme.primary,
            textTransform: "uppercase",
            marginBottom: 2,
          }}
        >
          {item.city}
        </Text>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "600",
            color: currentTheme.text,
            marginBottom: 8,
          }}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "800",
              color: currentTheme.text,
            }}
          >
            Rs. {item.rent?.toLocaleString()}
          </Text>
          <Text style={{ fontSize: 12, color: currentTheme.muted }}> /mo</Text>
        </View>
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
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
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
          renderItem={({ item }) => renderPropertyCard(item)}
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
              setLoadingMore(true);
              setPage((prev) => prev + 1);
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
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                alignItems: "center",
                marginTop: 80,
                paddingHorizontal: 40,
              }}
            >
              <Ionicons
                name="search-outline"
                size={60}
                color={currentTheme.muted}
              />
              <Text
                style={{
                  color: currentTheme.text,
                  fontSize: 18,
                  fontWeight: "600",
                  marginTop: 16,
                  textAlign: "center",
                }}
              >
                No properties found.
              </Text>
              <Text
                style={{
                  color: currentTheme.muted,
                  textAlign: "center",
                  marginTop: 8,
                }}
              >
                Try adjusting your filters or search area to find more results.
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
const styles = StyleSheet.create({
  featuredTag: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 10,
  },
  featuredText: { color: "#ffffff", fontSize: 9, fontWeight: "500" },
});
