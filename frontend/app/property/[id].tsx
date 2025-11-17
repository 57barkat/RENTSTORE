import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Linking,
  // useWindowDimensions,
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

export default function PropertyDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const currentTheme = Colors[theme];
  const { data: property, isLoading } = useFindPropertyByIdQuery(id);
  // const window = useWindowDimensions();

  if (isLoading) {
    return (
      <View
        style={[styles.center, { backgroundColor: currentTheme.background }]}
      >
        <Text style={{ color: currentTheme.muted }}>
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
    location,
    monthlyRent,
    weeklyRent,
    dailyRent,
    SecuritybasePrice,
    ALL_BILLS,
    address,
    amenities,
    capacityState,
    description,
    safetyDetailsData,
    photos,
    lat,
    lng,
  } = property;

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
      <View style={styles.badgesContainer}>
        {items.map((item, i) => (
          <View
            key={i}
            style={[styles.badge, { backgroundColor: currentTheme.card }]}
          >
            <Feather
              name={icon}
              size={14}
              color={currentTheme.primary}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.badgeText, { color: currentTheme.text }]}>
              {item}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const handleMapRedirect = () => {
    if (lat && lng) {
      const url = `https://www.google.com/maps?q=${lat},${lng}`;
      Linking.openURL(url);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Image Carousel */}
      <View style={{ width: width, height: width * 0.65 }}>
        {photos?.length > 0 ? (
          <ImageCarousel
            media={photos.map((uri: string) => ({ uri, type: "image" }))}
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

      {/* Details */}
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
            {location}
          </Text>
          {lat && lng && (
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center" }}
              onPress={handleMapRedirect}
            >
              <MaterialCommunityIcons
                name="map-marker-radius"
                size={16}
                color={currentTheme.muted}
              />
              <Text
                style={[
                  styles.subText,
                  { color: currentTheme.primary, marginLeft: 4 },
                ]}
              >
                Show on Map
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Rent Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: currentTheme.card,
              borderColor: currentTheme.border,
            },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 12 }}
          >
            {[
              { label: "/month", value: monthlyRent },
              { label: "/week", value: weeklyRent },
              { label: "/day", value: dailyRent },
            ].map((item, idx) => (
              <View key={idx} style={styles.priceBox}>
                <Text
                  style={[styles.priceAmount, { color: currentTheme.primary }]}
                >
                  {item.value ?? "N/A"}
                </Text>
                <Text
                  style={[styles.priceLabel, { color: currentTheme.muted }]}
                >
                  {item.label}
                </Text>
              </View>
            ))}
          </ScrollView>
          <Text
            style={[
              styles.secondaryPrice,
              {
                color: currentTheme.muted,
                borderBottomColor: currentTheme.border,
              },
            ]}
          >
            {SecuritybasePrice ?? "N/A"} security deposit
          </Text>

          {/* Capacity */}
          <View style={styles.capacityRow}>
            {renderCapacity(
              "Persons",
              capacityState?.Persons,
              "account-group-outline"
            )}
            {renderCapacity("Beds", capacityState?.beds, "bed-outline")}
            {renderCapacity(
              "Baths",
              capacityState?.bathrooms,
              "bathtub-outline"
            )}
          </View>
        </View>

        {/* Property Overview */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            <Feather name="info" size={20} color={currentTheme.primary} />{" "}
            Property Overview
          </Text>
          <Text style={[styles.infoText, { color: currentTheme.text }]}>
            {description?.overview || "A wonderful place to stay!"}
          </Text>
          <Text style={[styles.subsectionTitle, { color: currentTheme.text }]}>
            Highlights
          </Text>
          {renderList(
            description?.highlighted,
            "No highlights listed.",
            "star"
          )}
        </View>

        {/* Amenities */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            <Feather name="grid" size={20} color={currentTheme.primary} />{" "}
            Amenities
          </Text>
          {renderList(amenities, "No amenities listed.", "check-circle")}
        </View>

        {/* Included Bills */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            <Feather name="file-text" size={20} color={currentTheme.primary} />{" "}
            Included Bills
          </Text>
          {renderList(ALL_BILLS, "No bills information provided.", "droplet")}
        </View>

        {/* Full Address */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            <Feather name="map-pin" size={20} color={currentTheme.primary} />{" "}
            Full Address
          </Text>
          {address?.length > 0 ? (
            address.map((a: any, i: number) => (
              <View
                key={i}
                style={[
                  styles.addressBlock,
                  { backgroundColor: currentTheme.card },
                ]}
              >
                <Text style={[styles.infoText, { color: currentTheme.text }]}>
                  {a.street}, {a.city}, {a.stateTerritory}
                </Text>
                <Text style={[styles.infoText, { color: currentTheme.text }]}>
                  {a.country} - {a.zipCode}
                </Text>
                {a.aptSuiteUnit && (
                  <Text
                    style={[styles.infoText, { color: currentTheme.muted }]}
                  >
                    Apt/Suite: {a.aptSuiteUnit}
                  </Text>
                )}
              </View>
            ))
          ) : (
            <Text style={[styles.infoText, { color: currentTheme.muted }]}>
              Address details are not fully listed.
            </Text>
          )}
        </View>

        {/* Safety & Security */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            <Feather name="shield" size={20} color={currentTheme.primary} />{" "}
            Safety & Security
          </Text>
          {renderList(
            safetyDetailsData?.safetyDetails,
            "No safety features listed.",
            "alert-triangle"
          )}
          {safetyDetailsData?.cameraDescription && (
            <Text
              style={[
                styles.infoText,
                styles.cameraInfo,
                { color: currentTheme.text },
              ]}
            >
              <MaterialCommunityIcons
                name="cctv"
                size={16}
                color={currentTheme.primary}
              />{" "}
              Camera Note: {safetyDetailsData.cameraDescription}
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  detailsBox: { paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 4 },
  subInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  subText: { fontSize: 14, fontWeight: "400", opacity: 0.9 },
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
  priceBox: { marginRight: 16, alignItems: "center" },
  priceAmount: { fontSize: 28, fontWeight: "700" },
  priceLabel: { fontSize: 16, fontWeight: "500", color: "#555" },
  secondaryPrice: {
    fontSize: 14,
    marginBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 12,
  },
  capacityRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
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
  capacityLabel: { fontSize: 12, fontWeight: "400" },
  sectionContainer: { marginBottom: 20, paddingVertical: 8 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: { fontSize: 16, lineHeight: 24 },
  badgesContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  badgeText: { fontSize: 14 },
  addressBlock: { marginBottom: 8, padding: 12, borderRadius: 12 },
  cameraInfo: { fontStyle: "italic", marginTop: 10 },
  noImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    margin: 16,
  },
  noImageText: { marginTop: 8, fontSize: 16, fontWeight: "500" },
});
