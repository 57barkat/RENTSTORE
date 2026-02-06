import React from "react";
import {
  Modal,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  View,
  Text,
} from "react-native";
const { width } = Dimensions.get("window");
interface GalleryModalProps {
  visible: boolean;
  images: { uri: string }[];
  onClose: () => void;
  onImagePress: (index: number) => void;
}
export default function GalleryModal({
  visible,
  images,
  onClose,
  onImagePress,
}: GalleryModalProps) {
  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>All Images</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={images}
          keyExtractor={(_, index) => index.toString()}
          numColumns={3}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => {
                onImagePress(index);
                onClose();
              }}
            >
              <Image source={item} style={styles.image} />
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  modalContainer: { flex: 1, paddingTop: 50, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  title: { fontSize: 20, fontWeight: "bold" },
  closeButton: { fontSize: 25, fontWeight: "bold" },
  image: {
    width: width / 3 - 10,
    height: width / 3 - 10,
    margin: 5,
    borderRadius: 8,
  },
});


