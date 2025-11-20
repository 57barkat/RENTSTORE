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
  Modal,
} from "react-native";
import {
  useGetUserFavoritesQuery,
  useRemoveUserFavoriteMutation,
} from "@/services/api";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../constants/Colors";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

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

  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleOpenDetails = (id: string) => {
    router.push(`/property/${id}`);
  };

  useEffect(() => {
    queryResult.refetch();
  }, []);

  const confirmRemoval = async () => {
    if (!selectedId) return;

    try {
      await removeFavorite({ propertyId: selectedId }).unwrap();
      Toast.show({
        type: "success",
        text1: "Removed from Favorites",
        text2: "This property is no longer in your favorites.",
      });

      setShowModal(false);
      queryResult.refetch();
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error Removing Favorite",
        text2: "Something went wrong.",
      });
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
          (property: Property | null): property is Property => property != null
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
        You don’t have any favorite properties yet.
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
      <View
        style={[
          styles.imagePlaceholder,
          { backgroundColor: currentTheme.muted + "20" },
        ]}
      >
        {item.photos?.[0] ? (
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

      <Text style={[styles.title, { color: currentTheme.text }]}>
        {item.title ?? "Property Title"}
      </Text>

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

      <View style={styles.infoRow}>
        <MaterialCommunityIcons
          name="cash-multiple"
          size={18}
          color={currentTheme.primary}
        />
        <Text style={[styles.price, { color: currentTheme.primary }]}>
          Rs. {item.monthlyRent?.toLocaleString() ?? "N/A"} / month
        </Text>
      </View>

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
            setSelectedId(item._id);
            setShowModal(true);
          }}
        >
          <MaterialCommunityIcons name="close" size={20} color="#fff" />
          <Text style={styles.buttonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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

      {/* Delete Confirmation Modal */}
      <Modal transparent visible={showModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalBox, { backgroundColor: currentTheme.card }]}
          >
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
              Remove From Favorites?
            </Text>

            <Text style={[styles.modalDesc, { color: currentTheme.muted }]}>
              Are you sure you want to remove this property from your favorites?
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  { backgroundColor: currentTheme.border },
                ]}
                onPress={() => setShowModal(false)}
              >
                <Text style={{ color: currentTheme.text }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  { backgroundColor: currentTheme.danger },
                ]}
                onPress={confirmRemoval}
              >
                <Text style={{ color: "#fff" }}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Toast />
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
  price: { fontSize: 17, fontWeight: "bold" },
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

  // Modal UI
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    padding: 20,
    borderRadius: 14,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  modalDesc: { textAlign: "center", fontSize: 14, marginBottom: 20 },
  modalBtnRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});

export default Favorites;
