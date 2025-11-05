import React, { JSX, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useFindPropertyByIdQuery } from "@/services/api";
import ImageCarousel from "@/utils/Carousel";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contextStore/ThemeContext";
import {
  MaterialCommunityIcons,
  MaterialIcons,
  Feather,
} from "@expo/vector-icons";

const { width } = Dimensions.get("window");
export const options = { headerShown: false };

// ✅ Types — aligned with your backend DTO
interface AddressDto {
  city?: string;
  area?: string;
  block?: string;
  street?: string;
  fullAddress?: string;
  _id?: string;
}

interface CapacityDto {
  persons?: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  _id?: string;
}

interface DescriptionDto {
  highlights?: string[];
  details?: string;
  _id?: string;
}

interface RentRateDto {
  type: "daily" | "weekly" | "monthly";
  amount: number;
  _id?: string;
}

interface Property {
  _id: string;
  title: string;
  propertyType?: string;
  subType?: string;
  location?: AddressDto;
  rentRates?: RentRateDto[];
  securityDeposit?: number;
  billsIncluded?: string[];
  capacity?: CapacityDto;
  amenities?: string[];
  safetyFeatures?: string[];
  rules?: string[];
  description?: DescriptionDto;
  photos?: string[];
  ownerId?: string;
  isFav?: boolean;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
  views?: number;
}

