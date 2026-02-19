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

import Toast from "react-native-toast-message";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";

type ImageUriArray = string[];

const HostelPhotosScreen: FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  // --- Context Consumption ---
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("HostelPhotosScreen must be used within a FormProvider");
  }
  const { data, updateForm } = context;

  // --- State Initialization ---
  const [selectedImages, setSelectedImages] = useState<ImageUriArray>(
    data.photos || [],
  );
  const [loading, setLoading] = useState(false);

  // --- Image Picker Function ---
  const handleAddPhotos = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Permission required",
        text2:
          "You need to grant media library access to upload hostel photos.",
      });
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
      updateForm("photos" as keyof FormData, updatedUris);
    }
  };

  // --- Image Removal Function ---
  const handleRemovePhoto = (uriToRemove: string) => {
    const updatedUris = selectedImages.filter((uri) => uri !== uriToRemove);
    setSelectedImages(updatedUris);
    updateForm("photos" as keyof FormData, updatedUris);

    Toast.show({
      type: "info",
      text1: "Photo removed",
      text2: `${updatedUris.length} photos remaining`,
    });
  };

  // --- Navigation & Validation ---
  const handleNext = () => {
    const MIN_PHOTOS_REQUIRED = 5;
    if (selectedImages.length < MIN_PHOTOS_REQUIRED) {
      Toast.show({
        type: "error",
        text1: "Not enough photos",
        text2: `Please add at least ${MIN_PHOTOS_REQUIRED} photos to continue.`,
      });
      return;
    }
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
      <Text style={[styles.subtitle, { color: currentTheme.text }]}>
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
            Loading images...
          </Text>
        </View>
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

      <Toast />
    </StepContainer>
  );
};

export default HostelPhotosScreen;
