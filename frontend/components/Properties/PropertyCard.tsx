import React from "react";
import { TouchableOpacity, View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getPriceDisplay } from "@/utils/properties/formatProperties";

export const PropertyCard = ({ item, theme, onPress, onToggleFav }: any) => {
  const isFeatured = item.featured === true || item.sortWeight === 3;
  const isBoosted = item.sortWeight === 2;
  const priceInfo = getPriceDisplay(item);
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[
        styles.card,
        {
          backgroundColor: theme.background,
          borderColor: isFeatured
            ? theme.featured
            : theme.mode === "dark"
              ? "#334155"
              : "#E8EEF3",
          borderWidth: isFeatured ? 1.5 : 1,
          elevation: isFeatured ? 8 : 4,
        },
      ]}
      onPress={() => onPress?.(item.id || item._id)}
    >
      <View style={{ position: "relative" }}>
        <Image
          source={{
            uri:
              item.image ||
              item.photos?.[0] ||
              "https://via.placeholder.com/300",
          }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.topRowOverlay}>
          {isFeatured ? (
            <View
              style={[
                styles.tag,
                styles.featuredTag,
                {
                  backgroundColor: theme.featured,
                  shadowColor: theme.featured,
                },
              ]}
            >
              <Ionicons name="flash" size={10} color="#FFF" />
              <Text style={styles.tagText}>FEATURED AD</Text>
            </View>
          ) : isBoosted ? (
            <View style={[styles.tag, { backgroundColor: theme.secondary }]}>
              <Ionicons name="rocket" size={10} color="#FFF" />
              <Text style={styles.tagText}>BOOSTED</Text>
            </View>
          ) : (
            <View />
          )}

          <TouchableOpacity
            style={styles.heartCircle}
            onPress={() => onToggleFav?.(item.id || item._id)}
          >
            <Ionicons
              name={item.isFav ? "heart" : "heart-outline"}
              size={18}
              color={item.isFav ? "#FF4D4D" : "#1E293B"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.headerInfo}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {item.title}
          </Text>

          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={12} color={theme.secondary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.location || item.city || "Islamabad"}
            </Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.priceRow}>
            <Text style={[styles.priceText, { color: theme.secondary }]}>
              {priceInfo
                ? `Rs. ${priceInfo.val.toLocaleString()}`
                : "Price N/A"}
            </Text>
            {priceInfo && (
              <Text style={styles.perMonth}>/{priceInfo.label}</Text>
            )}
          </View>

          {(isFeatured || isBoosted) && (
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={isFeatured ? theme.featured : theme.secondary}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 28,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  image: {
    width: "100%",
    height: 220,
  },
  topRowOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  featuredTag: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  tagText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heartCircle: {
    backgroundColor: "rgba(255,255,255,0.9)",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 16,
  },
  headerInfo: {
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  priceText: {
    fontSize: 18,
    fontWeight: "800",
  },
  perMonth: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
  },
});
