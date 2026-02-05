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
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import ImageCarousel from "@/utils/Carousel";
import { formatPrice } from "@/utils/formatPrice";
import { usePropertyById } from "@/services/propertyService";
import { useChatRoom } from "@/hooks/useChatRoom";

import { PropertyDetailsHeader } from "@/components/Property/PropertyDetailsHeader";
import { StatItem } from "@/components/Property/PropertyStats";
import { Badge } from "@/components/Property/PropertyBadge";
import { PriceRow } from "@/components/Property/PropertyPriceCard";
import { PropertyFooter } from "@/components/Property/PropertyFooter";

import { Ionicons } from "@expo/vector-icons";

export const options = { headerShown: false };

export default function PropertyDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const isDark = theme === "dark";
  const router = useRouter();
  const { height: windowHeight } = useWindowDimensions();

  const { property, isLoading, refetch, isFetching } = usePropertyById(id);
  const { handleChatOwner, isCreating } = useChatRoom(property?.ownerId);

  if (isLoading)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: currentTheme.background,
        }}
      >
        <ActivityIndicator size="large" color={currentTheme.primary} />
      </View>
    );
  if (!property) return null;

  const fullAddress = property.address?.[0]
    ? `${property.address[0].street}, ${property.address[0].city}`
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
        property={property}
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
              property.photos?.map((uri: any) => ({ uri, type: "image" })) || []
            }
          />
        </View>

        <View
          style={{
            marginTop: -30,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            padding: 24,
            backgroundColor: currentTheme.background,
          }}
        >
          <View
            style={{
              width: 40,
              height: 5,
              borderRadius: 3,
              alignSelf: "center",
              marginBottom: 20,
              opacity: 0.2,
              backgroundColor: currentTheme.border,
            }}
          />

          <Text
            style={{
              fontSize: 12,
              fontWeight: "900",
              letterSpacing: 1,
              marginBottom: 8,
              color: currentTheme.primary,
            }}
          >
            {property.hostOption?.toUpperCase()} •{" "}
            {property.featured ? "FEATURED" : "VERIFIED"}
          </Text>

          <Text
            style={{
              fontSize: 28,
              fontWeight: "900",
              marginBottom: 12,
              color: currentTheme.text,
            }}
          >
            {property.title}
          </Text>

          <TouchableOpacity
            onPress={handleMapRedirect}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Ionicons name="location" size={18} color={currentTheme.primary} />
            <Text
              style={{
                fontSize: 15,
                marginLeft: 6,
                fontWeight: "500",
                color: currentTheme.muted,
              }}
            >
              {fullAddress}
            </Text>
          </TouchableOpacity>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
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
            style={{
              height: 1,
              marginVertical: 25,
              backgroundColor: currentTheme.border,
            }}
          />

          {property.description?.highlighted && (
            <View style={{ marginBottom: 30 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  marginBottom: 15,
                  color: currentTheme.text,
                }}
              >
                Property Highlights
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
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

          <View style={{ marginBottom: 30 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "800",
                marginBottom: 15,
                color: currentTheme.text,
              }}
            >
              Amenities
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
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

          {property.safetyDetailsData?.safetyDetails && (
            <View style={{ marginBottom: 30 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  marginBottom: 15,
                  color: currentTheme.text,
                }}
              >
                Safety & Security
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
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

          <View
            style={{
              padding: 20,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: currentTheme.border,
              backgroundColor: currentTheme.card,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                marginBottom: 12,
                color: currentTheme.text,
              }}
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

      <PropertyFooter
        theme={currentTheme}
        price={formatPrice(property.monthlyRent, "monthly rent")}
        onChat={handleChatOwner}
        isCreating={isCreating}
      />
    </View>
  );
}
