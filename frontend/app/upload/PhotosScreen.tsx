import React, { useState, FC, useContext } from "react";  
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  Alert, 
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import StepContainer from "@/app/upload/Welcome";
import { styles } from "@/styles/PhotosScreen";
import { FontAwesome } from "@expo/vector-icons";
// Assuming this path is correct:
import { FormContext, FormData } from "@/contextStore/FormContext";

type ImageUriArray = string[];

const PhotosScreen: FC = () => {
  const router = useRouter();

  // --- Context Consumption ---
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("PhotosScreen must be used within a FormProvider");
  }
  const { data, updateForm } = context;

  // --- State Initialization ---
  // Initialize local state using data.photos from the global context
  const [selectedImages, setSelectedImages] = useState<ImageUriArray>(
    data.photos || []
  );
  const [loading, setLoading] = useState(false);

  // --- Image Picker Function ---
  const handleAddPhotos = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "You need to grant media library access to upload photos."
      );
      return;
    }

    setLoading(true);

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: true,
      // allowsMultipleSelection: true,
      quality: 1,
    });

    setLoading(false);

    if (!result.canceled) {
      const newUris = result.assets.map((asset) => asset.uri);

      // Calculate the new list of URIs
      const updatedUris = [...selectedImages, ...newUris];

      // 1. Update local state
      setSelectedImages(updatedUris);

      // 2. Update global context
      updateForm("photos" as keyof FormData, updatedUris);
    }
  };

  // --- Image Removal Function ---
  const handleRemovePhoto = (uriToRemove: string) => {
    setSelectedImages((prev) => {
      const updatedUris = prev.filter((uri) => uri !== uriToRemove);

      // Update global context immediately
      updateForm("photos" as keyof FormData, updatedUris);

      return updatedUris;
    });
  };

  // --- Navigation & Validation ---
  const handleNext = () => {
    // The context is already up-to-date from the add/remove handlers
    router.push("/upload/ListingTitleScreen");
  };

  const MIN_PHOTOS_REQUIRED = 5;
  const isNextDisabled = selectedImages.length < MIN_PHOTOS_REQUIRED;
  const photosCount = selectedImages.length;

  // --- Render Functions ---
  const renderImageItem = ({ item }: { item: string }) => (
    <View style={styles.imageContainer}>
      <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />

      {/* Remove Button */}
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

      {/* Main Upload Button Area */}
      <TouchableOpacity
        onPress={handleAddPhotos}
        style={styles.uploadButton}
        disabled={loading} // Disable button while loading
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

      {/* Status Text */}
      {photosCount > 0 && (
        <Text style={styles.statusText}>
          {photosCount} / {MIN_PHOTOS_REQUIRED} photos added
        </Text>
      )}

      {/* Image Grid */}
      <FlatList
        data={selectedImages}
        renderItem={renderImageItem}
        keyExtractor={(item) => item}
        numColumns={3}
        style={styles.imageList}
        contentContainerStyle={styles.imageGridContent}
        showsVerticalScrollIndicator={false}
      />
    </StepContainer>
  );
};

export default PhotosScreen;
