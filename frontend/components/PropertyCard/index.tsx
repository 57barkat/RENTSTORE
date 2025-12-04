import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import FavoriteButton from "./FavoriteButton";
import PropertyCapacityRow from "./PropertyCapacityRow";
import { useTheme } from "@/contextStore/ThemeContext";

interface PropertyCardProps {
  title: string;
  imageUri: string;
  city: string;
  country?: string;
  persons: number | string;
  beds: number | string;
  baths: number | string;
  rent: number;
  isFav?: boolean;
  loadingFav?: boolean;
  onFavPress: () => void;
  onPress: () => void;
}

export default function PropertyCard({
  title,
  imageUri,
  city,
  country,
  persons,
  beds,
  baths,
  rent,
  isFav,
  loadingFav,
  onFavPress,
  onPress,
}: PropertyCardProps) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme === "dark" ? "#333" : "#fff" },
      ]}
      onPress={onPress}
    >
      <Image source={{ uri: imageUri }} style={styles.image} />

      <FavoriteButton isFav={isFav} loading={loadingFav} onPress={onFavPress} />

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            { color: theme === "dark" ? "white" : "black" },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.location,
            { color: theme === "dark" ? "#bbb" : "#555" },
          ]}
          numberOfLines={1}
        >
          {city}, {country}
        </Text>

        <PropertyCapacityRow persons={persons} beds={beds} baths={baths} />

        <View style={styles.priceRow}>
          <Text
            style={[
              styles.price,
              { color: theme === "dark" ? "#ff4d4d" : "#ff1a1a" },
            ]}
          >
            Rs. {rent.toLocaleString()}
          </Text>
          <Text
            style={[
              styles.duration,
              { color: theme === "dark" ? "#bbb" : "#555" },
            ]}
          >
            / month
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    marginBottom: 18,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 6,
  },
  image: { width: "100%", height: 150, borderRadius: 10, marginBottom: 10 },
  content: { padding: 8 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 2 },
  location: { fontSize: 14, marginBottom: 4 },
  priceRow: { flexDirection: "row", alignItems: "baseline", marginTop: 6 },
  price: { fontSize: 18, fontWeight: "700" },
  duration: { fontSize: 13, fontWeight: "500", marginLeft: 5 },
});
