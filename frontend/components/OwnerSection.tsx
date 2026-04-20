import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Linking,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function OwnerSection({
  propertyId,
  owner,
  theme,
  onChat,
  isCreating,
  isOwner,
}: any) {
  const router = useRouter();

  if (!owner) return null;

  const summaryOwner = owner;
  const isAgencyRole = summaryOwner?.role === "agency";
  const isAgentRole = summaryOwner?.role === "agent";
  const isProUser = summaryOwner?.subscription === "pro";
  const displayImage =
    summaryOwner?.profileImage || "https://via.placeholder.com/150";
  const handleOpenUploader = () => {
    if (!propertyId) return;
    router.push(`/uploader/${propertyId}`);
  };

  return (
    <View
      style={[
        styles.footerContainer,
        { backgroundColor: theme.background, borderTopColor: theme.border },
      ]}
    >
      <View style={styles.footerContent}>
        <TouchableOpacity
          onPress={handleOpenUploader}
          style={styles.infoWrapper}
          activeOpacity={0.7}
        >
          <View style={styles.avatarContainer}>
            <View
              style={[
                styles.imageBorder,
                { borderColor: isProUser ? "#D4AF37" : "transparent" },
              ]}
            >
              <Image source={{ uri: displayImage }} style={styles.avatar} />
            </View>

            {(summaryOwner?.isPhoneVerified || summaryOwner?.isEmailVerified) && (
              <View
                style={[styles.verifyBadge, { backgroundColor: theme.primary }]}
              >
                <Ionicons name="checkmark" size={10} color="white" />
              </View>
            )}
          </View>

          <View style={styles.textColumn}>
            <View style={styles.nameRow}>
              <Text
                style={[styles.ownerName, { color: theme.text }]}
                numberOfLines={1}
              >
                {summaryOwner?.name || "Owner"}
              </Text>
              {isProUser && (
                <FontAwesome5
                  name="crown"
                  size={14}
                  color="#D4AF37"
                  style={styles.crownIcon}
                />
              )}
            </View>

            <Text
              style={[styles.statusText, { color: theme.secondary }]}
              numberOfLines={1}
            >
              Tap to view {isAgentRole
                ? "Professional Agent"
                : isAgencyRole
                  ? "Agency"
                  : "Owner"} profile
            </Text>
          </View>
        </TouchableOpacity>

        {!isOwner && (
          <View style={styles.actionWrapper}>
            <TouchableOpacity
              onPress={handleOpenUploader}
              style={[styles.profileBtn, { borderColor: theme.border }]}
            >
              <Ionicons name="person-outline" size={18} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onChat}
              disabled={isCreating}
              style={[styles.chatBtn, { backgroundColor: theme.primary }]}
            >
              <Ionicons name="chatbubble-ellipses" size={18} color="white" />
              <Text style={styles.chatBtnText}>Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                summaryOwner?.phone
                  ? Linking.openURL(`tel:${summaryOwner.phone}`)
                  : null
              }
              style={[styles.callBtn, { borderColor: theme.border }]}
            >
              <Ionicons name="call-outline" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
    borderTopWidth: 1,
    elevation: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
  },
  footerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  avatarContainer: {
    position: "relative",
  },
  imageBorder: {
    padding: 2,
    borderWidth: 2,
    borderRadius: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
  verifyBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  textColumn: {
    marginLeft: 10,
    flexShrink: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: "800",
  },
  crownIcon: {
    marginTop: -2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 1,
  },
  actionWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  chatBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  chatBtnText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
  callBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
