import React, { useState } from "react";
import {
  View,
  Image,
  Dimensions,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from "react-native";
import ImageViewing from "react-native-image-viewing";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import GalleryModal from "./GalleryView";

const { width } = Dimensions.get("window");

interface MediaItem {
  id: string;
  uri: string;
  type: "image" | "video";
}

interface ImageCarouselProps {
  media: MediaItem[];
  height?: number;
  borderRadius?: number;
  overlayContent?: React.ReactNode;
  counterPlacement?: "top-right" | "bottom-right";
  topInset?: number;
  overlayPlacement?: "top-left" | "bottom-left";
}

export default function ImageCarousel({
  media = [],
  height = 250,
  borderRadius = 0,
  overlayContent,
  counterPlacement = "bottom-right",
  topInset = 0,
  overlayPlacement = "top-left",
}: ImageCarouselProps) {
  const { theme } = useTheme();
  const currentTheme = Colors[theme];
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  if (!media || media.length === 0) return null;

  const openGallery = (index: number) => {
    setActiveIndex(index);
    setVisible(true);
  };

  /**
   * Custom Header for the Image Viewer
   * This replaces the default close button with your own CSS-styled version
   */
  const ImageHeader = () => (
    <SafeAreaView style={styles.headerContainer}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setVisible(false)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="close" size={26} color="black" />
      </TouchableOpacity>
    </SafeAreaView>
  );

  return (
    <View style={[styles.container, { height, borderRadius }]}>
      <FlatList
        data={media}
        keyExtractor={(item, index) => item.id || `${item.uri}-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => openGallery(index)}
          >
            {item.type === "image" ? (
              <Image
                source={{ uri: item.uri }}
                style={[styles.media, { height }]}
              />
            ) : (
              <View style={styles.videoContainer}>
                <Image
                  source={{ uri: item.uri + "?vframe/jpg" }}
                  style={[styles.media, { height }]}
                />
                <MaterialCommunityIcons
                  name="play-circle-outline"
                  size={50}
                  color="#fff"
                  style={styles.playIcon}
                />
              </View>
            )}
          </TouchableOpacity>
        )}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(newIndex);
        }}
      />

      <View style={styles.scrim} pointerEvents="none" />

      {overlayContent ? (
        <View
          style={[
            styles.overlay,
            overlayPlacement === "bottom-left"
              ? styles.overlayBottomLeft
              : { top: Math.max(topInset + 10, 18) },
          ]}
        >
          {overlayContent}
        </View>
      ) : null}

      <TouchableOpacity
        style={[
          styles.counterContainer,
          counterPlacement === "top-right"
            ? styles.counterTopRight
            : styles.counterBottomRight,
          counterPlacement === "top-right"
            ? { top: Math.max(topInset + 10, 18) }
            : null,
          { backgroundColor: currentTheme.card },
        ]}
        onPress={() => setGalleryVisible(true)}
      >
        <Text style={[styles.counterText, { color: currentTheme.text }]}>
          {activeIndex + 1}/{media.length}
        </Text>
      </TouchableOpacity>

      <ImageViewing
        images={media
          .filter((m) => m.type === "image")
          .map((m) => ({ uri: m.uri }))}
        imageIndex={activeIndex}
        visible={visible && media[activeIndex]?.type === "image"}
        onRequestClose={() => setVisible(false)}
        backgroundColor={currentTheme.background}
        // Custom Header implementation here
        HeaderComponent={ImageHeader}
        // Allows closing by swiping down
        swipeToCloseEnabled={true}
      />

      <GalleryModal
        visible={galleryVisible}
        images={media}
        onClose={() => setGalleryVisible(false)}
        onImagePress={(index) => openGallery(index)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: "hidden" },
  media: { width, resizeMode: "cover" },
  videoContainer: { position: "relative" },
  playIcon: { position: "absolute", top: "40%", left: "40%" },
  scrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 132,
    backgroundColor: "rgba(15, 23, 42, 0.28)",
  },
  counterContainer: {
    position: "absolute",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  counterTopRight: {
    right: 18,
  },
  counterBottomRight: {
    bottom: 15,
    right: 15,
  },
  counterText: { fontWeight: "bold" },
  overlay: {
    position: "absolute",
    left: 18,
    right: 18,
    zIndex: 2,
  },
  overlayBottomLeft: {
    top: undefined,
    bottom: 18,
    right: undefined,
  },

  // Custom Close Button "CSS"
  headerContainer: {
    width: "100%",
    alignItems: "flex-end", // Aligns button to the right
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  closeButton: {
    width: 60,
    height: 60,
    borderRadius: 20,
    marginTop: 30,
    // backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark circle for contrast
    justifyContent: "center",
    alignItems: "center",
  },
});
