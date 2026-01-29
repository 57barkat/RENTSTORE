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
  ActivityIndicator,
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
  Ionicons,
} from "@expo/vector-icons";
import { useCreateRoomMutation } from "@/hooks/chat";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const options = { headerShown: false };

// Helper for currency formatting
const formatPrice = (amount: number | string | undefined) => {
  if (amount === undefined || amount === null) return "N/A";
  const num = typeof amount === "string" ? parseInt(amount) : amount;
  return `Rs. ${num.toLocaleString()}`;
};

export default function PropertyDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const { data: property, isLoading } = useFindPropertyByIdQuery(id);
  const window = useWindowDimensions();
  const router = useRouter();
  const [createRoom] = useCreateRoomMutation();

  const handleChatOwner = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      const ownerId = property?.ownerId;

      if (!userId || !ownerId) {
        alert("Please login to contact the owner");
        return;
      }

      const participants = Array.from(new Set([userId, ownerId]));
      const room: any = await createRoom({ participants }).unwrap();

      router.push({
        pathname: "/chat/[roomId]",
        params: { roomId: room._id, otherUserId: ownerId },
      });
    } catch (err: any) {
      console.error("Chat Error:", err);
    }
  };

  const handleMapRedirect = () => {
    if (property?.lat && property?.lng) {
      const latLng = `${property.lat},${property.lng}`;
      const url = Platform.select({
        ios: `maps:0,0?q=${property.title}@${latLng}`,
        android: `geo:0,0?q=${latLng}(${property.title})`,
      });
      if (url) Linking.openURL(url);
    }
  };

  if (isLoading) {
    return (
      <View
        style={[styles.center, { backgroundColor: currentTheme.background }]}
      >
        <ActivityIndicator size="large" color={currentTheme.primary} />
      </View>
    );
  }

  if (!property) {
    return (
      <View
        style={[styles.center, { backgroundColor: currentTheme.background }]}
      >
        <Text style={{ color: currentTheme.text }}>Property not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />

      {/* Custom Header with Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={28} color="black" />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Top Image Section */}
        <View style={{ height: window.height * 0.4 }}>
          {property.photos?.length ? (
            <ImageCarousel
              media={property.photos.map((uri: string) => ({
                uri,
                type: "image",
              }))}
            />
          ) : (
            <View
              style={[styles.noImage, { backgroundColor: currentTheme.card }]}
            >
              <MaterialCommunityIcons
                name="image-off-outline"
                size={48}
                color={currentTheme.muted}
              />
            </View>
          )}
        </View>

        {/* Content Box */}
        <View
          style={[
            styles.detailsBox,
            { backgroundColor: currentTheme.background },
          ]}
        >
          <View
            style={[styles.handle, { backgroundColor: currentTheme.border }]}
          />

          <Text style={[styles.title, { color: currentTheme.text }]}>
            {property.title}
          </Text>

          <TouchableOpacity
            onPress={handleMapRedirect}
            style={styles.locationRow}
          >
            <Ionicons name="location" size={18} color={currentTheme.primary} />
            <Text style={[styles.locationText, { color: currentTheme.muted }]}>
              {property.location}
            </Text>
            <Text style={[styles.mapLink, { color: currentTheme.primary }]}>
              Map
            </Text>
          </TouchableOpacity>

          {/* Key Features Row */}
          <View style={styles.capacityRow}>
            <View style={styles.capItem}>
              <MaterialCommunityIcons
                name="account-group-outline"
                size={24}
                color={currentTheme.text}
              />
              <Text style={[styles.capVal, { color: currentTheme.text }]}>
                {property.capacityState?.Persons || 0}
              </Text>
              <Text style={styles.capLabel}>Guests</Text>
            </View>
            <View style={styles.capItem}>
              <MaterialCommunityIcons
                name="bed-outline"
                size={24}
                color={currentTheme.text}
              />
              <Text style={[styles.capVal, { color: currentTheme.text }]}>
                {property.capacityState?.beds || 0}
              </Text>
              <Text style={styles.capLabel}>Beds</Text>
            </View>
            <View style={styles.capItem}>
              <MaterialCommunityIcons
                name="bathtub-outline"
                size={24}
                color={currentTheme.text}
              />
              <Text style={[styles.capVal, { color: currentTheme.text }]}>
                {property.capacityState?.bathrooms || 0}
              </Text>
              <Text style={styles.capLabel}>Baths</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              Description
            </Text>
            <Text style={[styles.descText, { color: currentTheme.text }]}>
              {property.description?.overview || "No details provided."}
            </Text>
          </View>

          {/* Pricing Details Card */}
          <View
            style={[
              styles.priceCard,
              {
                backgroundColor: currentTheme.card,
                borderColor: currentTheme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                { color: currentTheme.text, marginBottom: 15 },
              ]}
            >
              Pricing Plan
            </Text>
            <View style={styles.priceRow}>
              <Text style={{ color: currentTheme.muted }}>Monthly</Text>
              <Text style={[styles.priceText, { color: currentTheme.primary }]}>
                {formatPrice(property.monthlyRent)}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={{ color: currentTheme.muted }}>Weekly</Text>
              <Text style={[styles.priceText, { color: currentTheme.text }]}>
                {formatPrice(property.weeklyRent)}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={{ color: currentTheme.muted }}>
                Security Deposit
              </Text>
              <Text style={[styles.priceText, { color: currentTheme.text }]}>
                {formatPrice(property.SecuritybasePrice)}
              </Text>
            </View>
          </View>

          {/* Amenities */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              Amenities
            </Text>
            <View style={styles.amenityGrid}>
              {property.amenities?.map((item: string, i: number) => (
                <View
                  key={i}
                  style={[
                    styles.amenityBadge,
                    { backgroundColor: currentTheme.card },
                  ]}
                >
                  <Feather
                    name="check-circle"
                    size={14}
                    color={currentTheme.primary}
                  />
                  <Text
                    style={[styles.amenityText, { color: currentTheme.text }]}
                  >
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Bills */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              Included in Rent
            </Text>
            <View style={styles.amenityGrid}>
              {property.ALL_BILLS?.map((bill: string, i: number) => (
                <View
                  key={i}
                  style={[
                    styles.billBadge,
                    { backgroundColor: currentTheme.primary + "15" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="lightning-bolt"
                    size={14}
                    color={currentTheme.primary}
                  />
                  <Text
                    style={[styles.billText, { color: currentTheme.primary }]}
                  >
                    {bill}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Persistent Footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: currentTheme.background,
            borderTopColor: currentTheme.border,
          },
        ]}
      >
        <View>
          <Text style={[styles.footerPrice, { color: currentTheme.text }]}>
            {formatPrice(property.monthlyRent)}
          </Text>
          <Text style={{ color: currentTheme.muted, fontSize: 12 }}>
            Available Now
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.chatBtn, { backgroundColor: currentTheme.primary }]}
          onPress={handleChatOwner}
        >
          <Ionicons
            name="chatbubble-ellipses"
            size={20}
            color="white"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.chatBtnText}>Chat with Owner</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 20,
    padding: 4,
  },
  noImage: { flex: 1, justifyContent: "center", alignItems: "center" },
  detailsBox: {
    marginTop: -35,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 24,
    paddingTop: 15,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: { fontSize: 26, fontWeight: "800", marginBottom: 10 },
  locationRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  locationText: { fontSize: 15, marginLeft: 6, flex: 1 },
  mapLink: {
    fontWeight: "bold",
    fontSize: 15,
    textDecorationLine: "underline",
  },
  capacityRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  capItem: { alignItems: "center" },
  capVal: { fontSize: 18, fontWeight: "700", marginTop: 4 },
  capLabel: { fontSize: 12, color: "#717171" },
  divider: { height: 1, backgroundColor: "#EEEEEE", marginVertical: 20 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 19, fontWeight: "700", marginBottom: 12 },
  descText: { fontSize: 15, lineHeight: 24, opacity: 0.8 },
  priceCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 30,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  priceText: { fontWeight: "700", fontSize: 16 },
  amenityGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  amenityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  amenityText: { fontSize: 14, fontWeight: "500", marginLeft: 6 },
  billBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  billText: { fontSize: 14, fontWeight: "700", marginLeft: 6 },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
  },
  footerPrice: { fontSize: 22, fontWeight: "900" },
  chatBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 18,
  },
  chatBtnText: { color: "white", fontWeight: "800", fontSize: 16 },
});
