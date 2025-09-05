import React, { useState } from "react";
import { View, Image, Dimensions, FlatList, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

interface ImageCarouselProps {
  images: { uri: string }[];
}

export default function ImageCarousel({ images }: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: any) => {
    const slide = Math.ceil(
      event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width
    );
    if (slide !== activeIndex) setActiveIndex(slide);
  };

  if (!images || images.length === 0) {
    return (
      <Image
        source={{
          uri: "https://via.placeholder.com/400x200?text=No+Image",
        }}
        style={styles.image}
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={images}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        renderItem={({ item }) => <Image source={item} style={styles.image} />}
      />

      <View style={styles.dotContainer}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index === activeIndex ? styles.activeDot : null]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    height: 200,
  },
  image: {
    width: width,
    height: 200,
    resizeMode: "cover",
    borderRadius: 8,
  },
  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    position: "absolute",
    bottom: 10,
    width: "100%",
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    margin: 5,
  },
  activeDot: {
    backgroundColor: "#4F46E5",
    width: 16,
  },
});
