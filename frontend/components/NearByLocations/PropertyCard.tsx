import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";

interface Property {
  _id: string;
  title: string;
  location: string;
  monthlyRent: number;
  photos?: string[];
  capacityState?: {
    bedrooms?: number;
    bathrooms?: number;
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
  const colors = Colors[theme];

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={styles.content}
      >
        <Image
          source={{
            uri: property.photos?.[0] || "https://via.placeholder.com/300",
          }}
          style={styles.image}
        />

        <View style={styles.info}>
          <Text style={[styles.price, { color: colors.text }]}>
            Rs {property.monthlyRent?.toLocaleString()}
          </Text>

          <Text
            numberOfLines={1}
            style={[styles.title, { color: colors.text }]}
          >
            {property.title}
          </Text>

          <View style={styles.row}>
            <Ionicons
              name="location-outline"
              size={14}
              color={colors.primary}
            />
            <Text
              numberOfLines={1}
              style={[styles.location, { color: colors.muted }]}
            >
              {property.location}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={{ color: colors.muted, fontSize: 12 }}>
              🛏 {property.capacityState?.bedrooms || 0} Beds
            </Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>
              🚿 {property.capacityState?.bathrooms || 0} Baths
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 22,
    overflow: "hidden",
    elevation: 10,
  },

  content: {
    flexDirection: "row",
    padding: 12,
  },

  image: {
    width: 90,
    height: 90,
    borderRadius: 16,
    marginRight: 12,
  },

  info: { flex: 1 },

  price: { fontSize: 18, fontWeight: "800" },

  title: { fontSize: 15, fontWeight: "700", marginVertical: 4 },

  location: { fontSize: 13 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },

  close: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#000",
    padding: 6,
    borderRadius: 20,
  },
});

export default PropertyCard;
