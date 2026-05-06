import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import AmenityChip from "@/components/PropertyDetail/AmenityChip";
import DetailStatCard from "@/components/PropertyDetail/DetailStatCard";
import PromotionBadge from "@/components/PropertyDetail/PromotionBadge";
import type { PropertyDetailData } from "@/types/PropertyDetailScreen.types";
import { formatPrice } from "@/utils/properties/formatPrice";
import { getPrimaryRentInfo } from "@/utils/properties/rent";

type ThemeColors = typeof Colors.light;

interface PropertyInfoSectionProps {
  property: PropertyDetailData;
  theme: ThemeColors;
  onNavigate: () => void;
}

const toReadableLabel = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getDisplayTitle = (property: PropertyDetailData) => {
  const explicitTitle = property.title?.trim();
  if (explicitTitle) {
    return explicitTitle;
  }

  const baseType = property.hostOption || property.category;
  if (!baseType) {
    return "Property";
  }

  return property.area
    ? `${toReadableLabel(baseType)} in ${property.area}`
    : toReadableLabel(baseType);
};

const getLocationText = (property: PropertyDetailData) => {
  if (property.addressQuery?.trim()) {
    return property.addressQuery.trim();
  }

  const candidates = [
    property.area,
    property.location,
    property.address?.[0]?.city,
  ]
    .map((value) => value?.trim())
    .filter(Boolean) as string[];

  return Array.from(new Set(candidates)).join(", ");
};

const toPositiveNumber = (value?: number) =>
  typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;

export default function PropertyInfoSection({
  property,
  theme,
  onNavigate,
}: PropertyInfoSectionProps) {
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 380;
  const primaryRent = getPrimaryRentInfo(property);
  const title = getDisplayTitle(property);
  const locationText = getLocationText(property);
  const hasCoordinates =
    typeof property.lat === "number" && typeof property.lng === "number";
  const categoryLabel = property.hostOption
    ? toReadableLabel(property.hostOption).toUpperCase()
    : property.category
      ? toReadableLabel(property.category).toUpperCase()
      : null;
  const stats = [
    toPositiveNumber(property.capacityState?.beds ?? property.capacityState?.bedrooms)
      ? {
          key: "beds",
          icon: "bed-outline" as const,
          label: "Beds",
          value: String(
            property.capacityState?.beds ?? property.capacityState?.bedrooms,
          ),
        }
      : null,
    toPositiveNumber(property.capacityState?.bathrooms)
      ? {
          key: "baths",
          icon: "water-outline" as const,
          label: "Baths",
          value: String(property.capacityState?.bathrooms),
        }
      : null,
    typeof property.capacityState?.floorLevel === "number" &&
    property.capacityState.floorLevel >= 0
      ? {
          key: "floor",
          icon: "layers-outline" as const,
          label: "Floor",
          value:
            property.capacityState.floorLevel === 0
              ? "Ground"
              : String(property.capacityState.floorLevel),
        }
      : null,
    toPositiveNumber(property.size?.value)
      ? {
          key: "size",
          icon: "expand-outline" as const,
          label: property.size?.unit ? toReadableLabel(property.size.unit) : "Size",
          value: `${property.size?.value}`,
        }
      : null,
    toPositiveNumber(property.capacityState?.Persons)
      ? {
          key: "persons",
          icon: "people-outline" as const,
          label: "Persons",
          value: String(property.capacityState?.Persons),
        }
      : null,
  ].filter(Boolean) as {
    key: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
  }[];
  const amenityItems = (property.amenities || []).map(toReadableLabel);
  const billItems = (property.ALL_BILLS || []).map(toReadableLabel);
  const shouldShowAmenities = amenityItems.length > 0 || billItems.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.headerBlock}>
        <View style={styles.metaRow}>
          <PromotionBadge property={property} theme={theme} />
          {categoryLabel ? (
            <Text style={[styles.eyebrow, { color: theme.muted }]}>
              {categoryLabel}
            </Text>
          ) : null}
        </View>
        <Text
          style={[
            styles.title,
            { color: theme.primary, fontSize: isSmallDevice ? 24 : 27 },
          ]}
        >
          {title}
        </Text>
      </View>

      {locationText ? (
        <View style={styles.locationRow}>
          <View style={styles.locationWrap}>
            <Ionicons name="location-outline" size={16} color={theme.muted} />
            <Text
              style={[styles.locationText, { color: theme.muted }]}
              numberOfLines={1}
            >
              {locationText}
            </Text>
          </View>
          {hasCoordinates ? (
            <TouchableOpacity
              onPress={onNavigate}
              style={[
                styles.navigateBtn,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.card,
                },
              ]}
            >
              <Ionicons name="navigate-outline" size={15} color={theme.primary} />
              <Text style={[styles.navigateBtnText, { color: theme.primary }]}>
                Navigate
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {stats.length > 0 ? (
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            {stats.map((stat) => (
              <DetailStatCard
                key={stat.key}
                icon={stat.icon}
                label={stat.label}
                value={stat.value}
                theme={theme}
              />
            ))}
          </View>
        </View>
      ) : null}

      {primaryRent ? (
        <View style={styles.priceBlock}>
          <View style={styles.priceRow}>
            <Text style={[styles.priceText, { color: theme.primary }]}>
              {formatPrice(primaryRent.amount, "Price")}
            </Text>
            <Text style={[styles.priceSuffix, { color: theme.muted }]}>
              /{primaryRent.label}
            </Text>
          </View>
          {property.isApproved ? (
            <View style={styles.verifiedRow}>
              <Ionicons
                name="shield-checkmark"
                size={18}
                color={theme.success}
              />
              <Text style={[styles.verifiedText, { color: theme.success }]}>
                Verified Property
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {shouldShowAmenities ? (
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>
            Amenities
          </Text>

          {amenityItems.length > 0 ? (
            <View style={styles.chipsWrap}>
              {amenityItems.map((amenity) => (
                <AmenityChip key={`amenity-${amenity}`} label={amenity} theme={theme} />
              ))}
            </View>
          ) : null}

          {billItems.length > 0 ? (
            <View style={amenityItems.length > 0 ? styles.billsSection : undefined}>
              <Text style={[styles.subsectionTitle, { color: theme.muted }]}>
                Included bills
              </Text>
              <View style={styles.chipsWrap}>
                {billItems.map((bill) => (
                  <AmenityChip
                    key={`bill-${bill}`}
                    label={bill}
                    theme={theme}
                    accentColor={theme.primary}
                  />
                ))}
              </View>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 22,
  },
  headerBlock: {
    gap: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    minHeight: 28,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  title: {
    fontWeight: "900",
    letterSpacing: -0.35,
    lineHeight: 32,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  locationWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  navigateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  navigateBtnText: {
    fontSize: 12,
    fontWeight: "800",
  },
  statsSection: {
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  priceBlock: {
    gap: 10,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    flexWrap: "wrap",
    gap: 8,
  },
  priceText: {
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -0.9,
  },
  priceSuffix: {
    fontSize: 15,
    fontWeight: "700",
    paddingBottom: 4,
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  verifiedText: {
    fontSize: 14,
    fontWeight: "700",
  },
  sectionCard: {
    borderRadius: 26,
    borderWidth: 1,
    padding: 18,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
  },
  subsectionTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  billsSection: {
    gap: 12,
  },
});
