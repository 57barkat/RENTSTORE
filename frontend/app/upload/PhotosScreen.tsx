import React, { useState, FC, useContext } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import StepContainer from "@/app/upload/Welcome";
import { styles } from "@/styles/PhotosScreen";
import { FontAwesome } from "@expo/vector-icons";
import { FormContext, FormData } from "@/contextStore/FormContext"; 
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import ConfirmationModal from "@/components/ConfirmDialog";

type ImageUriArray = string[];

const PhotosScreen: FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const context = useContext(FormContext);
  if (!context) {
    throw new Error("PhotosScreen must be used within a FormProvider");
  }
  const { data, updateForm } = context;

  const [selectedImages, setSelectedImages] = useState<ImageUriArray>(
    data.photos || []
  );
  const [loading, setLoading] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false); // modal visibility
  const [confirmMessage, setConfirmMessage] = useState(""); // dynamic message

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

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    setLoading(false);

    if (!result.canceled) {
      const newUris = result.assets.map((asset) => asset.uri);
      const updatedUris = [...selectedImages, ...newUris];

      setSelectedImages(updatedUris);
      updateForm("photos" as keyof FormData, updatedUris);
    }
  };

  const handleRemovePhoto = (uriToRemove: string) => {
    setSelectedImages((prev) => {
      const updatedUris = prev.filter((uri) => uri !== uriToRemove);
      updateForm("photos" as keyof FormData, updatedUris);
      return updatedUris;
    });
  };

  const handleNext = () => {
    router.push("/upload/ListingTitleScreen");
  };

  const MIN_PHOTOS_REQUIRED = 5;
  const isNextDisabled = selectedImages.length < MIN_PHOTOS_REQUIRED;
  const photosCount = selectedImages.length;

  const renderImageItem = ({ item }: { item: string }) => (
    <View style={styles.imageContainer}>
      <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemovePhoto(item)}
      >
        <FontAwesome name="times-circle" size={24} color="#FF5A5F" />
      </TouchableOpacity>
    </View>
  );

  return (
    <StepContainer
      title="Add some photos of your house"
      onNext={handleNext}
      isNextDisabled={isNextDisabled}
      progress={40}
    >
      <Text style={styles.subtitle}>
        You&apos;ll need {MIN_PHOTOS_REQUIRED} photos to get started. You can
        add more or make changes later.
      </Text>

      <TouchableOpacity
        onPress={handleAddPhotos}
        style={styles.uploadButton}
        disabled={loading}
      >
        <FontAwesome name="camera" size={30} color="#000" />
        <Text style={styles.addButtonText}>
          {loading
            ? "Loading..."
            : photosCount > 0
            ? "Add more photos"
            : "Add photos"}
        </Text>
      </TouchableOpacity>

      {photosCount > 0 && (
        <Text style={styles.statusText}>
          {photosCount} / {MIN_PHOTOS_REQUIRED} photos added
        </Text>
      )}

      <FlatList
        data={selectedImages}
        renderItem={renderImageItem}
        keyExtractor={(item) => item}
        numColumns={3}
        style={styles.imageList}
        contentContainerStyle={styles.imageGridContent}
        showsVerticalScrollIndicator={false}
      />

      {loading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "#fff", marginTop: 10, fontSize: 16 }}>
            Loading...
          </Text>
        </View>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={confirmVisible}
        title="Permission Required"
        message={confirmMessage}
        confirmText="OK"
        cancelText="Cancel"
        onConfirm={() => setConfirmVisible(false)}
        onCancel={() => setConfirmVisible(false)}
      />
    </StepContainer>
  );
};

export default PhotosScreen;
