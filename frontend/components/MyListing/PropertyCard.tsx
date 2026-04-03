import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { FontSize } from "@/constants/Typography";

const PropertyCard = ({
  item,
  currentTheme,
  width,
  onEdit,
  onView,
  onDelete,
  onPromote,
  isPromoting,
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

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: currentTheme.card,
          width: width - 40,
          borderColor: currentTheme.border,
        },
      ]}
    >
      <View style={styles.statusRow}>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: item.isApproved
                ? currentTheme.secondary + "15"
                : "#FFFBEB",
            },
          ]}
        >
          <View
            style={[
              styles.badgeDot,
              {
                backgroundColor: item.isApproved
                  ? currentTheme.secondary
                  : "#F59E0B",
              },
            ]}
          />
          <Text
            style={[
              styles.badgeText,
              { color: item.isApproved ? currentTheme.secondary : "#B45309" },
            ]}
          >
            {item.isApproved ? "Live" : "Pending Approval"}
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

      <Text
        style={[styles.title, { color: currentTheme.text }]}
        numberOfLines={1}
      >
        {item.title}
      </Text>

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

      <Text style={[styles.price, { color: currentTheme.secondary }]}>
        Rs. {item.monthlyRent?.toLocaleString() || "0"} / month
      </Text>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: currentTheme.secondary }]}
          onPress={onView}
        >
          <Text style={styles.buttonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: currentTheme.info }]}
          onPress={onEdit}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        {!item.featured && item.isApproved && (
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
        <TouchableOpacity
          style={[styles.button, { backgroundColor: currentTheme.danger }]}
          onPress={onDelete}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginBottom: 22,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  featuredTag: {
    backgroundColor: "#EAB308",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  featuredTagText: { color: "#fff", fontSize: 8, fontWeight: "900" },
  title: { fontSize: FontSize.base, fontWeight: "800", marginBottom: 6 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 6, gap: 6 },
  location: { fontSize: FontSize.sm },
  capacityRow: { flexDirection: "row", marginVertical: 10, gap: 18 },
  capacityItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  capacityText: { fontSize: FontSize.xs },
  price: { fontSize: FontSize.lg, fontWeight: "900", marginBottom: 12 },
  actionsRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  button: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: FontSize.xs - 1 },
});

export default PropertyCard;
