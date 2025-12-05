import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  useWindowDimensions,
  SafeAreaView,
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

export const options = { headerShown: false };

export default function PropertyDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  console.log(id);
  const { theme } = useTheme();
  const currentTheme = Colors[theme];
  const { data: property, isLoading } = useFindPropertyByIdQuery(id);
  const window = useWindowDimensions();

  const getResponsiveSizes = () => {
    const isSmallPhone = window.width < 375;
    const isMediumPhone = window.width >= 375 && window.width < 768;
    const isTablet = window.width >= 768;

    const baseFontSize = window.width * 0.04;

    return {
      isSmallPhone,
      isMediumPhone,
      isTablet,
      containerPadding: isTablet ? window.width * 0.08 : window.width * 0.04,
      titleFontSize:
        baseFontSize * (isSmallPhone ? 1.5 : isMediumPhone ? 1.7 : 1.9),
      sectionTitleSize:
        baseFontSize * (isSmallPhone ? 1.1 : isMediumPhone ? 1.2 : 1.25),
      bodyFontSize: baseFontSize,
      smallFontSize:
        baseFontSize * (isSmallPhone ? 0.85 : isMediumPhone ? 0.9 : 1),
      iconSize: baseFontSize * (isSmallPhone ? 1 : isMediumPhone ? 1.1 : 1.2),
      largeIconSize:
        baseFontSize * (isSmallPhone ? 1.5 : isMediumPhone ? 1.7 : 2),
      cardPadding: isSmallPhone ? 12 : isMediumPhone ? 16 : 20,
      carouselHeight: isTablet
        ? window.height * 0.4
        : isMediumPhone
        ? window.height * 0.35
        : window.height * 0.32,
      capacityItemWidth: isTablet ? window.width / 4.5 : window.width / 3.5,
      capacityCircleSize: isSmallPhone
        ? window.width * 0.1
        : isMediumPhone
        ? window.width * 0.12
        : window.width * 0.14,
      marginBottom: isSmallPhone ? 16 : isMediumPhone ? 20 : 24,
      gapSmall: isSmallPhone ? 4 : isMediumPhone ? 6 : 8,
      gapMedium: isSmallPhone ? 8 : isMediumPhone ? 12 : 16,
    };
  };

  const sizes = getResponsiveSizes();
  const dynamicStyles = getDynamicStyles(window, sizes, currentTheme);

  if (isLoading) {
    return (
      <View
        style={[
          dynamicStyles.center,
          { backgroundColor: currentTheme.background },
        ]}
      >
        <Text
          style={{ color: currentTheme.muted, fontSize: sizes.bodyFontSize }}
        >
          Loading Property Details...
        </Text>
      </View>
    );
  }

  if (!property) {
    return (
      <View
        style={[
          dynamicStyles.center,
          { backgroundColor: currentTheme.background },
        ]}
      >
        <Text
          style={{ color: currentTheme.muted, fontSize: sizes.bodyFontSize }}
        >
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
    <View
      style={[dynamicStyles.capacityItem, { width: sizes.capacityItemWidth }]}
    >
      <View
        style={[
          dynamicStyles.capacityCircle,
          {
            backgroundColor: currentTheme.tint,
            width: sizes.capacityCircleSize,
            height: sizes.capacityCircleSize,
            borderRadius: sizes.capacityCircleSize / 2,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={sizes.capacityCircleSize * 0.5}
          color="#fff"
        />
      </View>
      <Text
        style={[
          dynamicStyles.capacityValue,
          { color: currentTheme.text, fontSize: sizes.smallFontSize },
        ]}
      >
        {value ?? "N/A"}
      </Text>
      <Text
        style={[
          dynamicStyles.capacityLabel,
          { color: currentTheme.muted, fontSize: sizes.smallFontSize * 0.9 },
        ]}
      >
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
        <Text
          style={[
            dynamicStyles.infoText,
            { color: currentTheme.muted, fontSize: sizes.bodyFontSize },
          ]}
        >
          {noDataText}
        </Text>
      );
    }
    return (
      <View style={dynamicStyles.badgesContainer}>
        {items.map((item, i) => (
          <View
            key={i}
            style={[
              dynamicStyles.badge,
              {
                backgroundColor: currentTheme.card,
                maxWidth: sizes.isTablet
                  ? window.width * 0.35
                  : window.width * 0.45,
              },
            ]}
          >
            <Feather
              name={icon}
              size={sizes.smallFontSize}
              color={currentTheme.primary}
              style={{ marginRight: sizes.gapSmall }}
            />
            <Text
              style={[
                dynamicStyles.badgeText,
                { color: currentTheme.text, fontSize: sizes.smallFontSize },
              ]}
              numberOfLines={2}
            >
              {item}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const handleMapRedirect = () => {
    if (lat && lng) {
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      Linking.openURL(url);
    }
  };

  return (
    <SafeAreaView
      style={[
        dynamicStyles.safeArea,
        { backgroundColor: currentTheme.background },
      ]}
    >
      <ScrollView
        style={[
          dynamicStyles.container,
          { backgroundColor: currentTheme.background },
        ]}
        contentContainerStyle={{
          paddingBottom: Math.max(window.height * 0.05, 20),
        }}
        showsVerticalScrollIndicator={true}
        scrollIndicatorInsets={{ right: 1 }}
      >
        {/* Image Carousel */}
        <View style={{ width: window.width, height: sizes.carouselHeight }}>
          {photos?.length > 0 ? (
            <ImageCarousel
              media={photos.map((uri: string) => ({ uri, type: "image" }))}
            />
          ) : (
            <View
              style={[
                dynamicStyles.noImage,
                { backgroundColor: currentTheme.card },
              ]}
            >
              <MaterialCommunityIcons
                name="image-off-outline"
                size={sizes.largeIconSize}
                color={currentTheme.muted}
              />
              <Text
                style={[
                  dynamicStyles.noImageText,
                  {
                    color: currentTheme.muted,
                    fontSize: sizes.bodyFontSize,
                    marginTop: sizes.gapSmall,
                  },
                ]}
              >
                No Photos Available
              </Text>
            </View>
          )}
        </View>

        {/* Details */}
        <View
          style={[
            dynamicStyles.detailsBox,
            { paddingHorizontal: sizes.containerPadding },
          ]}
        >
          <Text
            style={[
              dynamicStyles.title,
              { color: currentTheme.text, fontSize: sizes.titleFontSize },
            ]}
          >
            {title}
          </Text>

          {/* Fixed Location + Map Row */}
          <View style={dynamicStyles.subInfoRow}>
            <View style={dynamicStyles.locationContainer}>
              <MaterialIcons
                name="location-on"
                size={sizes.smallFontSize}
                color={currentTheme.muted}
              />
              <Text
                style={[
                  dynamicStyles.subText,
                  {
                    color: currentTheme.muted,
                    fontSize: sizes.smallFontSize,
                    marginLeft: sizes.gapSmall,
                  },
                ]}
                numberOfLines={2}
              >
                {location}
              </Text>
            </View>
            {lat && lng && (
              <TouchableOpacity
                style={dynamicStyles.mapLink}
                onPress={handleMapRedirect}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons
                  name="map-marker-radius"
                  size={sizes.smallFontSize}
                  color={currentTheme.muted}
                />
                <Text
                  style={{
                    color: currentTheme.primary,
                    marginLeft: sizes.gapSmall,
                    fontSize: sizes.smallFontSize,
                  }}
                >
                  Map
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Rent Card */}
          <View
            style={[
              dynamicStyles.card,
              {
                backgroundColor: currentTheme.card,
                borderColor: currentTheme.border,
                padding: sizes.cardPadding,
                marginBottom: sizes.marginBottom,
              },
            ]}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              style={dynamicStyles.priceScroll}
              contentContainerStyle={{ paddingRight: sizes.containerPadding }}
            >
              {[
                { label: "/month", value: monthlyRent },
                { label: "/week", value: weeklyRent },
                { label: "/day", value: dailyRent },
              ].map((item, idx) => (
                <View
                  key={idx}
                  style={[
                    dynamicStyles.priceBox,
                    { marginRight: sizes.gapMedium },
                  ]}
                >
                  <Text
                    style={[
                      dynamicStyles.priceAmount,
                      {
                        color: currentTheme.primary,
                        fontSize: sizes.sectionTitleSize,
                      },
                    ]}
                  >
                    {item.value ?? "N/A"}
                  </Text>
                  <Text
                    style={[
                      dynamicStyles.priceLabel,
                      {
                        color: currentTheme.muted,
                        fontSize: sizes.smallFontSize,
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <Text
              style={[
                dynamicStyles.secondaryPrice,
                {
                  color: currentTheme.muted,
                  borderBottomColor: currentTheme.border,
                  fontSize: sizes.smallFontSize,
                  marginBottom: sizes.gapMedium,
                  paddingBottom: sizes.gapSmall,
                },
              ]}
            >
              {SecuritybasePrice ?? "N/A"} security deposit
            </Text>

            {/* Capacity */}
            <View
              style={[
                dynamicStyles.capacityRow,
                { marginTop: sizes.gapMedium },
              ]}
            >
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
          <View
            style={[
              dynamicStyles.sectionContainer,
              { marginBottom: sizes.marginBottom },
            ]}
          >
            <View style={dynamicStyles.sectionTitleContainer}>
              <Feather
                name="info"
                size={sizes.iconSize}
                color={currentTheme.primary}
              />
              <Text
                style={[
                  dynamicStyles.sectionTitle,
                  {
                    color: currentTheme.text,
                    fontSize: sizes.sectionTitleSize,
                    marginLeft: sizes.gapSmall,
                  },
                ]}
              >
                Property Overview
              </Text>
            </View>
            <Text
              style={[
                dynamicStyles.infoText,
                {
                  color: currentTheme.text,
                  fontSize: sizes.bodyFontSize,
                  marginVertical: sizes.gapSmall,
                },
              ]}
            >
              {description?.overview || "A wonderful place to stay!"}
            </Text>
            <Text
              style={[
                dynamicStyles.subsectionTitle,
                {
                  color: currentTheme.text,
                  fontSize: sizes.sectionTitleSize * 0.9,
                  marginTop: sizes.gapMedium,
                  marginBottom: sizes.gapSmall,
                },
              ]}
            >
              Highlights
            </Text>
            {renderList(
              description?.highlighted,
              "No highlights listed.",
              "star"
            )}
          </View>

          {/* Amenities */}
          <View
            style={[
              dynamicStyles.sectionContainer,
              { marginBottom: sizes.marginBottom },
            ]}
          >
            <View style={dynamicStyles.sectionTitleContainer}>
              <Feather
                name="grid"
                size={sizes.iconSize}
                color={currentTheme.primary}
              />
              <Text
                style={[
                  dynamicStyles.sectionTitle,
                  {
                    color: currentTheme.text,
                    fontSize: sizes.sectionTitleSize,
                    marginLeft: sizes.gapSmall,
                  },
                ]}
              >
                Amenities
              </Text>
            </View>
            {renderList(amenities, "No amenities listed.", "check-circle")}
          </View>

          {/* Included Bills */}
          <View
            style={[
              dynamicStyles.sectionContainer,
              { marginBottom: sizes.marginBottom },
            ]}
          >
            <View style={dynamicStyles.sectionTitleContainer}>
              <Feather
                name="file-text"
                size={sizes.iconSize}
                color={currentTheme.primary}
              />
              <Text
                style={[
                  dynamicStyles.sectionTitle,
                  {
                    color: currentTheme.text,
                    fontSize: sizes.sectionTitleSize,
                    marginLeft: sizes.gapSmall,
                  },
                ]}
              >
                Included Bills
              </Text>
            </View>
            {renderList(ALL_BILLS, "No bills information provided.", "droplet")}
          </View>

          {/* Full Address */}
          <View
            style={[
              dynamicStyles.sectionContainer,
              { marginBottom: sizes.marginBottom },
            ]}
          >
            <View style={dynamicStyles.sectionTitleContainer}>
              <Feather
                name="map-pin"
                size={sizes.iconSize}
                color={currentTheme.primary}
              />
              <Text
                style={[
                  dynamicStyles.sectionTitle,
                  {
                    color: currentTheme.text,
                    fontSize: sizes.sectionTitleSize,
                    marginLeft: sizes.gapSmall,
                  },
                ]}
              >
                Full Address
              </Text>
            </View>
            {address?.length > 0 ? (
              address.map((a: any, i: number) => (
                <View
                  key={i}
                  style={[
                    dynamicStyles.addressBlock,
                    {
                      backgroundColor: currentTheme.card,
                      padding: sizes.cardPadding,
                      marginBottom: sizes.gapSmall,
                    },
                  ]}
                >
                  <Text
                    style={[
                      dynamicStyles.infoText,
                      {
                        color: currentTheme.text,
                        fontSize: sizes.bodyFontSize,
                      },
                    ]}
                  >
                    {a.street}, {a.city}, {a.stateTerritory}
                  </Text>
                  <Text
                    style={[
                      dynamicStyles.infoText,
                      {
                        color: currentTheme.text,
                        fontSize: sizes.bodyFontSize,
                        marginTop: sizes.gapSmall,
                      },
                    ]}
                  >
                    {a.country} - {a.zipCode}
                  </Text>
                  {a.aptSuiteUnit && (
                    <Text
                      style={[
                        dynamicStyles.infoText,
                        {
                          color: currentTheme.muted,
                          fontSize: sizes.smallFontSize,
                          marginTop: sizes.gapSmall,
                        },
                      ]}
                    >
                      Apt/Suite: {a.aptSuiteUnit}
                    </Text>
                  )}
                </View>
              ))
            ) : (
              <Text
                style={[
                  dynamicStyles.infoText,
                  { color: currentTheme.muted, fontSize: sizes.bodyFontSize },
                ]}
              >
                Address details are not fully listed.
              </Text>
            )}
          </View>

          {/* Safety & Security */}
          <View
            style={[
              dynamicStyles.sectionContainer,
              { marginBottom: sizes.marginBottom },
            ]}
          >
            <View style={dynamicStyles.sectionTitleContainer}>
              <Feather
                name="shield"
                size={sizes.iconSize}
                color={currentTheme.primary}
              />
              <Text
                style={[
                  dynamicStyles.sectionTitle,
                  {
                    color: currentTheme.text,
                    fontSize: sizes.sectionTitleSize,
                    marginLeft: sizes.gapSmall,
                  },
                ]}
              >
                Safety & Security
              </Text>
            </View>
            {renderList(
              safetyDetailsData?.safetyDetails,
              "No safety features listed.",
              "alert-triangle"
            )}
            {safetyDetailsData?.cameraDescription && (
              <View
                style={[
                  dynamicStyles.cameraInfoContainer,
                  { marginTop: sizes.gapMedium },
                ]}
              >
                <MaterialCommunityIcons
                  name="cctv"
                  size={sizes.smallFontSize}
                  color={currentTheme.primary}
                  style={{ marginRight: sizes.gapSmall }}
                />
                <Text
                  style={[
                    dynamicStyles.cameraInfo,
                    {
                      color: currentTheme.text,
                      fontSize: sizes.smallFontSize,
                      flex: 1,
                    },
                  ]}
                >
                  {safetyDetailsData.cameraDescription}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getDynamicStyles(window: any, sizes: any, currentTheme: any) {
  return StyleSheet.create({
    safeArea: { flex: 1 },
    container: { flex: 1 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    detailsBox: { paddingTop: sizes.cardPadding },
    title: {
      fontWeight: "700",
      marginBottom: sizes.gapSmall,
      letterSpacing: 0.5,
    },
    subInfoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: sizes.marginBottom,
      gap: sizes.gapSmall,
    },
    locationContainer: { flex: 1, flexDirection: "row", alignItems: "center" },
    subText: { fontWeight: "400", opacity: 0.9 },
    mapLink: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: sizes.gapSmall / 2,
      paddingHorizontal: sizes.gapSmall,
      borderRadius: 8,
    },
    card: {
      borderRadius: 20,
      borderWidth: 1,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    priceScroll: { marginBottom: sizes.gapMedium },
    priceBox: {
      alignItems: "center",
      minWidth: window.width * 0.22,
      flexShrink: 1,
    },
    priceAmount: { fontWeight: "700", letterSpacing: 0.5 },
    priceLabel: { fontWeight: "500", marginTop: sizes.gapSmall },
    secondaryPrice: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      fontStyle: "italic",
    },
    capacityRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    capacityItem: { alignItems: "center" },
    capacityCircle: {
      justifyContent: "center",
      alignItems: "center",
      marginBottom: sizes.gapSmall,
    },
    capacityValue: { fontWeight: "600", marginTop: sizes.gapSmall },
    capacityLabel: { textAlign: "center", marginTop: 2 },
    sectionContainer: { paddingVertical: sizes.gapSmall },
    sectionTitleContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: sizes.gapMedium,
    },
    sectionTitle: { fontWeight: "700", letterSpacing: 0.5 },
    subsectionTitle: { fontWeight: "600" },
    infoText: { letterSpacing: 0.3 },
    badgesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: sizes.gapSmall,
      marginTop: sizes.gapSmall,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: sizes.gapMedium,
      paddingVertical: sizes.gapSmall,
      borderRadius: 20,
      marginBottom: sizes.gapSmall,
      minHeight: 44,
      flexShrink: 1,
    },
    badgeText: { flexShrink: 1, fontWeight: "500" },
    addressBlock: { borderRadius: 12 },
    cameraInfoContainer: { flexDirection: "row", alignItems: "flex-start" },
    cameraInfo: { fontStyle: "italic", fontWeight: "500" },
    noImage: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 12,
      margin: sizes.containerPadding,
    },
    noImageText: { marginTop: sizes.gapSmall, fontWeight: "500" },
  });
}
