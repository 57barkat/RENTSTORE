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
      <View style={styles.center}>
        <ActivityIndicator size="large" color={currentTheme.primary} />
        <Text style={{ marginTop: 8, color: currentTheme.text }}>
          Loading favorites...
        </Text>
      </View>
    );
  }

  if (queryResult.isError) {
    return (
      <View style={styles.center}>
        <Text style={{ color: currentTheme.error }}>
          Failed to load favorites.
        </Text>
      </View>
    );
  }

  // FIXED: extract the property object from each favorite
  const favoritesArray: Property[] = Array.isArray(queryResult.data)
    ? queryResult.data.map((fav) => fav.property)
    : [];

  return (
    <FlatList
      style={{ flex: 1, padding: 8, backgroundColor: currentTheme.background }}
      data={favoritesArray}
      keyExtractor={(item) => item._id}
      ListHeaderComponent={
        <View>
          <Text style={[styles.header, { color: currentTheme.text }]}>
            My Favorite Properties
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View
          style={[
            styles.card,
            { backgroundColor: currentTheme.card, width: width * 0.95 },
          ]}
        >
          <Text style={[styles.title, { color: currentTheme.text }]}>
            {item.title ?? "No title"}
          </Text>
          <Text style={[styles.location, { color: currentTheme.muted }]}>
            📍 {item.city ?? "-"} | {item.address ?? "-"}
          </Text>
          <Text style={[styles.price, { color: currentTheme.primary }]}>
            💰 Rs. {item.rentPrice?.toLocaleString() ?? "-"}
          </Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: currentTheme.success }]}
              onPress={() => handleOpenDetails(item._id)}
            >
              <Text style={styles.buttonText}>View</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: currentTheme.danger }]}
              onPress={() => handleRemoveFavorite(item._id)}
            >
              <Text style={styles.buttonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}
    />
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
  card: {
    padding: 14,
    marginBottom: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: "600", marginTop: 10 },
  location: { marginBottom: 2 },
  price: { fontWeight: "500" },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});

export default Favorites;
