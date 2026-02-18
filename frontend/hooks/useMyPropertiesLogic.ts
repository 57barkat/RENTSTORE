import { useState, useEffect, useCallback, useContext } from "react";
import { FormContext } from "@/contextStore/FormContext";
import {
  useFindMyPropertiesQuery,
  useFindPropertyByIdAndDeleteMutation,
} from "@/services/api";
import Toast from "react-native-toast-message";

export const useMyPropertiesLogic = () => {
  const formContext = useContext(FormContext);

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null,
  );

  const [accumulatedProperties, setAccumulatedProperties] = useState<any[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isFetching, error, refetch } =
    useFindMyPropertiesQuery({
      page,
      limit: 10,
      sort,
      search: debouncedSearch,
    });

  useEffect(() => {
    if (data?.data) {
      if (page === 1) {
        setAccumulatedProperties(data.data);
      } else {
        setAccumulatedProperties((prev) => {
          const combined = [...prev, ...data.data];
          const unique = combined.filter(
            (item, index, self) =>
              index === self.findIndex((t) => t._id === item._id),
          );
          return unique;
        });
      }
    }
  }, [data, page]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const [deleteProperty] = useFindPropertyByIdAndDeleteMutation();

  const handleDelete = async () => {
    if (!selectedPropertyId) return;
    try {
      await deleteProperty(selectedPropertyId).unwrap();
      Toast.show({ type: "success", text1: "Deleted successfully" });
      onRefresh();
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to delete" });
    } finally {
      setDeleteModalVisible(false);
      setSelectedPropertyId(null);
    }
  };

  const loadMore = () => {
    if (data && page < data.totalPages && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  return {
    properties: accumulatedProperties,
    isLoading,
    isFetching,
    error,
    page,
    sort,
    setSort: (val: string) => {
      setSort(val);
      setPage(1);
    },
    search,
    setSearch,
    deleteModalVisible,
    setDeleteModalVisible,
    setSelectedPropertyId,
    onRefresh,
    refreshing,
    loadMore,
    handleDelete,
    formContext,
    totalPages: data?.totalPages ?? 1,
  };
};
