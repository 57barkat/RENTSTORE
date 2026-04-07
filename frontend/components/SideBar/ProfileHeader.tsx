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
import { getColors } from "@/utils/themeUtils";
import Toast from "react-native-toast-message";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

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
  const colors = getColors(theme);

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

  const GOLD = "#EAB308";
  const GOLD_DARK = "#B45309";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.imageContainer}>
        <View
          style={[
            styles.imageWrapper,
            {
              borderColor: isPro
                ? GOLD
                : isStandard
                  ? colors.primary
                  : colors.primary + "30",
              borderWidth: isPro || isStandard ? 3 : 1.5,
              shadowColor: isPro ? GOLD : "transparent",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: isPro ? 0.6 : 0,
              shadowRadius: 12,
              elevation: isPro ? 8 : 0,
              backgroundColor: colors.card,
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
          style={[
            styles.editIcon,
            { backgroundColor: isPro ? GOLD : colors.primary },
          ]}
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons
            name="camera-alt"
            size={16}
            color={isPro ? "black" : "white"}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text
            style={[
              styles.name,
              {
                color: isPro
                  ? theme === "dark"
                    ? "#FDE047"
                    : GOLD_DARK
                  : colors.secondary,
              },
            ]}
          >
            {name}
          </Text>
          {isPro && (
            <MaterialCommunityIcons
              name="crown"
              size={26}
              color={GOLD}
              style={styles.badgeIcon}
            />
          )}
          {isStandard && (
            <MaterialCommunityIcons
              name="shield-check"
              size={22}
              color={colors.primary}
              style={styles.badgeIcon}
            />
          )}
        </View>

        {isPro && (
          <View style={[styles.proBadge, { backgroundColor: GOLD }]}>
            <Text style={styles.proBadgeText}>PRO MEMBER</Text>
          </View>
        )}

        {isStandard && (
          <View
            style={[
              styles.standardBadge,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Text style={[styles.standardBadgeText, { color: colors.primary }]}>
              STANDARD MEMBER
            </Text>
          </View>
        )}

        <View style={styles.phoneRow}>
          {phone && (
            <Text
              style={[styles.phoneText, { color: colors.secondary + "99" }]}
            >
              {phone}
            </Text>
          )}
          <MaterialIcons
            name="verified"
            size={14}
            color={
              isPro
                ? colors.primary
                : isVerified
                  ? colors.primary
                  : colors.secondary + "40"
            }
            style={{ marginLeft: 4 }}
          />
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
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
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
              color={colors.secondary}
              onPress={() => setModalVisible(false)}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingTop: 40, paddingHorizontal: 20 },
  imageContainer: { position: "relative", marginBottom: 12 },
  imageWrapper: { padding: 4, borderRadius: 100 },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE / 2,
  },
  editIcon: {
    position: "absolute",
    bottom: 4,
    right: 4,
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: "white",
  },
  infoContainer: { alignItems: "center", marginBottom: 25 },
  nameRow: { flexDirection: "row", alignItems: "center" },
  name: { fontWeight: "900", fontSize: 24, letterSpacing: -0.5 },
  badgeIcon: { marginLeft: 8 },
  proBadge: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "black",
    letterSpacing: 1.5,
  },
  standardBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  standardBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  phoneRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  phoneText: { fontSize: 14, fontWeight: "500" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#00000080",
    justifyContent: "flex-end",
  },
  modalContent: {
    width: "100%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
  },
});

export default ProfileHeader;
