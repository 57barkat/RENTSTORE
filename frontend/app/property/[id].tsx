import React from "react";
import {
  View,
  ScrollView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
  Linking,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import ImageCarousel from "@/utils/properties/Carousel";
import { formatPrice } from "@/utils/properties/formatPrice";
import { usePropertyById } from "@/services/propertyService";
import { useChatRoom } from "@/hooks/useChatRoom";

import { PropertyDetailsHeader } from "@/components/Properties/PropertyDetailsHeader";
import { StatItem } from "@/components/Properties/PropertyStats";
import { Badge } from "@/components/Properties/PropertyBadge";
import { PriceRow } from "@/components/Properties/PropertyPriceCard";
import { PropertyFooter } from "@/components/Properties/PropertyFooter";

import { Ionicons } from "@expo/vector-icons";

export const options = { headerShown: false };

export default function PropertyDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  console.log("PropertyDetails rendered with id:", id);
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const isDark = theme === "dark";
  const router = useRouter();
  const { height: windowHeight } = useWindowDimensions();

  const { property, isLoading, refetch, isFetching } = usePropertyById(id);
  const { handleChatOwner, isCreating } = useChatRoom(property?.ownerId);

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

  const fullAddress = property.address?.[0]
    ? `${property.address[0].street}, ${property.address[0].city}, ${property.address[0].stateTerritory}`
    : property.location;

  const handleMapRedirect = () => {
    if (property.lat && property.lng) {
      const url = Platform.select({
        ios: `maps:0,0?q=${property.title}@${property.lat},${property.lng}`,
        android: `geo:0,0?q=${property.lat},${property.lng}(${property.title})`,
      });
      if (url) Linking.openURL(url);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <PropertyDetailsHeader
        theme={currentTheme}
        isDark={isDark}
        onBack={() => router.back()}
      />

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
        <View style={{ height: windowHeight * 0.45 }}>
          <ImageCarousel
            media={
              property.photos?.map((uri: string) => ({ uri, type: "image" })) ||
              []
            }
          />
        </View>

        <View
          style={[
            styles.contentCard,
            { backgroundColor: currentTheme.background },
          ]}
        >
          <View
            style={[styles.handle, { backgroundColor: currentTheme.border }]}
          />

          {/* Header Section */}
          <Text style={[styles.tagline, { color: currentTheme.primary }]}>
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

          {/* Stats Bar */}
          <View style={styles.statsContainer}>
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

          {/* Owner Profile Section */}
          {property.owner && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
                Hosted by
              </Text>
              <View style={styles.ownerCard}>
                <Image
                  source={{ uri: property.owner.profileImage }}
                  style={styles.ownerImage}
                />
                <View>
                  <Text
                    style={[styles.ownerName, { color: currentTheme.text }]}
                  >
                    {property.owner.name}
                  </Text>
                  <Text style={{ color: currentTheme.muted }}>
                    Property Owner
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Highlights */}
          {property.description?.highlighted && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
                Highlights
              </Text>
              <View style={styles.badgeGrid}>
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

          {/* Amenities & Bills */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              Amenities & Bills
            </Text>
            <View style={styles.badgeGrid}>
              {property.amenities?.map((item: string, i: number) => (
                <Badge
                  key={`amenity-${i}`}
                  text={item}
                  icon="check-circle-outline"
                  theme={currentTheme}
                  type="amenity"
                />
              ))}
              {property.ALL_BILLS?.map((bill: string, i: number) => (
                <Badge
                  key={`bill-${i}`}
                  text={`${bill} included`}
                  icon="flash-outline"
                  theme={currentTheme}
                  type="safety"
                />
              ))}
            </View>
          </View>

          {/* Financials */}
          <View
            style={[
              styles.priceCard,
              {
                borderColor: currentTheme.border,
                backgroundColor: currentTheme.card,
              },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                { color: currentTheme.text, marginBottom: 12 },
              ]}
            >
              Financial Details
            </Text>
            <PriceRow
              label="Monthly Rent"
              value={formatPrice(
                property.monthlyRent,
                "not available for monthly rent",
              )}
              theme={currentTheme}
              isLarge
              color={currentTheme.primary}
            />
            <PriceRow
              label="Weekly Rate"
              value={formatPrice(
                property.weeklyRent,
                "not available for weekly rent",
              )}
              theme={currentTheme}
            />
            <PriceRow
              label="Daily Rate"
              value={formatPrice(
                property.dailyRent,
                "not available for daily rent",
              )}
              theme={currentTheme}
            />
            <PriceRow
              label="Security Deposit"
              value={formatPrice(
                property.SecuritybasePrice,
                "no security deposit",
              )}
              theme={currentTheme}
              isLast
            />
          </View>
        </View>
      </ScrollView>
      {property.chat && (
        <PropertyFooter
          theme={currentTheme}
          price={formatPrice(property.monthlyRent, "Monthly")}
          onChat={handleChatOwner}
          isCreating={isCreating}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentCard: {
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
  tagline: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  locationText: {
    fontSize: 15,
    marginLeft: 6,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  divider: {
    height: 1,
    marginVertical: 25,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 15,
  },
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  priceCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  ownerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ownerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: "700",
  },
});
