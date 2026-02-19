import { useState, useEffect, useMemo } from "react";
import { useDebounce } from "use-debounce";
import {
  useFilteredProperties,
  useFavorites,
} from "@/services/propertiesService";
import { formatProperties } from "@/utils/properties/formatProperties";

export const usePropertiesPage = (
  initialFilters: any,
  hostOption: string,
  sortBy: string,
) => {
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [debouncedCity] = useDebounce(filters.city, 500);
  const [debouncedAddress] = useDebounce(filters.addressQuery, 500);

  const { data, isLoading, refetch } = useFilteredProperties(
    {
      ...filters,
      city: debouncedCity,
      addressQuery: debouncedAddress,
      sortBy,
    },
    page,
    hostOption,
  );

  const {
    data: favData,
    refetch: refetchFavorites,
    addToFav,
    removeFromFav,
  } = useFavorites();

  const favoriteIds = useMemo(
    () => favData?.map((f: any) => f.property?._id).filter(Boolean) || [],
    [favData],
  );

  useEffect(() => {
    setPage(1);
    setAllProperties([]);
  }, [sortBy, hostOption]);

  useEffect(() => {
    if (!data?.data) return;

    const formatted = formatProperties(
      data.data,
      filters.city || "",
      filters.addressQuery || "",
      () => {},
    ).map((p) => ({ ...p, isFav: favoriteIds.includes(p.id) }));

    if (page === 1) {
      setAllProperties(formatted);
    } else {
      setAllProperties((prev) => [
        ...prev,
        ...formatted.filter((p: any) => !prev.some((pp) => pp.id === p.id)),
      ]);
    }

    setLoadingMore(false);
  }, [data, favoriteIds, filters, page]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await Promise.all([refetch(), refetchFavorites()]);
    setRefreshing(false);
  };

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

  return {
    allProperties,
    filters,
    setFilters,
    page,
    setPage,
    loadingMore,
    setLoadingMore,
    refreshing,
    onRefresh,
    isLoading,
    handleToggleFav,
  };
};
