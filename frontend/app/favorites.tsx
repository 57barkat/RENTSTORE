import React, { useEffect, useState, useCallback } from "react";
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
  RefreshControl,
  SafeAreaView,
} from "react-native";
import {
  useGetUserFavoritesQuery,
  useRemoveUserFavoriteMutation,
} from "@/services/api";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../constants/Colors";
import { router } from "expo-router";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { FontSize } from "@/constants/Typography";

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
  const cardWidth = width * 0.92;

  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryResult.refetch();
    setRefreshing(false);
  }, [queryResult]);

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

  if (queryResult.isLoading && !refreshing) {
    return (
      <View
        style={[styles.center, { backgroundColor: currentTheme.background }]}
      >
        <ActivityIndicator size="large" color={currentTheme.secondary} />
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
          (property: Property | null): property is Property => property != null,
        )
    : [];

  const ListEmptyComponent = (
    <View style={[styles.emptyContainer, { height: width * 0.8 }]}>
      <MaterialCommunityIcons
        name="heart-outline"
        size={80}
        color={currentTheme.muted + "40"}
      />
      <Text style={[styles.emptyText, { color: currentTheme.muted }]}>
        You don’t have any favorite properties yet.
      </Text>

      <TouchableOpacity
        style={[
          styles.browseButton,
          { backgroundColor: currentTheme.secondary },
        ]}
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
            size={40}
            color={currentTheme.muted}
          />
        )}
      </View>

      <View style={styles.cardContent}>
        <Text
          style={[styles.title, { color: currentTheme.text }]}
          numberOfLines={1}
        >
          {item.title ?? "Property Title"}
        </Text>

        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={16}
            color={currentTheme.secondary}
          />
          <Text
            style={[styles.location, { color: currentTheme.muted }]}
            numberOfLines={1}
          >
            {item.location ?? "Unknown Location"}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={[styles.priceLabel, { color: currentTheme.muted }]}>
            Monthly Rent
          </Text>
          <Text style={[styles.price, { color: currentTheme.secondary }]}>
            Rs. {item.monthlyRent?.toLocaleString() ?? "N/A"}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: currentTheme.secondary }]}
            onPress={() => handleOpenDetails(item._id)}
          >
            <Text style={styles.buttonText}>View Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.removeButton, { borderColor: currentTheme.danger }]}
            onPress={() => {
              setSelectedId(item._id);
              setShowModal(true);
            }}
          >
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={20}
              color={currentTheme.danger}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.background }}>
      {/* Updated Header with Back Button */}
      <View
        style={[
          styles.headerWrapper,
          { borderBottomColor: currentTheme.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={28} color={currentTheme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>
          Favorites
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        style={{ flex: 1 }}
        data={favoritesArray}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[currentTheme.secondary]}
            tintColor={currentTheme.secondary}
          />
        }
        ListEmptyComponent={ListEmptyComponent}
        renderItem={renderFavoriteItem}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
      />

      <Modal transparent visible={showModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalBox, { backgroundColor: currentTheme.card }]}
          >
            <View
              style={[
                styles.modalIcon,
                { backgroundColor: currentTheme.danger + "20" },
              ]}
            >
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={40}
                color={currentTheme.danger}
              />
            </View>
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
              Remove Favorite?
            </Text>

            <Text style={[styles.modalDesc, { color: currentTheme.muted }]}>
              This property will be removed from your favorites list.
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  { backgroundColor: currentTheme.border + "50" },
                ]}
                onPress={() => setShowModal(false)}
              >
                <Text style={{ color: currentTheme.text, fontWeight: "600" }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  { backgroundColor: currentTheme.danger },
                ]}
                onPress={confirmRemoval}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: FontSize.base, fontWeight: "500" },
  errorText: { marginTop: 10, fontSize: FontSize.sm, fontWeight: "600" },
  headerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: FontSize.base,
    fontWeight: "500",
    marginTop: 15,
    textAlign: "center",
  },
  browseButton: {
    marginTop: 25,
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  browseButtonText: {
    color: "#fff",
    fontSize: FontSize.base,
    fontWeight: "700",
  },
  listContentContainer: {
    alignItems: "center",
    paddingVertical: 16,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 20,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  imagePlaceholder: {
    width: "100%",
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  propertyImage: { width: "100%", height: "100%", resizeMode: "cover" },
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 4,
  },
  location: { fontSize: FontSize.sm, flex: 1 },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e1e1e1",
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: FontSize.xs,
    fontWeight: "500",
  },
  price: { fontSize: FontSize.base, fontWeight: "800" },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: FontSize.sm },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "85%",
    padding: 24,
    borderRadius: 24,
    alignItems: "center",
  },
  modalIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: FontSize.lg, fontWeight: "700", marginBottom: 8 },
  modalDesc: {
    textAlign: "center",
    fontSize: FontSize.base,
    marginBottom: 24,
    lineHeight: 20,
  },
  modalBtnRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Favorites;
