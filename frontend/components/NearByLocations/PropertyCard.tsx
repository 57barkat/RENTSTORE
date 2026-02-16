import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";

interface Property {
  _id: string;
  title: string;
  location: string;
  monthlyRent: number;
  photos?: string[];
  featured?: boolean;
  capacityState?: {
    totalBeds?: number;
    totalBathrooms?: number;
  };
}

const PropertyCard = ({
  property,
  onPress,
}: {
  property: Property;
  onPress?: () => void;
}) => {
  const { theme } = useTheme();
  const activeColors = Colors[theme];

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: activeColors.card,
          borderColor: activeColors.border,
          shadowColor: "#000",
        },
      ]}
    >
      {/* Property Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: property.photos?.[0] || "https://via.placeholder.com/300",
          }}
          style={styles.image}
        />

        {property.featured && (
          <View
            style={[styles.badge, { backgroundColor: activeColors.primary }]}
          >
            <Text style={styles.badgeText}>FEATURED</Text>
          </View>
        )}

        <TouchableOpacity style={styles.heartButton}>
          <Ionicons name="heart" size={20} color="#FF4B4B" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text style={[styles.price, { color: activeColors.primary }]}>
            Rs. {property.monthlyRent?.toLocaleString()}
            <Text style={styles.perMonth}> /mo</Text>
          </Text>
        </View>

        <Text
          numberOfLines={1}
          style={[styles.title, { color: activeColors.text }]}
        >
          {property.title}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons
            name="location-sharp"
            size={14}
            color={activeColors.muted}
          />
          <Text
            numberOfLines={1}
            style={[styles.address, { color: activeColors.muted }]}
          >
            {property.location}
          </Text>
        </View>

        <View
          style={[styles.divider, { backgroundColor: activeColors.border }]}
        />

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="bed-outline" size={16} color={activeColors.icon} />
            <Text style={[styles.statText, { color: activeColors.text }]}>
              {property.capacityState?.totalBeds || 0} Beds
            </Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons
              name="water-outline"
              size={16}
              color={activeColors.icon}
            />
            <Text style={[styles.statText, { color: activeColors.text }]}>
              {property.capacityState?.totalBathrooms || 0} Baths
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
    marginVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    elevation: 10,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  imageContainer: { width: "100%", height: 180, position: "relative" },
  image: { width: "100%", height: "100%", backgroundColor: "#cbd5e1" },
  heartButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 8,
    borderRadius: 20,
  },
  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "bold" },
  infoContainer: { padding: 18 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  price: { fontSize: 22, fontWeight: "800" },
  perMonth: { fontSize: 14, fontWeight: "400", opacity: 0.6 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  locationRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  address: { fontSize: 14, marginLeft: 4, fontWeight: "500" },
  divider: { height: 1, width: "100%", marginBottom: 12, opacity: 0.5 },
  statsRow: { flexDirection: "row", gap: 20 },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.03)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statText: { fontSize: 13, fontWeight: "600" },
});

export default PropertyCard;
