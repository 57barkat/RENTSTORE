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
const IMAGE_SIZE = width * 0.35;

interface ProfileHeaderProps {
  profileImage?: string | null;
  name: string;
  phone?: string;
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
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, borderBottomColor: colors.card },
      ]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={
            profileImage
              ? { uri: profileImage }
              : require("@/assets/images/adaptive-icon.png")
          }
          style={[styles.image, { borderColor: colors.primary }]}
        />
        <TouchableOpacity
          style={[styles.editIcon, { backgroundColor: colors.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons name="camera-alt" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.name, { color: colors.secondary }]}>{name}</Text>
        <View style={styles.phoneRow}>
          {phone && (
            <Text style={[styles.phoneText, { color: colors.secondary }]}>
              {phone}
            </Text>
          )}
          <MaterialIcons
            name="verified"
            size={12}
            color={isVerified ? colors.primary : colors.secondary + "80"}
            style={{ marginLeft: 5 }}
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
  container: {
    alignItems: "center",
    paddingTop: 30,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 15,
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE / 2,
    borderWidth: 4,
  },
  editIcon: {
    position: "absolute",
    bottom: 5,
    right: 5,
    borderRadius: 22,
    padding: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  infoContainer: {
    alignItems: "center",
  },
  name: {
    fontWeight: "800",
    fontSize: 14,
    marginBottom: 4,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  phoneText: {
    fontSize: 12,
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
