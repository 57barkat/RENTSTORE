import React, { useState, useRef } from "react";
import { View, Image, Dimensions, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import ImageViewing from "react-native-image-viewing";

const { width } = Dimensions.get("window");

interface ImageCarouselProps {
  images: { uri: string }[];
}

export default function ImageCarousel({ images = [] }: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const flatListRef = useRef<FlatList<any>>(null);

  if (!images || images.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={images}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => { setActiveIndex(index); setVisible(true); }}>
            <Image source={item} style={styles.image} />
          </TouchableOpacity>
        )}
      />

      <View style={styles.dotContainer}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index === activeIndex ? styles.activeDot : null]}
          />
        ))}
      </View>

      <ImageViewing
        images={images}
        imageIndex={activeIndex}
        visible={visible}
        onRequestClose={() => setVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 10, height: 200 },
  image: { width, height: 200, resizeMode: "cover", borderRadius: 8 },
  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    position: "absolute",
    bottom: 10,
    width: "100%",
  },
  dot: { height: 8, width: 8, borderRadius: 4, backgroundColor: "#ccc", margin: 5 },
  activeDot: { backgroundColor: "#4F46E5", width: 16 },
});
