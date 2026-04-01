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
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = width * 0.28; // Adjusted size to match image scale

interface ProfileHeaderProps {
  profileImage?: string | null;
  name: string;
  phone?: string;
  listingsCount?: number; // Added for stats
  savedCount?: number; // Added for stats
  rating?: number; // Added for stats
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
  listingsCount = 0,
  savedCount = 0,
  rating = 0,
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.imageContainer}>
        <View
          style={[styles.imageWrapper, { borderColor: colors.primary + "30" }]}
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
          style={[styles.editIcon, { backgroundColor: colors.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons name="camera-alt" size={16} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.name, { color: colors.secondary }]}>{name}</Text>
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
            color={isVerified ? colors.primary : colors.secondary + "40"}
            style={{ marginLeft: 4 }}
          />
        </View>
      </View>

      {/* Stats Row Section */}
      {/* <View
        style={[styles.statsContainer, { borderTopColor: colors.card + "50" }]}
      >
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: colors.secondary }]}>
            {listingsCount}
          </Text>
          <Text style={[styles.statLabel, { color: colors.secondary + "80" }]}>
            Listings
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.card }]} />
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: colors.secondary }]}>
            {savedCount}
          </Text>
          <Text style={[styles.statLabel, { color: colors.secondary + "80" }]}>
            Saved
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.card }]} />
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: colors.secondary }]}>
            {rating}
          </Text>
          <Text style={[styles.statLabel, { color: colors.secondary + "80" }]}>
            Rating
          </Text>
        </View>
      </View> */}

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
  container: {
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 12,
  },
  imageWrapper: {
    padding: 2,
    borderWidth: 1,
    borderRadius: (IMAGE_SIZE + 10) / 2,
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE / 2,
  },
  editIcon: {
    position: "absolute",
    bottom: 2,
    right: 2,
    borderRadius: 15,
    padding: 6,
    borderWidth: 2,
    borderColor: "white",
  },
  infoContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  name: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 2,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  phoneText: {
    fontSize: 14,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    width: "100%",
    paddingVertical: 15,
    borderTopWidth: 1,
    justifyContent: "space-around",
    alignItems: "center",
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: "60%",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#00000080",
    justifyContent: "flex-end",
  },
  modalContent: {
    width: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
});

export default ProfileHeader;