// ✅ Component
export default function PropertyDetails(): JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const currentTheme = Colors[theme];
  const { data: property, isLoading } = useFindPropertyByIdQuery(id);

  useEffect(() => {
    if (property) console.log("Property Data:", property);
  }, [property]);

  if (isLoading) {
    return (
      <View
        style={[styles.center, { backgroundColor: currentTheme.background }]}
      >
        <ActivityIndicator size="large" color={currentTheme.primary} />
        <Text style={{ color: currentTheme.muted, marginTop: 10 }}>
          Loading Property Details...
        </Text>
      </View>
    );
  }

  if (!property) {
    return (
      <View
        style={[styles.center, { backgroundColor: currentTheme.background }]}
      >
        <Text style={{ color: currentTheme.muted }}>
          Sorry, no property details were found.
        </Text>
      </View>
    );
  }

  const {
    title,
    propertyType,
    subType,
    location,
    rentRates,
    securityDeposit,
    billsIncluded,
    capacity,
    amenities,
    safetyFeatures,
    rules,
    description,
    photos,
    views,
  } = property as Property;

  const rentRate = rentRates && rentRates.length > 0 ? rentRates[0] : null;

  // ✅ Helper: render Capacity Icons
  const renderCapacity = (
    label: string,
    value: number | undefined,
    icon: keyof typeof MaterialCommunityIcons.glyphMap
  ) => (
    <View style={styles.capacityItem}>
      <View
        style={[styles.capacityCircle, { backgroundColor: currentTheme.tint }]}
      >
        <MaterialCommunityIcons name={icon} size={28} color="#fff" />
      </View>
      <Text style={[styles.capacityValue, { color: currentTheme.text }]}>
        {value ?? "N/A"}
      </Text>
      <Text style={[styles.capacityLabel, { color: currentTheme.muted }]}>
        {label}
      </Text>
    </View>
  );

  // ✅ Helper: render List with icons
  const renderList = (
    items: string[] | undefined,
    noDataText: string,
    icon: keyof typeof Feather.glyphMap
  ) => {
    if (!items || items.length === 0) {
      return (
        <Text style={[styles.infoText, { color: currentTheme.muted }]}>
          {noDataText}
        </Text>
      );
    }
    return (
      <View style={styles.listContainer}>
        {items.map((item, i) => (
          <View
            key={i}
            style={[styles.listItem, { backgroundColor: currentTheme.card }]}
          >
            <Feather
              name={icon}
              size={16}
              color={currentTheme.primary}
              style={styles.listIcon}
            />
            <Text style={[styles.infoText, { color: currentTheme.text }]}>
              {item.replace(/_/g, " ")}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  // ✅ Safe Address rendering
  const fullAddress =
    location?.fullAddress ||
    [location?.street, location?.area, location?.city]
      .filter(Boolean)
      .join(", ") ||
    "Address not available";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* 🖼 Images */}
      <View style={styles.imageContainer}>
        {photos?.length ? (
          <ImageCarousel
            media={photos.map((uri) => ({ uri, type: "image" }))}
          />
        ) : (
          <View
            style={[styles.noImage, { backgroundColor: currentTheme.card }]}
          >
            <MaterialCommunityIcons
              name="image-off-outline"
              size={60}
              color={currentTheme.muted}
            />
            <Text style={[styles.noImageText, { color: currentTheme.muted }]}>
              No Photos Available
            </Text>
          </View>
        )}
      </View>

      {/* 🏠 Details */}
      <View style={styles.detailsBox}>
        <Text style={[styles.title, { color: currentTheme.text }]}>
          {title}
        </Text>

        <View style={styles.subInfoRow}>
          <Text style={[styles.subText, { color: currentTheme.muted }]}>
            <MaterialIcons
              name="location-on"
              size={16}
              color={currentTheme.muted}
            />{" "}
            {fullAddress}
          </Text>
          {views !== undefined && (
            <Text style={[styles.subText, { color: currentTheme.muted }]}>
              <MaterialCommunityIcons
                name="eye-outline"
                size={16}
                color={currentTheme.muted}
              />{" "}
              {/* {views} Views */}
            </Text>
          )}
        </View>

        {/* 💰 Rent Info */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: currentTheme.card,
              borderColor: currentTheme.border,
            },
          ]}
        >
          {property?.rentRates && property.rentRates.length > 0 ? (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
                marginVertical: 6,
              }}
            >
              {property.rentRates.map((rate: any) => (
                <View
                  key={rate._id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: currentTheme.card,
                    borderRadius: 20,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    marginRight: 8,
                    marginBottom: 8,
                    shadowColor: "#000",
                    shadowOpacity: 0.1,
                    shadowOffset: { width: 0, height: 2 },
                    shadowRadius: 3,
                    elevation: 2,
                  }}
                >
                  <Text
                    style={[
                      styles.priceTag,
                      {
                        color: currentTheme.primary,
                        fontWeight: "600",
                        fontSize: 16,
                      },
                    ]}
                  >
                    {rate.amount}
                  </Text>
                  <Text
                    style={[
                      styles.priceDuration,
                      {
                        color: currentTheme.muted,
                        marginLeft: 4,
                        fontSize: 14,
                      },
                    ]}
                  >
                    / {rate.type}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.infoText, { color: currentTheme.muted }]}>
              Rent rates not available
            </Text>
          )}

          {securityDeposit && (
            <Text
              style={[
                styles.secondaryPrice,
                {
                  color: currentTheme.muted,
                  borderBottomColor: currentTheme.border,
                },
              ]}
            >
              Security Deposit: {securityDeposit}
            </Text>
          )}
          <View style={styles.capacityRow}>
            {renderCapacity("Bedrooms", capacity?.bedrooms, "bed-outline")}
            {renderCapacity("Beds", capacity?.beds, "key")}
            {renderCapacity("Baths", capacity?.bathrooms, "bathtub-outline")}
            {renderCapacity("Guests", capacity?.persons, "account-outline")}
          </View>
        </View>

        {/* 📋 Overview */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            <Feather name="info" size={20} color={currentTheme.primary} />{" "}
            Property Overview
          </Text>
          <Text style={[styles.infoText, { color: currentTheme.text }]}>
            {description?.details || "A wonderful place to stay!"}
          </Text>
          <Text style={[styles.subsectionTitle, { color: currentTheme.text }]}>
            Highlights
          </Text>
          {renderList(description?.highlights, "No highlights listed.", "star")}
        </View>

        {/* 🧺 Amenities */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            <Feather name="grid" size={20} color={currentTheme.primary} />{" "}
            Amenities
          </Text>
          {renderList(amenities, "No amenities listed.", "check-circle")}
        </View>

        {/* 💧 Bills */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            <Feather name="file-text" size={20} color={currentTheme.primary} />{" "}
            Included Bills
          </Text>
          {renderList(billsIncluded, "No bills included.", "droplet")}
        </View>

        {/* ⚠️ Rules */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            <Feather name="slash" size={20} color={currentTheme.primary} />{" "}
            Rules
          </Text>
          {renderList(rules, "No rules provided.", "x-circle")}
        </View>

        {/* 🛡 Safety */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            <Feather name="shield" size={20} color={currentTheme.primary} />{" "}
            Safety & Security
          </Text>
          {renderList(
            safetyFeatures,
            "No safety features listed.",
            "alert-triangle"
          )}
        </View>
      </View>
    </ScrollView>
  );
}

// ✅ Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingBottom: 30 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  imageContainer: { width: width, height: width * 0.7 },
  noImage: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    margin: 16,
  },
  noImageText: { marginTop: 8, fontSize: 16, fontWeight: "500" },
  detailsBox: { paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 4 },
  subInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  subText: { fontSize: 14, fontWeight: "400", flex: 1 },
  card: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 4,
  },
  priceTag: { fontSize: 32, fontWeight: "bold" },
  priceDuration: { fontSize: 18, marginLeft: 4 },
  secondaryPrice: {
    fontSize: 14,
    marginBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 12,
  },
  capacityRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  capacityItem: { alignItems: "center", flex: 1 },
  capacityCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  capacityValue: { fontSize: 20, fontWeight: "600", marginTop: 4 },
  capacityLabel: { fontSize: 12 },
  sectionContainer: { marginBottom: 20, paddingVertical: 8 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: { fontSize: 16, lineHeight: 24 },
  listContainer: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  listIcon: { marginRight: 6 },
});
