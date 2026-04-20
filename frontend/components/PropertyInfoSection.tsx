import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
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
  const { width } = useWindowDimensions();

  // Dynamic sizing logic
  const isSmallDevice = width < 380;
  const fullAddress = property.address?.[0]
    ? `${property.address[0].street}, ${property.address[0].city}, ${property.address[0].stateTerritory}`
    : property.location;

  const priceInfo = getPriceDisplay(property);

  return (
    <View style={styles.container}>
      {/* HEADER SECTION: Title & Price */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrapper}>
          <Text style={[styles.tagline, { color: theme.primary }]}>
            {property.hostOption?.toUpperCase()} •{" "}
            {property.featured ? "FEATURED" : "VERIFIED"}
          </Text>
          <Text
            style={[
              styles.title,
              { color: theme.text, fontSize: isSmallDevice ? 18 : FontSize.xl },
            ]}
          >
            {property.title}
          </Text>
        </View>
        <View style={styles.priceContainer}>
          <Text
            style={[
              styles.priceTag,
              {
                color: theme.secondary,
                fontSize: isSmallDevice ? 18 : FontSize.xl,
              },
            ]}
          >
            {priceInfo ? `Rs. ${priceInfo.val.toLocaleString()}` : "Price N/A"}
          </Text>
          {priceInfo && (
            <Text style={[styles.priceSub, { color: theme.muted }]}>
              /{priceInfo.label}
            </Text>
          )}
        </View>
      </View>

      {/* LOCATION SECTION */}
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
        <View
          style={[
            styles.statWrapper,
            { backgroundColor: theme.background, borderColor: theme.border },
          ]}
        >
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
        </View>
        <View
          style={[
            styles.statWrapper,
            { backgroundColor: theme.background, borderColor: theme.border },
          ]}
        >
          <StatItem
            icon="bed-outline"
            label="Beds"
            value={property.capacityState?.bedrooms}
            theme={theme}
          />
        </View>
        <View
          style={[
            styles.statWrapper,
            { backgroundColor: theme.background, borderColor: theme.border },
          ]}
        >
          <StatItem
            icon="water-outline"
            label="Baths"
            value={property.capacityState?.bathrooms}
            theme={theme}
          />
        </View>
        <View
          style={[
            styles.statWrapper,
            { backgroundColor: theme.background, borderColor: theme.border },
          ]}
        >
          <StatItem
            icon="expand-outline"
            label={property.size?.unit || "Size"}
            value={property.size?.value}
            theme={theme}
          />
        </View>
      </View>

      {/* BILLS SECTION */}
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

      {/* AMENITIES SECTION */}
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
  container: {
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
    gap: 10,
  },
  titleWrapper: {
    flex: 1,
  },
  tagline: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontWeight: "900",
  },
  priceContainer: {
    alignItems: "flex-end",
    minWidth: "30%",
  },
  priceTag: {
    fontWeight: "900",
  },
  priceSub: {
    fontSize: 10,
  },
  locationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
    gap: 12,
  },
  addressWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  locationText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "500",
    flexShrink: 1,
  },
  navigateBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  navigateBtnText: { fontSize: 11, fontWeight: "700" },

  // 2x2 Grid Styling
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12, // Vertical space between rows
    marginBottom: 25,
  },
  statWrapper: {
    width: "48%", // Forces 2 columns
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },

  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 10,
    letterSpacing: 1,
  },
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
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
