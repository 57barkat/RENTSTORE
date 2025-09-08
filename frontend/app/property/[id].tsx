import { useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useFindPropertyByIdQuery } from "@/services/api";
import { Colors } from "@/constants/Colors";
import { useCallback } from "react";

export const options = {
  headerShown: false,
};

export default function PropertyDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
        <ActivityIndicator size="large" />
        <Text>Loading property...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>Error loading property.</Text>
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.center}>
        <Text>No property found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 🖼️ Images */}
      {property.images?.length > 0 && (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
        >
          {property.images.map((img: string, idx: number) => (
            <Image
              key={idx}
              source={{ uri: img }}
              style={styles.image}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}

      {/* 🏡 Title & Price */}
      <View style={styles.section}>
        <Text style={styles.title}>{property.title}</Text>
        <Text style={styles.price}>
          Rs. {property.rentPrice?.toLocaleString()}
        </Text>
        <TouchableOpacity
          style={{
            marginTop: 8,
            backgroundColor: "#2c7a7b",
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 8,
            alignSelf: "flex-start",
          }}
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
          <Text style={{ color: "#fff", fontWeight: "600" }}>
            📍 View on Map
          </Text>
        </TouchableOpacity>
      </View>

      {/* 📝 Description */}
      {property.description && (
        <View style={styles.section}>
          <Text style={styles.heading}>Description</Text>
          <Text style={styles.text}>{property.description}</Text>
        </View>
      )}

      {/* 🛋️ Property Details */}
      <View style={styles.section}>
        <Text style={styles.heading}>Property Details</Text>
        <Text style={styles.text}>Type: {property.propertyType}</Text>
        {property.area && (
          <Text style={styles.text}>Area: {property.area} sq.ft</Text>
        )}
        {property.totalArea && (
          <Text style={styles.text}>Total Area: {property.totalArea}</Text>
        )}
        {property.bedrooms !== undefined && (
          <Text style={styles.text}>Bedrooms: {property.bedrooms}</Text>
        )}
        {property.bathrooms !== undefined && (
          <Text style={styles.text}>Bathrooms: {property.bathrooms}</Text>
        )}
        {property.kitchens !== undefined && (
          <Text style={styles.text}>Kitchens: {property.kitchens}</Text>
        )}
        {property.livingRooms !== undefined && (
          <Text style={styles.text}>Living Rooms: {property.livingRooms}</Text>
        )}
        {property.balconies !== undefined && (
          <Text style={styles.text}>Balconies: {property.balconies}</Text>
        )}
        {property.furnished !== undefined && (
          <Text style={styles.text}>
            Furnished: {property.furnished ? "Yes" : "No"}
          </Text>
        )}
        {property.floor !== undefined && (
          <Text style={styles.text}>Floor: {property.floor}</Text>
        )}
      </View>

      {/* 💵 Financial Info */}
      <View style={styles.section}>
        <Text style={styles.heading}>Financial Info</Text>
        {property.securityDeposit !== undefined && (
          <Text style={styles.text}>
            Security Deposit: Rs. {property.securityDeposit?.toLocaleString()}
          </Text>
        )}
        {property.maintenanceCharges !== undefined && (
          <Text style={styles.text}>
            Maintenance: Rs. {property.maintenanceCharges?.toLocaleString()}
          </Text>
        )}
        {property.utilitiesIncluded !== undefined && (
          <Text style={styles.text}>
            Utilities Included: {property.utilitiesIncluded ? "Yes" : "No"}
          </Text>
        )}
      </View>

      {/* 🌟 Amenities */}
      {property.amenities?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.heading}>Amenities</Text>
          <Text style={styles.text}>{property.amenities.join(", ")}</Text>
        </View>
      )}

      {/* 👤 Preferences */}
      {property.preferences?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.heading}>Preferences</Text>
          <Text style={styles.text}>{property.preferences.join(", ")}</Text>
        </View>
      )}

      {/* 🕒 Timestamps */}
      <View style={styles.section}>
        <Text style={styles.heading}>Listing Info</Text>
        <Text style={styles.text}>
          Created:{" "}
          {property.createdAt
            ? new Date(property.createdAt).toLocaleString()
            : "N/A"}
        </Text>
        <Text style={styles.text}>
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
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 16,
    marginBottom: 12,
  },
  section: {
    margin: 12,
    padding: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.primary,
  },
  price: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 6,
    color: Colors.light.secondary,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: Colors.light.secondary,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
    color: Colors.light.text,
  },
  button: {
    marginTop: 10,
    backgroundColor: Colors.light.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
