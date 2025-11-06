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
import {
  HostelFormContext,
  HostelFormData,
} from "@/contextStore/HostelFormContext";

type ImageUriArray = string[];

const HostelPhotosScreen: FC = () => {
  const router = useRouter();

  // --- Context Consumption ---
  const context = useContext(HostelFormContext);
  if (!context) {
    throw new Error(
      "HostelPhotosScreen must be used within a HostelFormProvider"
    );
  }
  const { data, updateForm } = context;

  // --- State Initialization ---
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
        "You need to grant media library access to upload hostel photos."
      );
      return;
    }

    setLoading(true);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    setLoading(false);

    if (!result.canceled) {
      const newUris = result.assets.map((asset) => asset.uri);
      const updatedUris = [...selectedImages, ...newUris];

      setSelectedImages(updatedUris);
      updateForm("photos" as keyof HostelFormData, updatedUris);
    }
  };

  // --- Image Removal Function ---
  const handleRemovePhoto = (uriToRemove: string) => {
    setSelectedImages((prev) => {
      const updatedUris = prev.filter((uri) => uri !== uriToRemove);
      updateForm("photos" as keyof HostelFormData, updatedUris);
      return updatedUris;
    });
  };

  // --- Navigation & Validation ---
  const handleNext = () => {
    router.push("/upload/hostelForm/ListingTitleScreen" as `${string}:param`);
  };

  const MIN_PHOTOS_REQUIRED = 5;
  const isNextDisabled = selectedImages.length < MIN_PHOTOS_REQUIRED;
  const photosCount = selectedImages.length;

  // --- Render Functions ---
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
      title="Add some photos of your hostel"
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
            ? "Add more hostel photos"
            : "Add hostel photos"}
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
    </StepContainer>
  );
};

export default HostelPhotosScreen;
