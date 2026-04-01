import React from "react";
import { TouchableOpacity, View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const PropertyCard = ({ item, theme, onPress, onToggleFav }: any) => (
  <TouchableOpacity
    activeOpacity={0.9}
    style={[
      styles.card,
      {
        backgroundColor: theme.background,
        borderColor: "#E8EEF3",
        borderWidth: 1,
      },
    ]}
    onPress={onPress}
  >
    <View style={{ position: "relative" }}>
      <Image
        source={{ uri: item.image }}
        style={styles.image}
        resizeMode="cover"
      />

      {item.featured && (
        <View
          style={[styles.featuredTag, { backgroundColor: theme.secondary }]}
        >
          <Text style={styles.featuredText}>FEATURED</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.favButton}
        onPress={() => onToggleFav?.(item.id)}
      >
        <View style={styles.heartCircle}>
          <Ionicons
            name={item.isFav ? "heart" : "heart-outline"}
            size={22}
            color={item.isFav ? "#FF4D4D" : "#64748B"}
          />
        </View>
      </TouchableOpacity>
    </View>

    <View style={styles.content}>
      <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
        {item.title}
      </Text>

      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={14} color="#94A3B8" />
        <Text style={styles.locationText} numberOfLines={1}>
          {item.city}
        </Text>
      </View>

      <View style={styles.priceRow}>
        <Text style={[styles.priceText, { color: theme.secondary }]}>
          Rs. {item.rent?.toLocaleString()}
        </Text>
        <Text style={styles.perMonth}> / month</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 200,
  },
  featuredTag: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  featuredText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
  },
  favButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 20,
  },
  heartCircle: {
    backgroundColor: "#FFFFFF",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  locationText: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "500",
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceText: {
    fontSize: 20,
    fontWeight: "800",
  },
  perMonth: {
    fontSize: 13,
    color: "#94A3B8",
  },
});
