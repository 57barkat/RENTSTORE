import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from "react-native";
import ModalActionButton from "@/components/ModalActionButton";
import { pickImageFromGallery } from "@/utils/imageUtils";
import Toast from "react-native-toast-message";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = width * 0.28;

interface ProfileHeaderProps {
  profileImage?: string | null;
  name: string;
  phone?: string;
  subscription?: string;
  theme: "light" | "dark";
  onUpload: (file: FormData) => Promise<void>;
  onDelete: () => Promise<void>;
  loadingUpload?: boolean;
  loadingDelete?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profileImage,
  name,
  phone,
  subscription,
  theme,
  onUpload,
  onDelete,
  loadingUpload = false,
  loadingDelete = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const colors = Colors[theme];

  const handleUpload = async () => {
    const file = await pickImageFromGallery();
    if (file) await onUpload(file);
    setModalVisible(false);
  };

  const handleDelete = async () => {
    try {
      await onDelete();
    } catch {
      Toast.show({ type: "error", text1: "Delete Failed" });
    } finally {
      setModalVisible(false);
    }
  };

  const isVerified = phone !== "unverified account" && phone !== undefined;
  const subStatus = subscription?.toLowerCase();
  const isPro = subStatus === "pro";
  const isStandard = subStatus === "standard";

  const GOLD = "#F59E0B";
  const GOLD_DARK = "#B45309";

  const nameColor = colors.secondary;

  const avatarBorderColor = isPro
    ? GOLD
    : isStandard
      ? colors.primary
      : colors.border;

  const verifiedColor = isVerified ? colors.success : colors.muted;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <View
            style={[
              styles.imageWrapper,
              {
                borderColor: avatarBorderColor,
                borderWidth: isPro ? 3 : isStandard ? 2 : 1.5,
                backgroundColor: colors.card,
                shadowColor: "#000",
                shadowOpacity: theme === "dark" ? 0.2 : 0.06,
                elevation: isPro ? 6 : 3,
              },
            ]}
          >
            <Image
              source={
                profileImage
                  ? { uri: profileImage }
                  : require("@/assets/images/adaptive-icon.png")
              }
              style={styles.image}
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.editIcon,
              {
                backgroundColor: colors.primary,
                borderColor: colors.background,
              },
            ]}
            onPress={() => setModalVisible(true)}
          >
            <MaterialIcons name="camera-alt" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text
              style={[styles.name, { color: nameColor }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {name}
            </Text>

            {isPro && (
              <MaterialCommunityIcons
                name="crown"
                size={20}
                color={GOLD}
                style={styles.inlineIcon}
              />
            )}

            {isStandard && (
              <MaterialCommunityIcons
                name="shield-check"
                size={18}
                color={colors.success}
                style={styles.inlineIcon}
              />
            )}
          </View>

          {(isPro || isStandard) && (
            <View style={styles.membershipRow}>
              {isPro && (
                <View
                  style={[
                    styles.badge,
                    styles.proBadge,
                    {
                      backgroundColor: colors.accent,
                      borderColor: GOLD,
                    },
                  ]}
                >
                  <Text
                    style={[styles.proBadgeText, { color: GOLD_DARK }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    PRO MEMBER
                  </Text>
                </View>
              )}

              {isStandard && (
                <View
                  style={[
                    styles.badge,
                    styles.standardBadge,
                    {
                      backgroundColor: `${colors.success}14`,
                      borderColor: `${colors.success}40`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.standardBadgeText,
                      { color: colors.success },
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    STANDARD MEMBER
                  </Text>
                </View>
              )}
            </View>
          )}

          {!!phone && (
            <View style={styles.phoneRow}>
              <Text
                style={[styles.phoneText, { color: colors.muted }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {phone}
              </Text>
              <MaterialIcons
                name="verified"
                size={14}
                color={verifiedColor}
                style={styles.phoneIcon}
              />
            </View>
          )}
        </View>
      </View>

      <Modal
        transparent
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.card,
                borderTopColor: colors.border,
              },
            ]}
          >
            <View
              style={[styles.modalHandle, { backgroundColor: colors.border }]}
            />

            <View style={styles.modalActions}>
              <ModalActionButton
                text="Upload New Photo"
                icon="add-a-photo"
                color={colors.primary}
                onPress={handleUpload}
                loading={loadingUpload}
              />

              {profileImage && (
                <ModalActionButton
                  text="Remove Photo"
                  icon="delete"
                  color={colors.danger}
                  onPress={handleDelete}
                  loading={loadingDelete}
                />
              )}

              <ModalActionButton
                text="Cancel"
                icon="close"
                color={colors.muted}
                onPress={() => setModalVisible(false)}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 18,
  },

  content: {
    alignItems: "center",
    justifyContent: "center",
  },

  imageContainer: {
    position: "relative",
    marginBottom: 18,
  },

  imageWrapper: {
    padding: 4,
    borderRadius: 999,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
  },

  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE / 2,
  },

  editIcon: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
  },

  infoContainer: {
    width: "100%",
    alignItems: "center",
    gap: 10,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    maxWidth: "92%",
  },

  name: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
    letterSpacing: -0.3,
    textAlign: "center",
    maxWidth: "88%",
  },

  inlineIcon: {
    marginLeft: 8,
  },

  membershipRow: {
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  badge: {
    minHeight: 34,
    minWidth: 134,
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  proBadge: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },

  proBadgeText: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "800",
    letterSpacing: 0.3,
    flexShrink: 0,
  },

  standardBadge: {},

  standardBadgeText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    flexShrink: 0,
  },

  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    maxWidth: "90%",
  },

  phoneText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    textAlign: "center",
  },

  phoneIcon: {
    marginLeft: 6,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "#00000066",
    justifyContent: "flex-end",
  },

  modalContent: {
    width: "100%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 32,
    borderTopWidth: 1,
  },

  modalHandle: {
    width: 42,
    height: 5,
    borderRadius: 999,
    alignSelf: "center",
    marginBottom: 18,
  },

  modalActions: {
    gap: 10,
  },
});

export default ProfileHeader;
