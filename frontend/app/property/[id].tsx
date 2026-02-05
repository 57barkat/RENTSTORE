import React, { useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  useWindowDimensions,
  Platform,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFindPropertyByIdQuery } from "@/services/api";
import ImageCarousel from "@/utils/Carousel";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contextStore/ThemeContext";
import { MaterialCommunityIcons, Feather, Ionicons } from "@expo/vector-icons";
import { useCreateRoomMutation } from "@/hooks/chat";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const options = { headerShown: false };

export default function PropertyDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const isDark = theme === "dark";

  const {
    data: property,
    isLoading,
    refetch,
    isFetching,
  } = useFindPropertyByIdQuery(id);

  const { height: windowHeight } = useWindowDimensions();
  const router = useRouter();
  const [createRoom, { isLoading: isCreatingChat }] = useCreateRoomMutation();

  const formatPrice = useCallback((amount: number | string | undefined) => {
    if (amount === undefined || amount === null) return "N/A";
    const num = typeof amount === "string" ? parseInt(amount, 10) : amount;
    return `Rs. ${num.toLocaleString()}`;
  }, []);

  const handleChatOwner = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      const ownerId = property?.ownerId;

      if (!userId) {
        Alert.alert("Login Required", "Please login to contact the host.", [
          { text: "Cancel" },
          { text: "Login", onPress: () => router.push("/login") },
        ]);
        return;
      }

      const participants = Array.from(new Set([userId, ownerId]));
      const room: any = await createRoom({ participants }).unwrap();

      router.push({
        pathname: "/chat/[roomId]",
        params: { roomId: room._id, otherUserId: ownerId },
      });
    } catch (err: any) {
      Alert.alert("Chat Error", "Could not start conversation.");
    }
  };

  const handleMapRedirect = () => {
    if (property?.lat && property?.lng) {
      const url = Platform.select({
        ios: `maps:0,0?q=${property.title}@${property.lat},${property.lng}`,
        android: `geo:0,0?q=${property.lat},${property.lng}(${property.title})`,
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

  if (!property) return null;

  // Formatting address from the array provided in your data
  const fullAddress = property.address?.[0]
    ? `${property.address[0].street}, ${property.address[0].city}`
    : property.location;

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Header UI */}
      <View style={styles.headerNav}>
        <TouchableOpacity
          style={[
            styles.roundBtn,
            { backgroundColor: isDark ? "rgba(28,28,30,0.8)" : "white" },
          ]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={currentTheme.text} />
        </TouchableOpacity>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            style={[
              styles.roundBtn,
              {
                backgroundColor: isDark ? "rgba(28,28,30,0.8)" : "white",
                marginRight: 10,
              },
            ]}
          >
            <Feather name="share" size={20} color={currentTheme.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.roundBtn,
              { backgroundColor: isDark ? "rgba(28,28,30,0.8)" : "white" },
            ]}
          >
            <Ionicons
              name={property.isFav ? "heart" : "heart-outline"}
              size={22}
              color={property.isFav ? "#FF385C" : currentTheme.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor={currentTheme.primary}
          />
        }
      >
        {/* Carousel */}
        <View style={{ height: windowHeight * 0.45 }}>
          <ImageCarousel
            media={
              property.photos?.map((uri: string) => ({ uri, type: "image" })) ||
              []
            }
          />
        </View>

        {/* Content Sheet */}
        <View
          style={[
            styles.detailsBox,
            { backgroundColor: currentTheme.background },
          ]}
        >
          <View
            style={[styles.handle, { backgroundColor: currentTheme.border }]}
          />

          <Text style={[styles.categoryLabel, { color: currentTheme.primary }]}>
            {property.hostOption?.toUpperCase()} •{" "}
            {property.featured ? "FEATURED" : "VERIFIED"}
          </Text>

          <Text style={[styles.title, { color: currentTheme.text }]}>
            {property.title}
          </Text>

          <TouchableOpacity
            onPress={handleMapRedirect}
            style={styles.locationRow}
          >
            <Ionicons name="location" size={18} color={currentTheme.primary} />
            <Text style={[styles.locationText, { color: currentTheme.muted }]}>
              {fullAddress}
            </Text>
          </TouchableOpacity>

          {/* Stats Section */}
          <View style={styles.capacityRow}>
            <StatItem
              icon="account-group-outline"
              label="Guests"
              value={property.capacityState?.Persons}
              theme={currentTheme}
            />
            <StatItem
              icon="bed-outline"
              label="Beds"
              value={property.capacityState?.beds}
              theme={currentTheme}
            />
            <StatItem
              icon="shower-head"
              label="Baths"
              value={property.capacityState?.bathrooms}
              theme={currentTheme}
            />
          </View>

          <View
            style={[styles.divider, { backgroundColor: currentTheme.border }]}
          />

          {/* Highlights from your data */}
          {property.description?.highlighted && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
                Property Highlights
              </Text>
              <View style={styles.grid}>
                {property.description.highlighted.map(
                  (h: string, i: number) => (
                    <Badge
                      key={i}
                      text={h.replace("_", " ")}
                      icon="star-face"
                      theme={currentTheme}
                      type="highlight"
                    />
                  ),
                )}
              </View>
            </View>
          )}

          {/* Amenities */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              Amenities
            </Text>
            <View style={styles.grid}>
              {property.amenities?.map((item: string, i: number) => (
                <Badge
                  key={i}
                  text={item}
                  icon="check-circle-outline"
                  theme={currentTheme}
                  type="amenity"
                />
              ))}
            </View>
          </View>

          {/* Safety - Specific to your data */}
          {property.safetyDetailsData?.safetyDetails && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
                Safety & Security
              </Text>
              <View style={styles.grid}>
                {property.safetyDetailsData.safetyDetails.map(
                  (s: string, i: number) => (
                    <Badge
                      key={i}
                      text={s.replace("_", " ")}
                      icon="shield-check-outline"
                      theme={currentTheme}
                      type="safety"
                    />
                  ),
                )}
              </View>
            </View>
          )}

          {/* Pricing Info */}
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
                { color: currentTheme.text, fontSize: 18 },
              ]}
            >
              Financial Details
            </Text>
            <PriceRow
              label="Monthly Rent"
              value={formatPrice(property.monthlyRent)}
              theme={currentTheme}
              isLarge
              color={currentTheme.primary}
            />
            <PriceRow
              label="Weekly Rate"
              value={formatPrice(property.weeklyRent)}
              theme={currentTheme}
            />
            <PriceRow
              label="Daily Rate"
              value={formatPrice(property.dailyRent)}
              theme={currentTheme}
            />
            <PriceRow
              label="Security Deposit"
              value={formatPrice(property.SecuritybasePrice)}
              theme={currentTheme}
              isLast
            />
          </View>
        </View>
      </ScrollView>

      {/* Action Footer */}
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
          <Text style={{ color: "#4CAF50", fontSize: 12, fontWeight: "bold" }}>
            PER MONTH
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.chatBtn, { backgroundColor: currentTheme.primary }]}
          onPress={handleChatOwner}
          disabled={isCreatingChat}
        >
          {isCreatingChat ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons
                name="chatbubbles-outline"
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.chatBtnText}>Contact Host</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const StatItem = ({ icon, label, value, theme }: any) => (
  <View style={[styles.capItem, { backgroundColor: theme.card }]}>
    <MaterialCommunityIcons name={icon} size={22} color={theme.primary} />
    <Text style={[styles.capVal, { color: theme.text }]}>{value || 0}</Text>
    <Text style={styles.capLabel}>{label}</Text>
  </View>
);

