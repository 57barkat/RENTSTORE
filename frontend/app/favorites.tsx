import React from "react";
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
  city?: string;
  address?: string;
  rentPrice?: number;
};

const Favorites = () => {
  const queryResult = useGetUserFavoritesQuery();

  const [removeFavorite] = useRemoveUserFavoriteMutation();

  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const { width } = useWindowDimensions();

  const handleOpenDetails = (id: string) => {
    router.push(`/property/${id}`);
  };

  const handleRemoveFavorite = async (propertyId: string) => {
    try {
      await removeFavorite({ propertyId }).unwrap();
      Alert.alert("Removed!", "Property has been removed from favorites.");
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
          Loading favorites...
        </Text>
      </View>
    );
  }

  if (queryResult.isError) {
    return (
      <View
        style={[styles.center, { backgroundColor: currentTheme.background }]}
      >
        <Text style={[styles.errorText, { color: currentTheme.error }]}>
          Failed to load favorites.
        </Text>
      </View>
    );
  }

  const favoritesArray: Property[] = Array.isArray(queryResult.data)
    ? queryResult.data.map((fav) => fav.property)
    : [];

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: currentTheme.background }}
      data={favoritesArray}
      keyExtractor={(item) => item._id}
      ListHeaderComponent={
        <View style={styles.headerContainer}>
          <Text style={[styles.header, { color: currentTheme.text }]}>
            My Favorite Properties
          </Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: currentTheme.muted }]}>
            You have no favorite properties.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View
          style={[
            styles.card,
            {
              backgroundColor: currentTheme.card,
              width: width * 0.9,
              borderColor: currentTheme.border,
            },
          ]}
        >
          <Text style={[styles.title, { color: currentTheme.text }]}>
            {item.title ?? "No title"}
          </Text>
          <View style={styles.row}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={16}
              color={currentTheme.muted}
            />
            <Text style={[styles.location, { color: currentTheme.muted }]}>
              {item.city ?? "-"} | {item.address ?? "-"}
            </Text>
          </View>
          <View style={styles.row}>
            <MaterialCommunityIcons
              name="currency-usd"
              size={16}
              color={currentTheme.primary}
            />
            <Text style={[styles.price, { color: currentTheme.primary }]}>
              Rs. {item.rentPrice?.toLocaleString() ?? "-"}
            </Text>
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
              style={[styles.button, { backgroundColor: currentTheme.danger }]}
              onPress={() =>
                Alert.alert(
                  "Confirm Removal",
                  "Are you sure you want to remove this property from your favorites?",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Remove", style: "destructive", onPress: () => handleRemoveFavorite(item._id) },
                  ]
                )
              }
            >
              <MaterialCommunityIcons name="heart-off-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      contentContainerStyle={{ alignItems: "center", paddingVertical: 10 }}
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
  },
  errorText: {
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  headerContainer: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#e0e0e0",
    marginBottom: 8,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 4,
  },
  location: {
    fontSize: 14,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 16,
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

export default Favorites;