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
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function OwnerSection({
  owner,
  theme,
  onChat,
  isCreating,
}: any) {
  const router = useRouter();

  if (!owner) return null;

  const agency = owner.agencyDetails;
  const isAgencyRole = owner.role === "agency" && !!agency;
  const isAgentRole = owner.role === "agent";

  // HIERARCHY SWAP: Owner is primary
  const primaryName = owner.name;

  const secondaryLabel = isAgencyRole
    ? `at ${agency.name}`
    : isAgentRole
      ? "Professional Agent"
      : "Owner";

  const displayImage =
    owner.profileImage || (isAgencyRole ? agency.logo : null);

  const handleAgencyNavigation = () => {
    if (isAgencyRole && agency._id) {
      router.push(`/agency/${agency._id}`);
    }
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
          onPress={handleAgencyNavigation}
          disabled={!isAgencyRole}
          style={styles.infoWrapper}
          activeOpacity={0.7}
        >
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: displayImage || "https://via.placeholder.com/150",
              }}
              style={styles.avatar}
            />
            {(isAgencyRole || isAgentRole) && (
              <View
                style={[styles.badgeIcon, { backgroundColor: theme.primary }]}
              >
                <Ionicons name="shield-checkmark" size={10} color="white" />
              </View>
            )}
          </View>

          <View style={styles.textColumn}>
            <Text
              style={[styles.ownerName, { color: theme.text }]}
              numberOfLines={1}
            >
              {primaryName}
            </Text>

            <View style={styles.statusRow}>
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      isAgencyRole || isAgentRole
                        ? theme.secondary
                        : theme.muted,
                  },
                ]}
                numberOfLines={1}
              >
                {secondaryLabel}
              </Text>
              {isAgencyRole && (
                <Ionicons
                  name="chevron-forward"
                  size={10}
                  color={theme.secondary}
                  style={{ marginLeft: 2 }}
                />
              )}
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.actionWrapper}>
          <TouchableOpacity
            onPress={onChat}
            disabled={isCreating}
            style={[styles.chatBtn, { backgroundColor: theme.primary }]}
          >
            <Ionicons name="chatbubble-ellipses" size={18} color="white" />
            <Text style={styles.chatBtnText}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${owner.phone}`)}
            style={[styles.callBtn, { borderColor: theme.border }]}
          >
            <Ionicons name="call-outline" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
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
    backgroundColor: "white",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
  badgeIcon: {
    position: "absolute",
    bottom: -4,
    right: -4,
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
  ownerName: {
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 18,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  actionWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chatBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
    minWidth: 90,
    justifyContent: "center",
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
