import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";

export const pickImageFromGallery = async (): Promise<FormData | null> => {
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

      return formData;
    }
    return null;
  } catch (err) {
    Toast.show({ type: "error", text1: "Image pick failed" });
    return null;
  }
};