const PriceRow = ({ label, value, theme, isLast, isLarge, color }: any) => (
  <View
    style={[
      styles.priceRow,
      !isLast && {
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.border + "30",
        paddingBottom: 12,
      },
    ]}
  >
    <Text style={{ color: theme.muted, fontSize: 14 }}>{label}</Text>
    <Text
      style={{
        color: color || theme.text,
        fontWeight: "800",
        fontSize: isLarge ? 18 : 15,
      }}
    >
      {value}
    </Text>
  </View>
);

const Badge = ({ text, icon, theme, type }: any) => (
  <View
    style={[
      styles.badge,
      { backgroundColor: theme.card, borderColor: theme.border },
    ]}
  >
    <MaterialCommunityIcons
      name={icon}
      size={16}
      color={type === "safety" ? "#FF5A5F" : theme.primary}
    />
    <Text style={[styles.badgeText, { color: theme.text }]}>
      {text.charAt(0).toUpperCase() + text.slice(1)}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerNav: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  roundBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  detailsBox: {
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
    opacity: 0.2,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: { fontSize: 28, fontWeight: "900", marginBottom: 12 },
  locationRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  locationText: { fontSize: 15, marginLeft: 6, fontWeight: "500" },
  capacityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  capItem: { flex: 1, alignItems: "center", padding: 15, borderRadius: 20 },
  capVal: { fontSize: 18, fontWeight: "800", marginTop: 5 },
  capLabel: { fontSize: 11, opacity: 0.6, fontWeight: "600" },
  divider: { height: 1, marginVertical: 25 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: "800", marginBottom: 15 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: { fontSize: 13, fontWeight: "600", marginLeft: 8 },
  priceCard: { padding: 20, borderRadius: 24, borderWidth: 1 },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 35 : 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    elevation: 10,
  },
  footerPrice: { fontSize: 22, fontWeight: "900" },
  chatBtn: {
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  chatBtnText: { color: "white", fontWeight: "800", fontSize: 16 },
});
