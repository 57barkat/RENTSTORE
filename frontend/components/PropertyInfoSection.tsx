import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { FontSize } from "@/constants/Typography";
import { StatItem } from "@/components/Properties/PropertyStats";
import { Badge } from "@/components/Properties/PropertyBadge";
import { getPriceDisplay } from "@/utils/properties/formatProperties";

export default function PropertyInfoSection({
  property,
  theme,
  onNavigate,
}: any) {
  const fullAddress = property.address?.[0]
    ? `${property.address[0].street}, ${property.address[0].city}, ${property.address[0].stateTerritory}`
    : property.location;
  const priceInfo = getPriceDisplay(property);
  return (
    <View>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.tagline, { color: theme.primary }]}>
            {property.hostOption?.toUpperCase()} •{" "}
            {property.featured ? "FEATURED" : "VERIFIED"}
          </Text>
          <Text style={[styles.title, { color: theme.text }]}>
            {property.title}
          </Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={[styles.priceTag, { color: theme.secondary }]}>
            {priceInfo ? `Rs. ${priceInfo.val.toLocaleString()}` : "Price N/A"}
          </Text>
          {priceInfo && (
            <Text style={[styles.priceSub, { color: theme.muted }]}>
              /{priceInfo.label}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.locationRow}>
        <View style={styles.addressWrapper}>
          <Ionicons name="location-outline" size={18} color={theme.secondary} />
          <Text
            style={[styles.locationText, { color: theme.muted }]}
            numberOfLines={2}
          >
            {fullAddress}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onNavigate}
          style={[styles.navigateBtn, { borderColor: theme.secondary }]}
        >
          <Ionicons name="navigate-outline" size={14} color={theme.secondary} />
          <Text style={[styles.navigateBtnText, { color: theme.secondary }]}>
            Navigate
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <StatItem
          icon={
            property.capacityState?.floorLevel === 0 ? "business" : "layers"
          }
          label="Floor"
          value={
            property.capacityState?.floorLevel === 0
              ? "Ground"
              : property.capacityState?.floorLevel
          }
          theme={theme}
        />
        <StatItem
          icon="bed-outline"
          label="Beds"
          value={property.capacityState?.bedrooms}
          theme={theme}
        />
        <StatItem
          icon="water-outline"
          label="Baths"
          value={property.capacityState?.bathrooms}
          theme={theme}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.muted }]}>
          BILLS INCLUDED
        </Text>
        <View style={styles.badgeGrid}>
          {property.ALL_BILLS?.map((bill: string, i: number) => (
            <View key={i} style={[styles.chip, { borderColor: theme.border }]}>
              <MaterialCommunityIcons
                name={
                  bill === "electricity"
                    ? "flash"
                    : bill === "water"
                      ? "water"
                      : "fire"
                }
                size={14}
                color={theme.secondary}
              />
              <Text style={[styles.chipText, { color: theme.text }]}>
                {bill}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.muted }]}>
          AMENITIES
        </Text>
        <View style={styles.badgeGrid}>
          {property.amenities?.map((item: string, i: number) => (
            <Badge
              key={i}
              text={item.replace("_", " ")}
              icon="check-circle-outline"
              theme={theme}
              type="amenity"
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  tagline: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: { fontSize: FontSize.xl, fontWeight: "900" },
  priceContainer: { alignItems: "flex-end" },
  priceTag: { fontSize: FontSize.xl, fontWeight: "900" },
  priceSub: { fontSize: 10 },
  locationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  addressWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 20,
  },
  locationText: { fontSize: 12, marginLeft: 4, fontWeight: "500" },
  navigateBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  navigateBtnText: { fontSize: 12, fontWeight: "700" },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 10,
    letterSpacing: 1,
  },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    gap: 6,
  },
  chipText: { fontSize: 12, fontWeight: "600" },
});
