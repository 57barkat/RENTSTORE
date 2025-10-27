import React, { useEffect } from "react";
import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Alert,
  Platform,
  Image, // Correctly imported Image
} from "react-native";
import {
  useGetUserFavoritesQuery,
  useRemoveUserFavoriteMutation,
} from "@/services/api";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../constants/Colors";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Property = {
  _id: string;
  title?: string;
  location?: string;
  monthlyRent?: number;
  photos?: string[];
};

const Favorites = () => {
  const queryResult = useGetUserFavoritesQuery(null as any);
  const [removeFavorite] = useRemoveUserFavoriteMutation();

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
      Alert.alert("Removed! 💔", "Property has been removed from favorites.");
      queryResult.refetch();
    } catch (err) {
      console.error("Remove favorite failed:", err);
      Alert.alert("Error", "Failed to remove favorite.");
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
  // -------------------------------------------------------------

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

  const renderFavoriteItem = ({ item }: { item: Property }) => (
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
      {/* Optional: Property Image/Preview */}
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

      {/* Property Info */}
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
          {item.location ?? "Unknown Location"}
        </Text>
      </View>

      {/* Price */}
      <View style={styles.infoRow}>
        <MaterialCommunityIcons
          name="cash-multiple"
          size={18}
          color={currentTheme.primary}
        />
        <Text style={[styles.price, { color: currentTheme.primary }]}>
          Rs. **{item.monthlyRent?.toLocaleString() ?? "N/A"}** / month
        </Text>
      </View>

      {/* Action Buttons */}
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
          onPress={() =>
            Alert.alert(
              "Confirm Removal",
              "Are you sure you want to remove this property from your favorites?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Remove",
                  style: "destructive",
                  onPress: () => handleRemoveFavorite(item._id),
                },
              ]
            )
          }
        >
          <MaterialCommunityIcons name="close" size={20} color="#fff" />
          <Text style={styles.buttonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
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
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: Platform.OS === "android" ? 20 : 0,
    marginBottom: 8,
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
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
  browseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
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
  propertyImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  location: {
    fontSize: 14,
    flexShrink: 1,
  },
  price: {
    fontSize: 17,
    fontWeight: "bold",
  },
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
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});

export default Favorites;
