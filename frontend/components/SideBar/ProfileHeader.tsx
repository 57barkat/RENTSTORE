import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = width * 0.35;

interface ProfileHeaderProps {
  profileImage?: string | null;
  name: string;
  phone?: string;
  uploads: number;
  favorites: number;
  theme: "light" | "dark";
  onUpload: (file: FormData) => Promise<void>;
  onDelete: () => Promise<void>;
  loadingUpload?: boolean; // new
  loadingDelete?: boolean; // new
}

const StatBox = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <View style={styles.statBox}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profileImage,
  name,
  phone,
  uploads,
  favorites,
  theme,
  onUpload,
  onDelete,
  loadingUpload = false,
  loadingDelete = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const primaryColor = Colors[theme].primary;
  const secondaryColor = Colors[theme].secondary;
  const textColor = Colors[theme].secondary;

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length) {
        const file = result.assets[0];
        const formData = new FormData();
        formData.append("file", {
          uri: file.uri,
          name: "profile.jpg",
          type: "image/jpeg",
        } as any);

        await onUpload(formData);
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Upload Failed",
      });
    } finally {
      setModalVisible(false);
    }
  };

  const handleDeleteImage = async () => {
    try {
      await onDelete();
    } catch {
      Toast.show({
        type: "error",
        text1: "Delete Failed",
      });
    } finally {
      setModalVisible(false);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={
            profileImage
              ? { uri: profileImage }
              : require("@/assets/images/adaptive-icon.png")
          }
          style={styles.image}
        />
        <TouchableOpacity
          style={[styles.editIcon, { backgroundColor: primaryColor }]}
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons name="camera-alt" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.name, { color: textColor }]}>{name}</Text>
        {phone && (
          <View style={styles.phoneRow}>
            <MaterialIcons name="phone" size={16} color={secondaryColor} />
            <Text style={[styles.phoneText, { color: secondaryColor }]}>
              {phone}
            </Text>
          </View>
        )}
      </View>

      <View
        style={[styles.statsContainer, { borderColor: secondaryColor + "20" }]}
      >
        <StatBox label="Uploads" value={uploads} color={textColor} />
        <StatBox label="Favorites" value={favorites} color={textColor} />
      </View>

      {/* Modal for Upload/Delete */}
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
          <View
            style={[
              styles.modalContent,
              { backgroundColor: Colors[theme].card },
            ]}
          >
            <TouchableOpacity
              style={[styles.modalButton, loadingUpload && { opacity: 0.6 }]}
              onPress={handlePickImage}
              disabled={loadingUpload}
            >
              {loadingUpload ? (
                <ActivityIndicator size="small" color={primaryColor} />
              ) : (
                <>
                  <MaterialIcons
                    name="add-a-photo"
                    size={24}
                    color={primaryColor}
                  />
                  <Text
                    style={[styles.modalButtonText, { color: primaryColor }]}
                  >
                    Upload New Photo
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {profileImage && (
              <TouchableOpacity
                style={[styles.modalButton, loadingDelete && { opacity: 0.6 }]}
                onPress={handleDeleteImage}
                disabled={loadingDelete}
              >
                {loadingDelete ? (
                  <ActivityIndicator
                    size="small"
                    color={Colors[theme].danger}
                  />
                ) : (
                  <>
                    <MaterialIcons
                      name="delete"
                      size={24}
                      color={Colors[theme].danger}
                    />
                    <Text
                      style={[
                        styles.modalButtonText,
                        { color: Colors[theme].danger },
                      ]}
                    >
                      Remove Photo
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.cancelButton,
                { borderColor: secondaryColor + "20" },
              ]}
              onPress={() => setModalVisible(false)}
            >
              <Text
                style={[
                  styles.modalButtonText,
                  { color: secondaryColor, fontWeight: "600" },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  imageContainer: { position: "relative", marginBottom: 15 },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE / 2,
    borderWidth: 4,
    borderColor: "white",
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
  infoContainer: { alignItems: "center", marginBottom: 20 },
  name: { fontWeight: "800", fontSize: 24, marginBottom: 4 },
  phoneRow: { flexDirection: "row", alignItems: "center" },
  phoneText: { marginLeft: 4, fontSize: 14 },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderWidth: 1,
  },
  statBox: { alignItems: "center", minWidth: 80 },
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 12, color: "#777", marginTop: 2 },
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
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  modalButtonText: { fontSize: 16, marginLeft: 15 },
  cancelButton: {
    marginTop: 10,
    justifyContent: "center",
    borderTopWidth: 1,
    paddingTop: 20,
  },
});

export default ProfileHeader;
