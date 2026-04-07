import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/contextStore/AuthContext";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";

const TierStatusBanner = () => {
  const { user, refreshAuthState } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const currentTheme = Colors[theme ?? "light"];

  // Data from AuthContext
  const used = user?.usedPropertyCount || 0;
  const limit = user?.propertyLimit || 0;
  const featured = user?.paidFeaturedCredits || 0;
  const priority = user?.prioritySlotCredits || 0;

  const remainingUploads = limit - used;
  const isOutOfUploads = remainingUploads <= 0;
  const isPro = user?.subscription === "pro";

  useEffect(() => {
    if (user && isOutOfUploads && refreshAuthState) {
      refreshAuthState();
    }
  }, [isOutOfUploads, !!user]);

  if (!user) return null;

  const handleUpgradePress = () => {
    router.push("/shop/BuyCredits");
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: currentTheme.card,
          borderColor: isOutOfUploads
            ? currentTheme.error
            : isPro
              ? "#EAB308"
              : currentTheme.border,
          borderWidth: isOutOfUploads || isPro ? 1.5 : 1,
        },
      ]}
    >
      <View style={styles.row}>
        <MaterialCommunityIcons
          name={
            isOutOfUploads
              ? "alert-circle-outline"
              : isPro
                ? "crown-outline"
                : "account-check-outline"
          }
          size={26}
          color={
            isOutOfUploads
              ? currentTheme.error
              : isPro
                ? "#EAB308"
                : currentTheme.primary
          }
        />

        <View style={styles.textContainer}>
          <Text style={[styles.label, { color: currentTheme.muted }]}>
            {isPro ? "Pro Subscription Active" : "Account Capacity"}
          </Text>
          <Text
            style={[
              styles.value,
              {
                color: isOutOfUploads ? currentTheme.error : currentTheme.text,
              },
            ]}
          >
            {isOutOfUploads
              ? "Upload limit reached"
              : `${remainingUploads} uploads available`}
          </Text>
        </View>

        <View
          style={[
            styles.badge,
            {
              backgroundColor: isPro
                ? "#EAB30820"
                : currentTheme.primary + "15",
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: isPro ? "#B45309" : currentTheme.primary },
            ]}
          >
            {user.subscription?.toUpperCase() || "FREE"}
          </Text>
        </View>
      </View>

      {/* New Row for Premium Perks: Featured & Priority */}
      {(featured > 0 || priority > 0) && (
        <View
          style={[
            styles.perksRow,
            { borderTopColor: currentTheme.border + "50" },
          ]}
        >
          {featured > 0 && (
            <View style={styles.perkItem}>
              <MaterialCommunityIcons
                name="star-circle"
                size={16}
                color="#F59E0B"
              />
              <Text style={[styles.perkText, { color: currentTheme.text }]}>
                {featured} Featured
              </Text>
            </View>
          )}
          {priority > 0 && (
            <View style={styles.perkItem}>
              <MaterialCommunityIcons
                name="lightning-bolt"
                size={16}
                color="#8B5CF6"
              />
              <Text style={[styles.perkText, { color: currentTheme.text }]}>
                {priority} Priority Slots
              </Text>
            </View>
          )}
        </View>
      )}

      {isOutOfUploads && (
        <TouchableOpacity
          onPress={handleUpgradePress}
          style={styles.footerLink}
        >
          <Text style={[styles.footerLinkText, { color: currentTheme.info }]}>
            Upgrade plan to list more properties →
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: "700",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "900",
  },
  perksRow: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  perkItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  perkText: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
  },
  footerLink: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: "#CBD5E1",
    alignItems: "center",
  },
  footerLinkText: {
    fontSize: 13,
    fontWeight: "700",
  },
});

export default TierStatusBanner;
