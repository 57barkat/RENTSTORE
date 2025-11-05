import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

interface PhotosStepProps {
  formData: any;
  setFormData: (data: any) => void;
}

const PhotosStep: React.FC<PhotosStepProps> = ({ formData, setFormData }) => {
  const photos = formData.photos || [];

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri);
      setFormData({ ...formData, photos: [...photos, ...uris] });
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.uploadBtn} onPress={pickImages}>
        <Text style={{ color: "#fff" }}>+ Upload Photos ({photos.length})</Text>
      </TouchableOpacity>

      <ScrollView horizontal style={{ marginTop: 10 }}>
        {photos.map((uri: string, i: number) => (
          <Image
            key={i}
            source={{ uri }}
            style={{
              width: 100,
              height: 100,
              marginRight: 10,
              borderRadius: 8,
            }}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default PhotosStep;

const styles = StyleSheet.create({
  container: { padding: 10 },
  uploadBtn: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: "center",
  },
});
