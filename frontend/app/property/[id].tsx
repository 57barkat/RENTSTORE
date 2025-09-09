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
import { useFindPropertyByIdQuery } from "@/services/api";
import { Colors } from "@/constants/Colors";
import { useCallback } from "react";
import ImageCarousel from "@/utils/Carousel";
import { useTheme } from "@/contextStore/ThemeContext";
 

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

  useFocusEffect(
    useCallback(() => {
      if (id) {
        refetch();
      }
    }, [id, refetch])
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={currentTheme.primary} />
        <Text style={{ color: currentTheme.text }}>Loading property...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: currentTheme.error }}>Error loading property.</Text>
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.center}>
        <Text style={{ color: currentTheme.text }}>No property found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {property.images?.length > 0 && (
        <ImageCarousel images={property.images.map((uri: string) => ({ uri }))} />
      )}

      {/* 🏡 Title & Price */}
      <View style={[styles.section, { backgroundColor: currentTheme.card }]}>
        <Text style={[styles.title, { color: currentTheme.primary }]}>{property.title}</Text>
        <Text style={[styles.price, { color: currentTheme.secondary }]}>
          Rs. {property.rentPrice?.toLocaleString()}
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: currentTheme.secondary }]}
          onPress={() => {
            if (property.latitude && property.longitude) {
              Linking.openURL(
                `https://www.google.com/maps?q=${property.latitude},${property.longitude}`
              );
            } else {
              Linking.openURL(
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${property.address}, ${property.city}`
                )}`
              );
            }
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>📍 View on Map</Text>
        </TouchableOpacity>
      </View>

      {/* 📝 Description */}
      {property.description && (
        <View style={[styles.section, { backgroundColor: currentTheme.card }]}>
          <Text style={[styles.heading, { color: currentTheme.secondary }]}>Description</Text>
          <Text style={[styles.text, { color: currentTheme.text }]}>{property.description}</Text>
        </View>
      )}

      {/* 🛋️ Property Details */}
      <View style={[styles.section, { backgroundColor: currentTheme.card }]}>
        <Text style={[styles.heading, { color: currentTheme.secondary }]}>Property Details</Text>
        <Text style={[styles.text, { color: currentTheme.text }]}>
          Type: {property.propertyType}
        </Text>
        {property.area && (
          <Text style={[styles.text, { color: currentTheme.text }]}>
            Area: {property.area} sq.ft
          </Text>
        )}
        {property.totalArea && (
          <Text style={[styles.text, { color: currentTheme.text }]}>
            Total Area: {property.totalArea}
          </Text>
        )}
        {property.bedrooms !== undefined && (
          <Text style={[styles.text, { color: currentTheme.text }]}>
            Bedrooms: {property.bedrooms}
          </Text>
        )}
        {property.bathrooms !== undefined && (
          <Text style={[styles.text, { color: currentTheme.text }]}>
            Bathrooms: {property.bathrooms}
          </Text>
        )}
        {property.kitchens !== undefined && (
          <Text style={[styles.text, { color: currentTheme.text }]}>
            Kitchens: {property.kitchens}
          </Text>
        )}
        {property.livingRooms !== undefined && (
          <Text style={[styles.text, { color: currentTheme.text }]}>
            Living Rooms: {property.livingRooms}
          </Text>
        )}
        {property.balconies !== undefined && (
          <Text style={[styles.text, { color: currentTheme.text }]}>
            Balconies: {property.balconies}
          </Text>
        )}
        {property.furnished !== undefined && (
          <Text style={[styles.text, { color: currentTheme.text }]}>
            Furnished: {property.furnished ? "Yes" : "No"}
          </Text>
        )}
        {property.floor !== undefined && (
          <Text style={[styles.text, { color: currentTheme.text }]}>
            Floor: {property.floor}
          </Text>
        )}
      </View>

      {/* 💵 Financial Info */}
      <View style={[styles.section, { backgroundColor: currentTheme.card }]}>
        <Text style={[styles.heading, { color: currentTheme.secondary }]}>Financial Info</Text>
        {property.securityDeposit !== undefined && (
          <Text style={[styles.text, { color: currentTheme.text }]}>
            Security Deposit: Rs. {property.securityDeposit?.toLocaleString()}
          </Text>
        )}
        {property.maintenanceCharges !== undefined && (
          <Text style={[styles.text, { color: currentTheme.text }]}>
            Maintenance: Rs. {property.maintenanceCharges?.toLocaleString()}
          </Text>
        )}
        {property.utilitiesIncluded !== undefined && (
          <Text style={[styles.text, { color: currentTheme.text }]}>
            Utilities Included: {property.utilitiesIncluded ? "Yes" : "No"}
          </Text>
        )}
      </View>

      {/* Amenities */}
      {property.amenities?.length > 0 && (
        <View style={[styles.section, { backgroundColor: currentTheme.card }]}>
          <Text style={[styles.heading, { color: currentTheme.secondary }]}>Amenities</Text>
          <View style={styles.amenitiesContainer}>
            {property.amenities[0]
              .split(",")
              .map((amenity: string, idx: number) => (
                <View
                  key={idx}
                  style={[
                    styles.amenityTag,
                    { backgroundColor: currentTheme.border },
                  ]}
                >
                  <Text style={[styles.amenityText, { color: currentTheme.text }]}>
                    {amenity.trim()}
                  </Text>
                </View>
              ))}
          </View>
        </View>
      )}

      {/* Preferences */}
      {property.preferences?.length > 0 && (
        <View style={[styles.section, { backgroundColor: currentTheme.card }]}>
          <Text style={[styles.heading, { color: currentTheme.secondary }]}>Preferences</Text>
          <Text style={[styles.text, { color: currentTheme.text }]}>
            {property.preferences.join(", ")}
          </Text>
        </View>
      )}

      {/* 📍 Location */}
      <View style={[styles.section, { backgroundColor: currentTheme.card }]}>
        <Text style={[styles.heading, { color: currentTheme.secondary }]}>Location</Text>
        <Text style={[styles.text, { color: currentTheme.text }]}>
          Address: {property.address}
        </Text>
        <Text style={[styles.text, { color: currentTheme.text }]}>City: {property.city}</Text>
        {property.latitude && property.longitude && (
          <Text style={[styles.text, { color: currentTheme.text }]}>
            Coordinates: {property.latitude}, {property.longitude}
          </Text>
        )}
      </View>

      {/* Owner Info */}
      {property.ownerId && (
        <View style={[styles.section, { backgroundColor: currentTheme.card }]}>
          <Text style={[styles.heading, { color: currentTheme.secondary }]}>Listed By</Text>
          <Text style={[styles.text, { color: currentTheme.text }]}>
            Name: {property.ownerId.name}
          </Text>
          <Text style={[styles.text, { color: currentTheme.text }]}>
            Email: {property.ownerId.email}
          </Text>
        </View>
      )}

      {/* 🕒 Timestamps */}
      <View style={[styles.section, { backgroundColor: currentTheme.card }]}>
        <Text style={[styles.heading, { color: currentTheme.secondary }]}>Listing Info</Text>
        <Text style={[styles.text, { color: currentTheme.text }]}>
          Created:{" "}
          {property.createdAt
            ? new Date(property.createdAt).toLocaleString()
            : "N/A"}
        </Text>
        <Text style={[styles.text, { color: currentTheme.text }]}>
          Updated:{" "}
          {property.updatedAt
            ? new Date(property.updatedAt).toLocaleString()
            : "N/A"}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  section: {
    margin: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  title: { fontSize: 24, fontWeight: "700" },
  price: { fontSize: 20, fontWeight: "600", marginTop: 6 },
  heading: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  text: { fontSize: 15, lineHeight: 22, marginBottom: 4 },
  button: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  amenitiesContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
  amenityTag: {
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  amenityText: { fontSize: 14, fontWeight: "500" },
});
