import { useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import {
  useFindPropertyByIdQuery,
  useAddToFavMutation,
  useRemoveUserFavoriteMutation,
} from "@/services/api";
import { Colors } from "@/constants/Colors";
import { useCallback } from "react";
import ImageCarousel from "@/utils/Carousel";
import { useTheme } from "@/contextStore/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const PADDING = 24;

export const options = {
  headerShown: false,
};

export default function PropertyDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const currentTheme = Colors[theme];

  const {
    data: property,
    isLoading,
    error,
    refetch,
  } = useFindPropertyByIdQuery(id!, { skip: !id });

  const [addToFav, { isLoading: isFavLoading }] = useAddToFavMutation();
  const [removeUserFavorite, { isLoading: isRemoveLoading }] =
    useRemoveUserFavoriteMutation();

  useFocusEffect(
    useCallback(() => {
      if (id) refetch();
    }, [id, refetch])
  );

  // --- Render Loading, Error, and Not Found States ---
  if (isLoading || error || !property) {
    let message = "Loading property...";
    if (error) message = "Error loading property.";
    if (!property) message = "No property found.";

    const messageColor = error ? currentTheme.error : currentTheme.text;

    return (
      <View
        style={[
          styles.centeredContainer,
          { backgroundColor: currentTheme.background },
        ]}
      >
        <ActivityIndicator size="large" color={currentTheme.primary} />
        <Text style={[styles.text, { color: messageColor }]}>{message}</Text>
      </View>
    );
  }

  // --- Helper function to render label/value ---
  const renderDetail = (
    label: string,
    value: string | number | null | undefined
  ) => {
    if (value === null || value === undefined) return null;

    const displayValue = typeof value === "string" ? value.trim() : value;
    if (!displayValue) return null;

    return (
      <View style={styles.detailRow}>
        <Text style={[styles.detailLabel, { color: currentTheme.secondary }]}>
          {label}:
        </Text>
        <Text style={[styles.detailValue, { color: currentTheme.text }]}>
          {displayValue}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* --- Image Carousel --- */}
      {property.images?.length > 0 && (
        <View style={styles.carouselContainer}>
          <ImageCarousel
            media={[
              ...(property.images?.map((uri: string) => ({
                uri,
                type: "image",
              })) || []),
              ...(property.videos?.map((uri: string) => ({
                uri,
                type: "video",
              })) || []),
            ]}
          />
        </View>
      )}

      {/* --- Property Main Info --- */}
      <View style={[styles.card, { backgroundColor: currentTheme.card }]}>
        <Text style={[styles.title, { color: currentTheme.primary }]}>
          {property.title}
        </Text>
        <Text style={[styles.price, { color: currentTheme.accent }]}>
          Rs. {property.rentPrice?.toLocaleString()}
        </Text>
        <Text style={[styles.location, { color: currentTheme.secondary }]}>
          {property.address}, {property.city}
        </Text>
      </View>

      {/* --- Action Buttons --- */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: property.isFav ? "red" : currentTheme.secondary,
            },
          ]}
          onPress={async () => {
            if (!property?._id) return;
            try {
              if (property.isFav) {
                await removeUserFavorite({ propertyId: property._id }).unwrap();
              } else {
                await addToFav({ propertyId: property._id }).unwrap();
              }
              await refetch();
            } catch (err) {
              console.log(err);
            }
          }}
        >
          <MaterialCommunityIcons
            name={property.isFav ? "heart" : "heart-outline"}
            size={20}
            color="#fff"
          />
          <Text style={styles.buttonText}>
            {property.isFav ? "Saved" : "Save"}
          </Text>
          {(isFavLoading || isRemoveLoading) && (
            <ActivityIndicator
              size="small"
              color="#fff"
              style={{ marginLeft: 8 }}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: currentTheme.secondary }]}
          onPress={() => {
            if (property.latitude && property.longitude) {
              Linking.openURL(
                `http://maps.google.com/?q=${property.latitude},${property.longitude}`
              );
            } else {
              Linking.openURL(
                `http://maps.google.com/?q=${encodeURIComponent(
                  `${property.address}, ${property.city}`
                )}`
              );
            }
          }}
        >
          <MaterialCommunityIcons name="map-marker" size={20} color="#fff" />
          <Text style={styles.buttonText}>Map</Text>
        </TouchableOpacity>
      </View>

      {/* --- Property & Financial Info --- */}
      <View style={[styles.card, { backgroundColor: currentTheme.card }]}>
        <Text
          style={[styles.sectionHeading, { color: currentTheme.secondary }]}
        >
          Property Details
        </Text>
        {renderDetail("Type", property.propertyType)}
        {renderDetail(
          "Area",
          property.area ? `${property.area.toLocaleString()} sq.ft` : null
        )}
        {renderDetail(
          "Total Area",
          property.totalArea
            ? `${property.totalArea.toLocaleString()} sq.ft`
            : null
        )}
        {renderDetail("Bedrooms", property.bedrooms)}
        {renderDetail("Bathrooms", property.bathrooms)}
        {renderDetail("Kitchens", property.kitchens)}
        {renderDetail("Living Rooms", property.livingRooms)}
        {renderDetail("Balconies", property.balconies)}
        {renderDetail(
          "Furnished",
          property.furnished !== undefined
            ? property.furnished
              ? "Yes"
              : "No"
            : null
        )}

        <View style={styles.divider} />

        <Text
          style={[styles.sectionHeading, { color: currentTheme.secondary }]}
        >
          Financial Info
        </Text>
        {renderDetail(
          "Security Deposit",
          property.securityDeposit
            ? `Rs. ${property.securityDeposit.toLocaleString()}`
            : null
        )}
        {renderDetail(
          "Maintenance",
          property.maintenanceCharges
            ? `Rs. ${property.maintenanceCharges.toLocaleString()}`
            : null
        )}
        {renderDetail(
          "Utilities Included",
          property.utilitiesIncluded !== undefined
            ? property.utilitiesIncluded
              ? "Yes"
              : "No"
            : null
        )}
      </View>

      {/* --- Amenities --- */}
      {property.amenities?.length > 0 && (
        <View style={[styles.card, { backgroundColor: currentTheme.card }]}>
          <Text
            style={[styles.sectionHeading, { color: currentTheme.secondary }]}
          >
            Amenities
          </Text>
          <View style={styles.amenitiesContainer}>
            {property.amenities[0]
              .split(",")
              .map((amenity: string, idx: number) => (
                <View
                  key={idx}
                  style={[
                    styles.amenityTag,
                    { backgroundColor: currentTheme.background },
                  ]}
                >
                  <Text
                    style={[
                      styles.amenityText,
                      { color: currentTheme.secondary },
                    ]}
                  >
                    {amenity.trim()}
                  </Text>
                </View>
              ))}
          </View>
        </View>
      )}

      {/* --- Owner Info --- */}
      {property.ownerId && (
        <View style={[styles.card, { backgroundColor: currentTheme.card }]}>
          <Text
            style={[styles.sectionHeading, { color: currentTheme.secondary }]}
          >
            Listed By
          </Text>
          {renderDetail("Name", property.ownerId.name)}
          {renderDetail("Phone", property.ownerId.phone)}
          {renderDetail("Email", property.ownerId.email)}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingBottom: 24 },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    marginHorizontal: PADDING,
    marginTop: PADDING / 2,
    padding: PADDING,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  carouselContainer: { width: "100%", height: 250 },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 4 },
  price: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  location: { fontSize: 16, fontWeight: "500" },
  text: { fontSize: 16, lineHeight: 24, textAlign: "center" },
  sectionHeading: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  divider: { height: 1, backgroundColor: "#e0e0e0", marginVertical: 16 },
  detailRow: { flexDirection: "row", alignItems: "baseline", marginBottom: 8 },
  detailLabel: { fontSize: 16, fontWeight: "500", minWidth: 120 },
  detailValue: { fontSize: 16, fontWeight: "600", flex: 1, flexWrap: "wrap" },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: PADDING,
    marginTop: PADDING,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 30,
    minWidth: 120,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 15, marginLeft: 8 },
  amenitiesContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  amenityTag: { borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16 },
  amenityText: { fontSize: 14, fontWeight: "500" },
});
