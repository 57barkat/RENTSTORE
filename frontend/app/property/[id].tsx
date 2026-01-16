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
  Platform,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFindPropertyByIdQuery } from "@/services/api";
import ImageCarousel from "@/utils/Carousel";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contextStore/ThemeContext";
import {
  MaterialCommunityIcons,
  MaterialIcons,
  Feather,
} from "@expo/vector-icons";
import { useCreateRoomMutation } from "@/hooks/chat";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const options = { headerShown: false };

export default function PropertyDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const currentTheme = Colors[theme];
  const { data: property, isLoading } = useFindPropertyByIdQuery(id);
  console.log("Property ID:", property);
  const window = useWindowDimensions();
  const router = useRouter();
  const [createRoom] = useCreateRoomMutation();

  const handleChatOwner = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      const ownerId = property?.ownerId;

      if (!userId || !ownerId) {
        console.warn("Cannot create chat: missing participants");
        return;
      }

      // Make sure participants array is unique
      const participants = Array.from(new Set([userId, ownerId]));

      // Create or get room
      const room: { _id: string } = await createRoom({ participants }).unwrap();
      router.push({
        pathname: "/chat/[roomId]",
        params: { roomId: room._id, otherUserId: ownerId },
      });
    } catch (err: any) {
      console.error("Chat creation error:", err?.message || err);
    }
  };

  const getResponsiveSizes = () => {
    const isSmallPhone = window.width < 375;
    const isTablet = window.width >= 768;
    const baseFontSize = window.width * 0.04;

    return {
      containerPadding: isTablet ? window.width * 0.08 : 20,
      titleFontSize: baseFontSize * (isSmallPhone ? 1.4 : 1.6),
      carouselHeight: isTablet ? window.height * 0.45 : window.height * 0.38,
    };
  };

  const sizes = getResponsiveSizes();

  const dynamicStyles = getDynamicStyles(window, sizes, currentTheme);

  const handleMapRedirect = () => {
    if (property?.lat && property?.lng) {
      const scheme = Platform.select({
        ios: "maps:0,0?q=",
        android: "geo:0,0?q=",
      });
      const latLng = `${property.lat},${property.lng}`;
      const label = property.title;
      const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`,
      });
      if (url) Linking.openURL(url);
    }
  };

  if (isLoading || !property) {
    return (
      <View
        style={[
          dynamicStyles.center,
          { backgroundColor: currentTheme.background },
        ]}
      >
        <Text style={{ color: currentTheme.muted }}>
          {isLoading ? "Loading Property..." : "Property not found"}
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
    amenities,
    capacityState,
    description,
    photos,
  } = property;

  const renderCapacity = (
    label: string,
    value: number | string | undefined,
    icon: any
  ) => (
    <View style={dynamicStyles.capacityItem}>
      <View style={dynamicStyles.capacityCircle}>
        <MaterialCommunityIcons
          name={icon}
          size={22}
          color={currentTheme.primary}
        />
      </View>
      <Text style={[dynamicStyles.capacityValue, { color: currentTheme.text }]}>
        {value ?? "-"}
      </Text>
      <Text
        style={[dynamicStyles.capacityLabel, { color: currentTheme.muted }]}
      >
        {label}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={dynamicStyles.safeArea}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={{ height: sizes.carouselHeight }}>
          {photos?.length ? (
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
                size={48}
                color={currentTheme.muted}
              />
            </View>
          )}
        </View>

        <View style={dynamicStyles.detailsBox}>
          <View style={dynamicStyles.handle} />
          <Text style={[dynamicStyles.title, { color: currentTheme.text }]}>
            {title}
          </Text>

          <TouchableOpacity
            onPress={handleMapRedirect}
            style={dynamicStyles.locationRow}
          >
            <MaterialIcons
              name="location-on"
              size={16}
              color={currentTheme.primary}
            />
            <Text
              style={[
                dynamicStyles.locationText,
                { color: currentTheme.muted },
              ]}
            >
              {location}
            </Text>
            <Text style={dynamicStyles.mapLinkText}>View Map</Text>
          </TouchableOpacity>

          <View style={dynamicStyles.card}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[
                { value: monthlyRent, label: "/month" },
                { value: weeklyRent, label: "/week" },
                { value: dailyRent, label: "/day" },
              ].map((item, i) => (
                <View key={i} style={dynamicStyles.priceItem}>
                  <Text
                    style={[
                      dynamicStyles.priceValue,
                      {
                        color:
                          i === 0 ? currentTheme.primary : currentTheme.text,
                      },
                    ]}
                  >
                    {item.value}
                  </Text>
                  <Text
                    style={[
                      dynamicStyles.priceLabel,
                      { color: currentTheme.muted },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {i < 2 && <View style={dynamicStyles.priceDivider} />}
                </View>
              ))}
            </ScrollView>
            <Text
              style={[dynamicStyles.depositText, { color: currentTheme.muted }]}
            >
              Security Deposit:{" "}
              <Text style={{ color: currentTheme.text, fontWeight: "600" }}>
                {SecuritybasePrice}
              </Text>
            </Text>
          </View>

          <View style={dynamicStyles.capacityRow}>
            {renderCapacity(
              "Guests",
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

          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionHeader}>About this space</Text>
            <Text
              style={[dynamicStyles.infoText, { color: currentTheme.text }]}
            >
              {description?.overview || "No description available."}
            </Text>
          </View>

          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionHeader}>Amenities</Text>
            <View style={dynamicStyles.badgeContainer}>
              {amenities?.map((item: string, i: number) => (
                <View
                  key={i}
                  style={[
                    dynamicStyles.badge,
                    { backgroundColor: currentTheme.card },
                  ]}
                >
                  <Feather
                    name="check"
                    size={12}
                    color={currentTheme.primary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      dynamicStyles.badgeText,
                      { color: currentTheme.text },
                    ]}
                  >
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionHeader}>Bills Included</Text>
            <View style={dynamicStyles.badgeContainer}>
              {ALL_BILLS?.map((bill: string, i: number) => (
                <View
                  key={i}
                  style={[
                    dynamicStyles.badge,
                    { backgroundColor: currentTheme.primary + "10" },
                  ]}
                >
                  <Feather
                    name="zap"
                    size={12}
                    color={currentTheme.primary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      dynamicStyles.badgeText,
                      { color: currentTheme.primary },
                    ]}
                  >
                    {bill}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          dynamicStyles.footer,
          {
            backgroundColor: currentTheme.background,
            borderTopColor: currentTheme.border,
          },
        ]}
      >
        <View>
          <Text
            style={[dynamicStyles.footerPrice, { color: currentTheme.text }]}
          >
            {monthlyRent}
          </Text>
          <Text style={{ color: currentTheme.muted, fontSize: 12 }}>
            Total per month
          </Text>
        </View>
        <TouchableOpacity
          style={[
            dynamicStyles.bookButton,
            { backgroundColor: currentTheme.primary },
          ]}
          onPress={handleChatOwner}
        >
          <Text style={dynamicStyles.bookButtonText}>Chat Owner</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function getDynamicStyles(window: any, sizes: any, currentTheme: any) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: currentTheme.background },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    noImage: { flex: 1, justifyContent: "center", alignItems: "center" },
    handle: {
      width: 40,
      height: 5,
      backgroundColor: currentTheme.border,
      borderRadius: 10,
      alignSelf: "center",
      marginBottom: 20,
    },
    detailsBox: {
      marginTop: -30,
      backgroundColor: currentTheme.background,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      paddingHorizontal: sizes.containerPadding,
      paddingTop: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "800",
      letterSpacing: -0.5,
      marginBottom: 8,
    },
    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
    },
    locationText: { fontSize: 14, marginLeft: 4, flex: 1 },
    mapLinkText: {
      color: currentTheme.primary,
      fontWeight: "700",
      fontSize: 14,
    },
    card: {
      backgroundColor: currentTheme.card,
      borderRadius: 20,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: currentTheme.border,
    },
    priceItem: { paddingRight: 20, flexDirection: "row", alignItems: "center" },
    priceValue: { fontSize: 18, fontWeight: "800" },
    priceLabel: { fontSize: 12 },
    priceDivider: {
      width: 1,
      height: "100%",
      backgroundColor: currentTheme.border,
      marginHorizontal: 10,
    },
    depositText: {
      marginTop: 15,
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor: currentTheme.border,
      fontSize: 13,
    },
    capacityRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 32,
    },
    capacityItem: { alignItems: "center", flex: 1 },
    capacityCircle: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: currentTheme.primary + "15",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
    },
    capacityValue: { fontWeight: "700", fontSize: 15 },
    capacityLabel: { fontSize: 12 },
    section: { marginBottom: 24 },
    sectionHeader: {
      fontSize: 18,
      fontWeight: "700",
      color: currentTheme.text,
      marginBottom: 12,
    },
    infoText: { fontSize: 15, lineHeight: 24, opacity: 0.9 },
    badgeContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
    },
    badgeText: { fontSize: 13, fontWeight: "600" },
    footer: {
      position: "absolute",
      bottom: 0,
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 15,
      paddingBottom: Platform.OS === "ios" ? 35 : 20,
      borderTopWidth: 1,
    },
    footerPrice: { fontSize: 20, fontWeight: "800" },
    bookButton: {
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 16,
    },
    bookButtonText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
  });
}
