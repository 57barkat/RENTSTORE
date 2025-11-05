import React, { useState, useContext } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { FontAwesome } from "@expo/vector-icons";
import { FormContext } from "@/contextStore/HostelFormContext";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import ConfirmationModal from "@/components/ConfirmDialog";

const { width } = Dimensions.get("window");
const imageSize = (width - 40) / 3;

const Step7Photos = () => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const context = useContext(FormContext);
  if (!context)
    throw new Error("Step7Photos must be inside HostelFormProvider");
  const { data, updateForm } = context;

  const [selectedImages, setSelectedImages] = useState<string[]>(
    data.photos?.filter(
      (photo): photo is string => typeof photo === "string"
    ) ?? []
  );
  const [loading, setLoading] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");

  const MIN_PHOTOS_REQUIRED = 5;
  const photosCount = selectedImages.length;

  const handleAddPhotos = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setConfirmMessage(
        "You need to grant media library access to upload photos."
      );
      setConfirmVisible(true);
      return;
    }

    setLoading(true);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    setLoading(false);

    if (!result.canceled && result.assets?.length > 0) {
      const newUris = result.assets.map((asset) => asset.uri);
      const updatedUris = [...selectedImages, ...newUris];
      setSelectedImages(updatedUris);
      updateForm("photos", updatedUris as (string | File)[]);
    }
  };

  const handleRemovePhoto = (uriToRemove: string) => {
    const updatedUris = selectedImages.filter((uri) => uri !== uriToRemove);
    setSelectedImages(updatedUris);
    updateForm("photos", updatedUris as (string | File)[]);
  };

  const renderImageItem = ({ item }: { item: string }) => (
    <View style={styles.imageContainer}>
      <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemovePhoto(item)}
      >
        <View style={styles.removeIconBackground}>
          <Text style={styles.removeIconText}>X</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <FlatList
        data={selectedImages}
        renderItem={renderImageItem}
        keyExtractor={(item) => item}
        numColumns={3}
        contentContainerStyle={styles.imageGridContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: currentTheme.text }]}>
              Add some photos of your house
            </Text>
            <Text style={[styles.subtitle, { color: currentTheme.text }]}>
              You&apos;ll need {MIN_PHOTOS_REQUIRED} photos to get started. You
              can add more or make changes later.
            </Text>
            <TouchableOpacity
              onPress={handleAddPhotos}
              style={[
                styles.uploadButton,
              ]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={currentTheme.text} />
              ) : (
                <>
                  <FontAwesome
                    name="camera"
                    size={24}
                    color={currentTheme.border}
                  />
                  <Text
                    style={[styles.addButtonText, { color: currentTheme.border }]}
                  >
                    {photosCount > 0 ? "Add more photos" : "Add photos"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
            {photosCount > 0 && (
              <Text style={[styles.statusText, { color: currentTheme.text }]}>
                {photosCount} / {MIN_PHOTOS_REQUIRED} photos added
              </Text>
            )}
          </View>
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      <ConfirmationModal
        visible={confirmVisible}
        title="Permission Required"
        message={confirmMessage}
        confirmText="OK"
        cancelText="Cancel"
        onConfirm={() => setConfirmVisible(false)}
        onCancel={() => setConfirmVisible(false)}
      />
    </>
  );
};

export default Step7Photos;

const styles = StyleSheet.create({
  headerContainer: { paddingHorizontal: 20, paddingTop: 10, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 6 },
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: 16 },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 8,
    marginBottom: 12,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EBEBEB",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#CCC",
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },

  removeIconBackground: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FF5A5F",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  removeIconText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: -1,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  uploadArea: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#ccc",
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f7f7f7",
  },
  cameraIcon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000",
  },

  // --- New Styles for Image Grid ---
  imageList: {
    flex: 1,
    marginTop: 10,
  },
  imageGridContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    width: "30%", // Approx. 3 images per row (100% / 3)
    aspectRatio: 1, // Make it a square
    margin: "1.66%", // Small margin for spacing (to make 30% * 3 = 90%)
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 15,
    padding: 2,
  },
});
