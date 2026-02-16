import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Modal,
  RefreshControl,
  TextInput,
} from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../constants/Colors";
import { router } from "expo-router";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useContext, useState, useCallback, useEffect } from "react";
import { FormContext, FormData } from "@/contextStore/FormContext";
import {
  useFindMyPropertiesQuery,
  useFindPropertyByIdAndDeleteMutation,
} from "@/services/api";
import Toast from "react-native-toast-message";
import { FontSize } from "@/constants/Typography";

const MyListingProperties = () => {
  const formContext = useContext(FormContext);
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const { width } = useWindowDimensions();

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
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
      limit,
      sort,
      search: debouncedSearch,
    });

  const myProperties = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null,
  );
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleOpenDetails = (id: string) => {
    router.push(`/property/${id}`);
  };

  const handleEdit = (item: FormData) => {
    formContext?.setFullFormData(item);
    router.push("/upload/CreateStep");
  };

  const [deleteProperty] = useFindPropertyByIdAndDeleteMutation();

  const handleDelete = async () => {
    if (!selectedPropertyId) return;
    try {
      await deleteProperty(selectedPropertyId).unwrap();
      Toast.show({
        type: "success",
        text1: "Deleted!",
        text2: "Property removed successfully.",
      });
      refetch();
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to delete property.",
      });
    } finally {
      setDeleteModalVisible(false);
      setSelectedPropertyId(null);
    }
  };

  const loadMore = () => {
    if (page < totalPages && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  const renderCapacity = (iconName: string, value: any, unit: string) => (
    <View style={styles.capacityItem}>
      <MaterialCommunityIcons
        name={iconName as any}
        size={16}
        color={currentTheme.muted}
      />
      <Text style={[styles.capacityText, { color: currentTheme.muted }]}>
        {value || "N/A"} {unit}
      </Text>
    </View>
  );

  if (isLoading && page === 1) {
    return (
      <View
        style={[styles.center, { backgroundColor: currentTheme.background }]}
      >
        <ActivityIndicator size="large" color={currentTheme.primary} />
        <Text style={[styles.loadingText, { color: currentTheme.text }]}>
          Loading your properties...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[styles.center, { backgroundColor: currentTheme.background }]}
      >
        <Text style={[styles.errorText, { color: currentTheme.danger }]}>
          Failed to load properties.
        </Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        style={{ flex: 1, backgroundColor: currentTheme.background }}
        data={myProperties}
        keyExtractor={(item, index) => item._id ?? index.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[currentTheme.primary]}
            tintColor={currentTheme.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={[styles.header, { color: currentTheme.text }]}>
              My Listings
            </Text>

            <View style={styles.searchContainer}>
              <Feather name="search" size={18} color={currentTheme.muted} />
              <TextInput
                placeholder="Search by title..."
                placeholderTextColor={currentTheme.muted}
                value={search}
                onChangeText={setSearch}
                style={[styles.searchInput, { color: currentTheme.text }]}
              />
            </View>

            <View style={styles.sortRow}>
              {["newest", "oldest", "priceLow", "priceHigh"].map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => {
                    setSort(item);
                    setPage(1);
                  }}
                  style={[
                    styles.sortButton,
                    {
                      backgroundColor:
                        sort === item
                          ? currentTheme.primary
                          : currentTheme.card,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: sort === item ? "#fff" : currentTheme.text,
                      fontSize: FontSize.xs,
                      fontWeight: "600",
                    }}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              {
                backgroundColor: currentTheme.card,
                width: width - 40,
                borderColor: currentTheme.border,
              },
            ]}
          >
            <Text
              style={[styles.title, { color: currentTheme.text }]}
              numberOfLines={1}
            >
              {item.title}
            </Text>

            <View style={styles.row}>
              <Feather name="map-pin" size={14} color={currentTheme.muted} />
              <Text
                style={[styles.location, { color: currentTheme.muted }]}
                numberOfLines={1}
              >
                {item.address?.[0]?.city || "City N/A"},{" "}
                {item.address?.[0]?.country || "Country N/A"}
              </Text>
            </View>

            <View style={styles.capacityRow}>
              {renderCapacity(
                "account-group-outline",
                item.capacityState?.Persons,
                "Persons",
              )}
              {renderCapacity("bed-outline", item.capacityState?.beds, "Beds")}
              {renderCapacity(
                "bathtub-outline",
                item.capacityState?.bathrooms,
                "Baths",
              )}
            </View>

            <Text style={[styles.price, { color: currentTheme.primary }]}>
              Rs. {item.monthlyRent?.toLocaleString() || "N/A"} / month
            </Text>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: currentTheme.success },
                ]}
                onPress={() => handleOpenDetails(item._id)}
              >
                <Text style={styles.buttonText}>View</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: currentTheme.info }]}
                onPress={() => handleEdit(item)}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: currentTheme.danger },
                ]}
                onPress={() => {
                  setSelectedPropertyId(item._id);
                  setDeleteModalVisible(true);
                }}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetching && page > 1 ? (
            <ActivityIndicator
              size="small"
              color={currentTheme.primary}
              style={{ marginVertical: 20 }}
            />
          ) : null
        }
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 40,
        }}
      />

      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={modalStyles.overlay}>
          <View
            style={[modalStyles.box, { backgroundColor: currentTheme.card }]}
          >
            <Text style={[modalStyles.title, { color: currentTheme.text }]}>
              Delete Property?
            </Text>
            <Text
              style={[modalStyles.message, { color: currentTheme.secondary }]}
            >
              Are you sure you want to delete this property?
            </Text>

            <View style={modalStyles.buttons}>
              <TouchableOpacity
                onPress={() => setDeleteModalVisible(false)}
                style={modalStyles.cancelBtn}
              >
                <Text style={modalStyles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDelete}
                style={[
                  modalStyles.deleteBtn,
                  { backgroundColor: currentTheme.danger },
                ]}
              >
                <Text style={modalStyles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Toast />
    </>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: "85%",
    borderRadius: 20,
    padding: 22,
  },
  title: {
    fontSize: FontSize.base,
    fontWeight: "800",
    marginBottom: 10,
  },
  message: {
    fontSize: FontSize.sm,
    marginBottom: 20,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  cancelText: {
    fontSize: FontSize.sm,
    color: "#777",
  },
  deleteBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  deleteText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: FontSize.sm,
  },
});

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontWeight: "600" },
  errorText: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    textAlign: "center",
  },
  headerContainer: {
    paddingTop: 20,
    paddingBottom: 15,
  },
  header: {
    fontSize: FontSize.xl,
    fontWeight: "900",
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    marginLeft: 8,
    fontSize: FontSize.sm,
  },
  sortRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  sortButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  card: {
    padding: 20,
    marginBottom: 22,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 6,
  },
  title: { fontSize: FontSize.base, fontWeight: "800", marginBottom: 6 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 6, gap: 6 },
  location: { fontSize: FontSize.sm },
  capacityRow: {
    flexDirection: "row",
    marginVertical: 10,
    gap: 18,
  },
  capacityItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  capacityText: { fontSize: FontSize.xs },
  price: { fontSize: FontSize.lg, fontWeight: "900", marginBottom: 12 },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  button: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: FontSize.sm },
});

export default MyListingProperties;
