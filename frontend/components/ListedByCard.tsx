import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import type { PropertyOwner } from "@/types/PropertyDetailScreen.types";

type ThemeColors = typeof Colors.light;

interface ListedByCardProps {
  propertyId: string;
  owner?: PropertyOwner;
  theme: ThemeColors;
}

const getOwnerRoleLabel = (role?: string) => {
  if (role === "agency") {
    return "Agency";
  }

  if (role === "agent") {
    return "Professional Agent";
  }

  return "Owner";
};

const getInitials = (name?: string) => {
  const parts = (name || "Owner").trim().split(/\s+/).slice(0, 2);
  return parts
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
};

export default function ListedByCard({
  propertyId,
  owner,
  theme,
}: ListedByCardProps) {
  const router = useRouter();

  if (!owner) {
    return null;
  }

  const hasVerification = owner.isPhoneVerified || owner.isEmailVerified;
  const subscriptionLabel =
    owner.subscription && owner.subscription !== "free"
      ? owner.subscription.toUpperCase()
      : null;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(`/uploader/${propertyId}`)}
      style={[
        styles.card,
        {
          backgroundColor: theme.background,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>
          Listed By
        </Text>
        <View style={styles.profileLink}>
          <Text style={[styles.profileLinkText, { color: theme.muted }]}>
            View profile
          </Text>
          <Ionicons name="chevron-forward" size={14} color={theme.muted} />
        </View>
      </View>

      <View style={styles.contentRow}>
        {owner.profileImage ? (
          <Image source={{ uri: owner.profileImage }} style={styles.avatar} />
        ) : (
          <View style={[styles.initialsAvatar, { backgroundColor: theme.primary }]}>
            <Text style={styles.initialsText}>{getInitials(owner.name)}</Text>
          </View>
        )}

        <View style={styles.copyColumn}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
              {owner.name || "Owner"}
            </Text>
            {subscriptionLabel ? (
              <View
                style={[
                  styles.planPill,
                  { backgroundColor: `${theme.primary}12`, borderColor: `${theme.primary}18` },
                ]}
              >
                <Text style={[styles.planText, { color: theme.primary }]}>
                  {subscriptionLabel}
                </Text>
              </View>
            ) : null}
          </View>

          <Text style={[styles.roleText, { color: theme.muted }]}>
            {getOwnerRoleLabel(owner.role)}
          </Text>

          {hasVerification ? (
            <View style={styles.verifiedRow}>
              <MaterialCommunityIcons
                name="shield-check"
                size={15}
                color={theme.success}
              />
              <Text style={[styles.verifiedText, { color: theme.success }]}>
                Verified contact
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
    borderWidth: 1,
    padding: 18,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
  },
  profileLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  profileLinkText: {
    fontSize: 12,
    fontWeight: "700",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
  },
  initialsAvatar: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  initialsText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },
  copyColumn: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    flexShrink: 1,
    fontSize: 18,
    fontWeight: "800",
  },
  planPill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  planText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  roleText: {
    fontSize: 13,
    fontWeight: "600",
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
