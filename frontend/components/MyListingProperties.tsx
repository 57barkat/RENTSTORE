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
} from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../constants/Colors";
import { router } from "expo-router";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useContext, useState, useCallback } from "react";
import { FormContext, FormData } from "@/contextStore/FormContext";
import {
  useFindMyPropertiesQuery,
  useFindPropertyByIdAndDeleteMutation,
} from "@/services/api";
import Toast from "react-native-toast-message";

const MyListingProperties = () => {
  const {
    data: myProperties,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useFindMyPropertiesQuery(undefined);
  console.log("Fetched my properties:", myProperties);
  const formContext = useContext(FormContext);

  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const { width } = useWindowDimensions();

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null,
  );

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
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
        text2: "Property has been successfully removed.",
      });
      refetch();
    } catch (err) {
      console.error("Delete failed:", err);
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

  if (isLoading && !refreshing) {
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
          Failed to load properties. Please check your connection. 😔
        </Text>
      </View>
    );
  }

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

  return (
    <>
      <FlatList
        style={{ flex: 1, backgroundColor: currentTheme.background }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[currentTheme.primary]}
            tintColor={currentTheme.primary}
          />
        }
        data={myProperties ?? []}
        keyExtractor={(item, index) => item._id ?? index.toString()}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={[styles.header, { color: currentTheme.text }]}>
              My Listings
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="home-search-outline"
              size={50}
              color={currentTheme.muted}
              style={{ marginBottom: 10 }}
            />
            <Text style={[styles.emptyText, { color: currentTheme.muted }]}>
              You have no properties listed yet.
            </Text>
            <TouchableOpacity
              style={[
                styles.createButton,
                { backgroundColor: currentTheme.primary, marginTop: 20 },
              ]}
              onPress={() => router.push("/upload")}
            >
              <Text style={styles.createButtonText}>List a New Property</Text>
            </TouchableOpacity>
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
            <View style={styles.infoSection}>
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
                {renderCapacity(
                  "bed-outline",
                  item.capacityState?.beds,
                  "Beds",
                )}
                {renderCapacity(
                  "bathtub-outline",
                  item.capacityState?.bathrooms,
                  "Baths",
                )}
              </View>

              <View style={styles.priceContainer}>
                <Text style={[styles.price, { color: currentTheme.primary }]}>
                  Rs. {item.monthlyRent?.toLocaleString() || "N/A"}
                </Text>
                <Text
                  style={[styles.priceDuration, { color: currentTheme.muted }]}
                >
                  / month
                </Text>
              </View>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: currentTheme.success },
                ]}
                onPress={() => handleOpenDetails(item._id)}
              >
                <MaterialCommunityIcons
                  name="eye-outline"
                  size={20}
                  color="#fff"
                />
                <Text style={styles.buttonText}>View</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: currentTheme.info }]}
                onPress={() => handleEdit(item)}
              >
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={20}
                  color="#fff"
                />
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
                <MaterialCommunityIcons
                  name="delete-outline"
                  size={20}
                  color="#fff"
                />
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    width: "80%",
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    marginBottom: 20,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    columnGap: 12,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  cancelText: {
    fontSize: 14,
    color: "#777",
  },
  deleteBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  deleteText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 8, fontWeight: "500" },
  errorText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyText: { fontSize: 16, textAlign: "center", fontWeight: "500" },
  createButton: { paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8 },
  createButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  headerContainer: { paddingTop: 16, paddingBottom: 20, marginBottom: 8 },
  header: { fontSize: 24, fontWeight: "800", textAlign: "left" },
  card: {
    padding: 18,
    marginBottom: 20,
    borderRadius: 15,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  infoSection: { marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 6, gap: 8 },
  location: { fontSize: 14, fontWeight: "500" },
  capacityRow: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 12,
    gap: 20,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  capacityItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  capacityText: { fontSize: 13, fontWeight: "500" },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 10,
  },
  price: { fontSize: 22, fontWeight: "900" },
  priceDuration: { fontSize: 14, fontWeight: "500", marginLeft: 5 },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});

export default MyListingProperties;
