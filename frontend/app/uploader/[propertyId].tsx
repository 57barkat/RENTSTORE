import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { useGetPropertyUploaderProfileQuery } from "@/services/api";
import { getPrimaryRentInfo } from "@/utils/properties/rent";

export const options = { headerShown: false };

const uploaderStatItems = [
  { key: "total", valueKey: "totalProperties", icon: "grid-outline" as const },
  { key: "houses", valueKey: "homes", icon: "home-outline" as const },
  { key: "apartments", valueKey: "apartments", icon: "business-outline" as const },
  { key: "hostels", valueKey: "hostels", icon: "bed-outline" as const },
  { key: "shops", valueKey: "shops", icon: "storefront-outline" as const },
  { key: "offices", valueKey: "offices", icon: "briefcase-outline" as const },
] as const;

export default function UploaderProfileScreen() {
  const router = useRouter();
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();
  const resolvedPropertyId = Array.isArray(propertyId) ? propertyId[0] : propertyId;
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const { data, isLoading, error } = useGetPropertyUploaderProfileQuery(
    resolvedPropertyId,
    { skip: !resolvedPropertyId },
  );

  if (isLoading) {
    return (
      <View
        style={[styles.center, { backgroundColor: currentTheme.background }]}
      >
        <ActivityIndicator size="large" color={currentTheme.primary} />
      </View>
    );
  }

  const uploader = data?.uploader;
  const stats = data?.stats;
  const listings = data?.listings || [];
  const statValues = {
    totalProperties: stats?.totalProperties ?? 0,
    homes: stats?.homes ?? 0,
    apartments: stats?.apartments ?? 0,
    hostels: stats?.hostels ?? 0,
    shops: stats?.shops ?? 0,
    offices: stats?.offices ?? 0,
  };

  if (error) {
    return (
      <View
        style={[styles.center, { backgroundColor: currentTheme.background }]}
      >
        <Text style={{ color: currentTheme.text, fontWeight: "700" }}>
          Failed to load uploader details.
        </Text>
        <Text
          style={{
            color: currentTheme.secondary,
            marginTop: 8,
            textAlign: "center",
          }}
        >
          Property id: {resolvedPropertyId || "missing"}
        </Text>
      </View>
    );
  }

  if (!uploader) {
    return (
      <View
        style={[styles.center, { backgroundColor: currentTheme.background }]}
      >
        <Text style={{ color: currentTheme.text, fontWeight: "700" }}>
          Uploader not found.
        </Text>
        <Text
          style={{
            color: currentTheme.secondary,
            marginTop: 8,
            textAlign: "center",
          }}
        >
          Property id: {resolvedPropertyId || "missing"}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: currentTheme.background }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.iconBtn, { borderColor: currentTheme.border }]}
        >
          <Ionicons name="arrow-back" size={20} color={currentTheme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>
          Uploader Profile
        </Text>
        <View style={styles.iconBtnSpacer} />
      </View>

      <View
        style={[
          styles.profileCard,
          { backgroundColor: currentTheme.card, borderColor: currentTheme.border },
        ]}
      >
        <Image
          source={{
            uri: uploader.profileImage || "https://via.placeholder.com/160",
          }}
          style={styles.avatar}
        />
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: currentTheme.text }]}>
            {uploader.name}
          </Text>
          {uploader.subscription === "pro" && (
            <FontAwesome5 name="crown" size={14} color="#D4AF37" />
          )}
        </View>
        <Text style={[styles.meta, { color: currentTheme.secondary }]}>
          {uploader.planLabel || "Free Member"}
        </Text>
        <Text style={[styles.meta, { color: currentTheme.text }]}>
          {uploader.phone || "Phone not available"}
        </Text>

        <TouchableOpacity
          onPress={() =>
            uploader.phone ? Linking.openURL(`tel:${uploader.phone}`) : null
          }
          style={[styles.callButton, { backgroundColor: currentTheme.primary }]}
        >
          <Ionicons name="call-outline" size={18} color="#fff" />
          <Text style={styles.callButtonText}>Call Uploader</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        {uploaderStatItems.map((item) => (
          <View
            key={item.key}
            style={[
              styles.statCard,
              { backgroundColor: currentTheme.card, borderColor: currentTheme.border },
            ]}
          >
            <View
              style={[
                styles.statIconWrap,
                { backgroundColor: `${currentTheme.primary}12` },
              ]}
            >
              <Ionicons
                name={item.icon}
                size={18}
                color={currentTheme.primary}
              />
            </View>
            <Text style={[styles.statValue, { color: currentTheme.text }]}>
              {statValues[item.valueKey]}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.listingsSection}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
          Uploaded Properties
        </Text>
        {listings.map((listing: any) => {
          const primaryRent = getPrimaryRentInfo(listing);

          return (
            <TouchableOpacity
              key={listing._id}
              onPress={() => router.push(`/property/${listing._id}`)}
              style={[
                styles.listingCard,
                {
                  backgroundColor: currentTheme.card,
                  borderColor: currentTheme.border,
                },
              ]}
            >
              <Image
                source={{
                  uri: listing.photos?.[0] || "https://via.placeholder.com/200",
                }}
                style={styles.listingImage}
              />
              <View style={styles.listingContent}>
                <Text
                  style={[styles.listingTitle, { color: currentTheme.text }]}
                  numberOfLines={1}
                >
                  {listing.title}
                </Text>
                <Text
                  style={[styles.listingMeta, { color: currentTheme.secondary }]}
                  numberOfLines={1}
                >
                  {listing.location || listing.address?.[0]?.city || "Property"}
                </Text>
                <Text
                  style={[styles.listingPrice, { color: currentTheme.text }]}
                >
                  {primaryRent
                    ? `Rs. ${primaryRent.amount.toLocaleString()} / ${primaryRent.label}`
                    : "Price on request"}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { padding: 20, gap: 18 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconBtnSpacer: {
    width: 42,
    height: 42,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  profileCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
  },
  meta: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 6,
  },
  callButton: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  callButtonText: {
    color: "#fff",
    fontWeight: "800",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "31%",
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 10,
  },
  listingsSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  listingCard: {
    borderWidth: 1,
    borderRadius: 20,
    overflow: "hidden",
  },
  listingImage: {
    width: "100%",
    height: 180,
  },
  listingContent: {
    padding: 14,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  listingMeta: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  listingPrice: {
    fontSize: 15,
    fontWeight: "800",
    marginTop: 8,
  },
});
