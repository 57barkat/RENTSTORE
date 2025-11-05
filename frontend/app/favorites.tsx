import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Platform,
  Image,
} from "react-native";
import {
  useGetUserFavoritesQuery,
  useRemoveUserFavoriteMutation,
} from "@/services/api";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../constants/Colors";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ConfirmationModal from "@/components/ConfirmDialog";

type RentRate = {
  type: "daily" | "weekly" | "monthly";
  amount: number;
};

type Property = {
  _id: string;
  title?: string;
  location?: { city?: string; area?: string };
  rentRates?: RentRate[];
  photos?: string[];
};

const Favorites = () => {
  const queryResult = useGetUserFavoritesQuery(null as any);
  const [removeFavorite] = useRemoveUserFavoriteMutation();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const { width } = useWindowDimensions();
  const cardWidth = width * 0.9;

  const handleOpenDetails = (id: string) => {
    router.push(`/property/${id}`);
  };

  useEffect(() => {
    queryResult.refetch();
  }, []);

  const handleRemoveFavorite = async (propertyId: string) => {
    try {
      await removeFavorite({ propertyId }).unwrap();
      queryResult.refetch();
    } catch (err) {
      console.error("Remove favorite failed:", err);
    }
  };

  if (queryResult.isLoading) {
    return (
      <View
        style={[styles.center, { backgroundColor: currentTheme.background }]}
      >
        <ActivityIndicator size="large" color={currentTheme.primary} />
        <Text style={[styles.loadingText, { color: currentTheme.text }]}>
          Loading your favorite properties...
        </Text>
      </View>
    );
  }

  if (queryResult.isError) {
    return (
      <View
        style={[styles.center, { backgroundColor: currentTheme.background }]}
      >
        <Text style={[styles.errorText, { color: currentTheme.danger }]}>
          Failed to load favorites. Please try again.
        </Text>
      </View>
    );
  }

  const favoritesArray: Property[] = Array.isArray(queryResult.data)
    ? queryResult.data
        .map((fav: any) => fav.property)
        .filter(
          (property: Property | null | undefined): property is Property =>
            property != null
        )
    : [];

  const ListEmptyComponent = (
    <View style={[styles.emptyContainer, { height: width * 0.6 }]}>
      <MaterialCommunityIcons
        name="heart-broken-outline"
        size={60}
        color={currentTheme.muted}
      />
      <Text style={[styles.emptyText, { color: currentTheme.muted }]}>
        You don&apos;t have any favorite properties yet.
      </Text>
      <TouchableOpacity
        style={[styles.browseButton, { backgroundColor: currentTheme.primary }]}
        onPress={() => router.push("/homePage")}
      >
        <Text style={styles.browseButtonText}>Start Browsing</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFavoriteItem = ({ item }: { item: Property }) => {
    // const dailyRate = item.rentRates?.find((r) => r.type === "daily");
    // const weeklyRate = item.rentRates?.find((r) => r.type === "weekly");
    // const monthlyRate = item.rentRates?.find((r) => r.type === "monthly");

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: currentTheme.card,
            width: cardWidth,
            borderColor: currentTheme.border,
          },
        ]}
      >
        {/* Property Image */}
        <View
          style={[
            styles.imagePlaceholder,
            { backgroundColor: currentTheme.muted + "20" },
          ]}
        >
          {item.photos && item.photos.length > 0 ? (
            <Image
              source={{ uri: item.photos[0] }}
              style={styles.propertyImage}
            />
          ) : (
            <MaterialCommunityIcons
              name="image-off-outline"
              size={30}
              color={currentTheme.muted}
            />
          )}
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: currentTheme.text }]}>
          {item.title ?? "Property Title"}
        </Text>

        {/* Location */}
        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={18}
            color={currentTheme.secondary}
          />
          <Text style={[styles.location, { color: currentTheme.muted }]}>
            {item.location?.area
              ? `${item.location.area}, ${item.location.city}`
              : item.location?.city || "Unknown Location"}
          </Text>
        </View>

        {/* Rent Rates */}
        {/* <View style={styles.rentContainer}>
          {dailyRate && (
            <Text style={[styles.priceText, { color: currentTheme.primary }]}>
              Rs. {dailyRate.amount.toLocaleString()} / day
            </Text>
          )}
          {weeklyRate && (
            <Text style={[styles.priceText, { color: currentTheme.primary }]}>
              Rs. {weeklyRate.amount.toLocaleString()} / week
            </Text>
          )}
          {monthlyRate && (
            <Text style={[styles.priceText, { color: currentTheme.primary }]}>
              Rs. {monthlyRate.amount.toLocaleString()} / month
            </Text>
          )}
          {!dailyRate && !weeklyRate && !monthlyRate && (
            <Text style={[styles.noRateText, { color: currentTheme.muted }]}>
              Rent info not available
            </Text>
          )}
        </View> */}

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: currentTheme.success }]}
            onPress={() => handleOpenDetails(item._id)}
          >
            <MaterialCommunityIcons name="eye-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>View Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: currentTheme.danger }]}
            onPress={() => {
              setSelectedPropertyId(item._id);
              setShowConfirmModal(true);
            }}
          >
            <MaterialCommunityIcons name="close" size={20} color="#fff" />
            <Text style={styles.buttonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <>
      <FlatList
        style={{ flex: 1, backgroundColor: currentTheme.background }}
        data={favoritesArray}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={[styles.header, { color: currentTheme.text }]}>
              ❤️ My Favorite Properties
            </Text>
          </View>
        }
        ListEmptyComponent={ListEmptyComponent}
        renderItem={renderFavoriteItem}
        contentContainerStyle={styles.listContentContainer}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showConfirmModal}
        title="Confirm Removal"
        message="Are you sure you want to remove this property from your favorites?"
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={() => {
          if (selectedPropertyId) handleRemoveFavorite(selectedPropertyId);
          setShowConfirmModal(false);
          setSelectedPropertyId(null);
        }}
        onCancel={() => {
          setShowConfirmModal(false);
          setSelectedPropertyId(null);
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16 },
  errorText: { marginTop: 10, fontSize: 16, fontWeight: "600" },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: Platform.OS === "android" ? 20 : 0,
    marginBottom: 8,
  },
  header: { fontSize: 28, fontWeight: "800", textAlign: "center" },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 80,
    minHeight: 300,
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "500",
    marginTop: 15,
    textAlign: "center",
  },
  browseButton: {
    marginTop: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  browseButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  listContentContainer: {
    alignItems: "center",
    paddingVertical: 10,
    paddingBottom: 40,
  },
  card: {
    padding: 18,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  imagePlaceholder: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  propertyImage: { width: "100%", height: "100%", resizeMode: "cover" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  location: { fontSize: 14, flexShrink: 1 },
  rentContainer: { marginVertical: 8 },
  priceText: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  noRateText: { fontSize: 14 },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});

export default Favorites;
