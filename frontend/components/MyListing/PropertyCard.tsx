import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { FontSize } from "@/constants/Typography";
import { getPriceDisplay } from "@/utils/properties/formatProperties";

const PropertyCard = ({
  item,
  currentTheme,
  width,
  onEdit,
  onView,
  onDelete,
  onPromote,
  onToggleStatus,
  isPromoting,
  isUpdatingVisibility,
}: any): React.ReactNode => {
  const getFeaturedTimeLeft = (expiryDate: string) => {
    if (!expiryDate) return null;
    const now = new Date().getTime();
    const end = new Date(expiryDate).getTime();
    const diff = end - now;
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    return days > 0 ? `${days}d ${hours}h left` : `${hours}h left`;
  };

  const timeLeft = getFeaturedTimeLeft(item.featuredUntil);
  const priceInfo = getPriceDisplay(item);
  const previewImage = item.photos?.[0];

  const renderCapacity = (iconName: string, value: any, unit: string) => (
    <View style={styles.capacityItem}>
      <MaterialCommunityIcons
        name={iconName as any}
        size={16}
        color={currentTheme.muted}
      />
      <Text style={[styles.capacityText, { color: currentTheme.muted }]}>
        {value || "0"} {unit}
      </Text>
    </View>
  );

  const statusLabel = !item.isApproved
    ? "Pending Approval"
    : item.status
      ? "Active"
      : "Inactive";
  const statusColor = !item.isApproved
    ? "#B45309"
    : item.status
      ? currentTheme.secondary
      : "#1D4ED8";
  const statusBackground = !item.isApproved
    ? "#FFFBEB"
    : item.status
      ? currentTheme.secondary + "15"
      : "#EFF6FF";

  return (
    <Pressable
      onPress={onView}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: currentTheme.card,
          width: width - 40,
          borderColor: currentTheme.border,
          opacity: pressed ? 0.96 : 1,
        },
      ]}
    >
      <View style={styles.imageWrap}>
        {previewImage ? (
          <Image source={{ uri: previewImage }} style={styles.image} />
        ) : (
          <View
            style={[
              styles.imageFallback,
              { backgroundColor: currentTheme.background },
            ]}
          >
            <MaterialCommunityIcons
              name={
                item.hostOption === "shop"
                  ? "storefront-outline"
                  : item.hostOption === "office"
                    ? "briefcase-outline"
                    : item.hostOption === "hostel"
                      ? "bed-outline"
                      : item.hostOption === "apartment"
                        ? "office-building-outline"
                        : "home-city-outline"
              }
              size={36}
              color={currentTheme.secondary}
            />
            <Text style={[styles.imageFallbackText, { color: currentTheme.text }]}>
              {item.hostOption
                ? `${item.hostOption.charAt(0).toUpperCase()}${item.hostOption.slice(1)} preview`
                : "Property preview"}
            </Text>
          </View>
        )}

        <View style={styles.imageOverlayTop}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: statusBackground,
              },
            ]}
          >
            <View
              style={[
                styles.badgeDot,
                {
                  backgroundColor: statusColor,
                },
              ]}
            />
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>

          {item.featured && (
            <View
              style={[
                styles.featuredTag,
                { backgroundColor: currentTheme.secondary },
              ]}
            >
              <MaterialCommunityIcons name="star" size={10} color="#fff" />
              <Text style={styles.featuredTagText}>
                FEATURED {timeLeft ? `• ${timeLeft}` : ""}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, { color: currentTheme.text }]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {item.isBoosted && (
            <View style={[styles.boostBadge, { backgroundColor: "#FFF9E6" }]}>
              <MaterialCommunityIcons
                name="rocket-launch"
                size={12}
                color="#FFB800"
              />
              <Text style={styles.boostBadgeText}>BOOSTED</Text>
            </View>
          )}
        </View>

        <View style={styles.row}>
          <Feather name="map-pin" size={14} color={currentTheme.muted} />
          <Text
            style={[styles.location, { color: currentTheme.muted }]}
            numberOfLines={1}
          >
            {item.location ||
              `${item.address?.city || "N/A"}, ${item.address?.country || ""}`}
          </Text>
        </View>

        <View style={styles.capacityRow}>
          {renderCapacity(
            "office-building-marker-outline",
            item.capacityState?.floorLevel,
            "Floor",
          )}
          {renderCapacity("bed-outline", item.capacityState?.bedrooms, "Rooms")}
          {renderCapacity(
            "bathtub-outline",
            item.capacityState?.bathrooms,
            "Baths",
          )}
        </View>

        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: currentTheme.secondary }]}>
            {priceInfo
              ? `Rs. ${priceInfo.val.toLocaleString()} / ${priceInfo.label}`
              : "Price N/A"}
          </Text>
          <Text style={[styles.tapHint, { color: currentTheme.muted }]}>
            Tap card to open
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: currentTheme.info }]}
            onPress={onEdit}
          >
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>

          {!item.featured && !item.isBoosted && item.isApproved && item.status && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#EAB308" }]}
              onPress={onPromote}
              disabled={isPromoting}
            >
              {isPromoting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Promote</Text>
              )}
            </TouchableOpacity>
          )}

          {item.isApproved && (
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: item.status ? "#475569" : "#10B981" },
              ]}
              onPress={onToggleStatus}
              disabled={isUpdatingVisibility}
            >
              {isUpdatingVisibility ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {item.status ? "Deactivate" : "Activate"}
                </Text>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: currentTheme.danger }]}
            onPress={onDelete}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 22,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageWrap: {
    height: 210,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  imageFallbackText: {
    fontSize: 14,
    fontWeight: "700",
  },
  imageOverlayTop: {
    position: "absolute",
    top: 14,
    left: 14,
    right: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  cardBody: {
    padding: 18,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  boostBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: "#FFB800",
  },
  boostBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#FFB800",
  },
  featuredTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 4,
  },
  featuredTagText: { color: "#fff", fontSize: 8, fontWeight: "900" },
  title: { fontSize: FontSize.base, fontWeight: "800", flex: 1 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 6, gap: 6 },
  location: { fontSize: FontSize.sm, flex: 1 },
  capacityRow: {
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 12,
    gap: 18,
    flexWrap: "wrap",
  },
  capacityItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  capacityText: { fontSize: FontSize.xs },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  price: { fontSize: FontSize.lg, fontWeight: "900", flex: 1 },
  tapHint: {
    fontSize: 11,
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  button: {
    minWidth: "30%",
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: FontSize.xs - 1 },
});

export default PropertyCard;
