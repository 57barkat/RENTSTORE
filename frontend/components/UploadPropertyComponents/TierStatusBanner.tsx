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

  const used = user?.usedPropertyCount || 0;
  const limit = user?.propertyLimit || 0;
  const credits = user?.paidPropertyCredits || 0;

  const isFreeTierActive = used < limit;
  const remainingFree = limit - used;
  const hasNoCredits = used >= limit && credits <= 0;

  useEffect(() => {
    if (user && hasNoCredits) {
      const checkAndRefresh = async () => {
        console.log("Empty credits detected, checking for updates...");
        if (refreshAuthState) {
          await refreshAuthState();
        }
      };
      checkAndRefresh();
    }
  }, [hasNoCredits, !!user]);

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
          borderColor: hasNoCredits ? currentTheme.error : currentTheme.border,
          borderWidth: hasNoCredits ? 1.5 : 1,
        },
      ]}
    >
      <View style={styles.row}>
        <MaterialCommunityIcons
          name={
            hasNoCredits
              ? "alert-circle-outline"
              : isFreeTierActive
                ? "gift-outline"
                : "ticket-confirmation-outline"
          }
          size={24}
          color={
            hasNoCredits
              ? currentTheme.error
              : isFreeTierActive
                ? currentTheme.primary
                : currentTheme.success
          }
        />

        <View style={styles.textContainer}>
          <Text style={[styles.label, { color: currentTheme.muted }]}>
            {hasNoCredits
              ? "Limit Exceeded"
              : isFreeTierActive
                ? "Free Tier Remaining"
                : "Paid Credits Available"}
          </Text>
          <Text
            style={[
              styles.value,
              { color: hasNoCredits ? currentTheme.error : currentTheme.text },
            ]}
          >
            {hasNoCredits
              ? "No uploads available"
              : isFreeTierActive
                ? `${remainingFree} of ${limit} uploads`
                : `${credits} premium uploads`}
          </Text>
        </View>

        {!hasNoCredits && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isFreeTierActive
                  ? currentTheme.primary + "15"
                  : currentTheme.success + "15",
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color: isFreeTierActive
                    ? currentTheme.primary
                    : currentTheme.success,
                },
              ]}
            >
              {isFreeTierActive ? "FREE" : "PAID"}
            </Text>
          </View>
        )}
      </View>

      {hasNoCredits && (
        <TouchableOpacity
          onPress={handleUpgradePress}
          style={styles.footerLink}
        >
          <Text style={[styles.footerLinkText, { color: currentTheme.info }]}>
            View pricing plans and packages →
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
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
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
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    fontWeight: "700",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  footerLink: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: "#E2E8F0",
    alignItems: "center",
  },
  footerLinkText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default TierStatusBanner;
