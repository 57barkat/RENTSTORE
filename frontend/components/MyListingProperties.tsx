import {
  useFindMyPropertiesQuery,
  useFindPropertyByIdAndDeleteMutation,
} from "@/services/api";
import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  // Image, // Removed as it's not used in renderItem
} from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../constants/Colors";
import { router } from "expo-router";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useContext, useEffect, useState } from "react";
// Assuming FormData now correctly maps to the new property structure
import { FormContext, FormData } from "@/contextStore/FormContext";
import {
  FormContext as HostelFormContext,
  HostelFormData,
} from "@/contextStore/HostelFormContext";
import ConfirmationModal from "./ConfirmDialog";

const MyListingProperties = () => {
  const {
    data: myProperties,
    isLoading,
    error,
    refetch,
  } = useFindMyPropertiesQuery(undefined, { refetchOnMountOrArgChange: true });
  const formContext = useContext(FormContext);
  const hostelFormContext = useContext(HostelFormContext);

  useEffect(() => {
    // Note: refetchOnMountOrArgChange: true handles the refetch on mount.
    // Explicitly calling refetch here is often redundant but kept if it addresses a specific external trigger.
    // I'll keep it as it was in the original code.
    refetch();
  }, []);

  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const { width } = useWindowDimensions();

  // Function to safely extract rent amount and type
  const getRentInfo = (rentRates: any) => {
    const rate = rentRates?.[0];
    if (rate) {
      // The amount is in 'amount' and the type is in 'type' (e.g., 'daily')
      return { amount: rate.amount, type: rate.type };
    }
    return { amount: "N/A", type: "N/A" };
  };

  const handleOpenDetails = (id: string) => router.push(`/property/${id}`);
  const handleEdit = (item: any) => {
    if (item.propertyType === "hostel") {
      hostelFormContext?.setFullFormData(item as HostelFormData);
      router.push("/HostelForms"); // hostel form
    } else {
      formContext?.setFullFormData(item as FormData);
      router.push("/upload/Location"); // home form
    }
  };

  const [deleteProperty] = useFindPropertyByIdAndDeleteMutation();

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null
  );

  const showDeleteConfirm = (id: string) => {
    setSelectedPropertyId(id);
    setConfirmVisible(true);
  };
  const handleDelete = async () => {
    if (!selectedPropertyId) return;
    try {
      // Assuming deleteProperty takes the ID
      await deleteProperty(selectedPropertyId).unwrap();
      setConfirmVisible(false);
      refetch();
    } catch (err) {
      console.error("Delete failed:", err);
      setConfirmVisible(false);
    } finally {
      setSelectedPropertyId(null);
    }
  };

  if (isLoading) {
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

  const renderItem = ({ item }: { item: any }) => {
    // --- MODIFICATIONS START HERE ---
    const { amount: rentAmount, type: rentType } = getRentInfo(item.rentRates);
    const city = item.location?.city || "City N/A";
    const area = item.location?.area || "Area N/A";
    const persons = item.capacity?.persons;
    const beds = item.capacity?.beds;
    const bathrooms = item.capacity?.bathrooms;

    // Format the duration text (e.g., "daily" -> "/ day")
    const durationText =
      rentType === "daily"
        ? "/ day"
        : rentType === "monthly"
        ? "/ month"
        : rentType === "weekly"
        ? "/week"
        : "N/A";
    // --- MODIFICATIONS END HERE ---

    return (
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
              {area}, {city} {/* Using Area and City from the new structure */}
            </Text>
          </View>
          <View style={styles.capacityRow}>
            {renderCapacity(
              "account-group-outline",
              persons, // Using item.capacity.persons
              "persons"
            )}
            {renderCapacity(
              "bed-outline",
              beds, // Using item.capacity.beds
              "Beds"
            )}
            {renderCapacity(
              "bathtub-outline",
              bathrooms, // Using item.capacity.bathrooms
              "Baths"
            )}
          </View>
          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: currentTheme.primary }]}>
              Rs. {rentAmount.toLocaleString() || "N/A"}
            </Text>
            <Text style={[styles.priceDuration, { color: currentTheme.muted }]}>
              {durationText} {/* Adjusted duration based on rentRates */}
            </Text>
          </View>
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: currentTheme.success }]}
            onPress={() => handleOpenDetails(item._id)}
          >
            <MaterialCommunityIcons name="eye-outline" size={20} color="#fff" />
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
            style={[styles.button, { backgroundColor: currentTheme.danger }]}
            onPress={() => showDeleteConfirm(item._id)}
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
    );
  };

  return (
    <>
      <FlatList
        style={{ flex: 1, backgroundColor: currentTheme.background }}
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
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      />

      <ConfirmationModal
        visible={confirmVisible}
        title="Confirm Deletion"
        message="Are you sure you want to delete this property?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setConfirmVisible(false)}
      />
    </>
  );
};

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
