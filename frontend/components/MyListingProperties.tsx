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
  Alert,
} from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../constants/Colors";
import { router } from "expo-router";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons"; // Added Feather for map-pin icon

const MyListingProperties = () => {
  const {
    data: myProperties,
    isLoading,
    error,
    refetch,
  } = useFindMyPropertiesQuery(undefined);

  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const { width } = useWindowDimensions();

  const handleOpenDetails = (id: string) => {
    router.push(`/property/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/property/edit/${id}`);
  };

  const [deleteProperty] = useFindPropertyByIdAndDeleteMutation();

  const handleDelete = async (id: string) => {
    try {
      await deleteProperty(id).unwrap();
      Alert.alert("Deleted! 👋", "Property has been successfully removed.");
      refetch();
    } catch (err) {
      console.error("Delete failed:", err);
      Alert.alert("Error", "Failed to delete property.");
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

  // Helper to render property capacity icons
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
            onPress={() => router.push("/upload")} // Assuming you have a route for creating a property
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
              width: width - 40, // Match a standard design padding of 20 on each side
              // shadowColor: currentTheme.shadow,
              borderColor: currentTheme.border,
            },
          ]}
        >
          {/* Main Info Section */}
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

            {/* Capacity Row */}
            <View style={styles.capacityRow}>
              {renderCapacity(
                "account-group-outline",
                item.capacityState?.guests,
                "Guests"
              )}
              {renderCapacity("bed-outline", item.capacityState?.beds, "Beds")}
              {renderCapacity(
                "bathtub-outline",
                item.capacityState?.bathrooms,
                "Baths"
              )}
            </View>

            {/* Price */}
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

          {/* Actions Row */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: currentTheme.success }]}
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
              onPress={() => handleEdit(item._id)}
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
              onPress={() =>
                Alert.alert(
                  "Confirm Deletion",
                  "Are you sure you want to delete this property?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => handleDelete(item._id),
                    },
                  ]
                )
              }
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
        paddingHorizontal: 20, // Added padding to the list container
        paddingBottom: 40,
      }}
    />
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontWeight: "500",
  },
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
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  createButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  headerContainer: {
    paddingTop: 16,
    paddingBottom: 20,
    marginBottom: 8,
  },
  header: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "left",
  },
  // --- CARD STYLES ---
  card: {
    padding: 18,
    marginBottom: 20, // Increased spacing between cards
    borderRadius: 15, // More rounded corners
    borderWidth: StyleSheet.hairlineWidth,
    // Enhanced shadow for floating effect
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  infoSection: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20, // Larger title
    fontWeight: "800",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8, // Increased gap
  },
  location: {
    fontSize: 14,
    fontWeight: "500",
  },
  capacityRow: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 12,
    gap: 20, // Gap between capacity items
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  capacityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  capacityText: {
    fontSize: 13,
    fontWeight: "500",
  },
  // Price Styling (similar to previous component)
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 10,
  },
  price: {
    fontSize: 22,
    fontWeight: "900", // Extra bold price
  },
  priceDuration: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 5,
  },
  // --- ACTIONS STYLES ---
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
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default MyListingProperties;
