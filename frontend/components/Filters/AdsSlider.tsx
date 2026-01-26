import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contextStore/ThemeContext";
import React from "react";
import {
  View,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
  Text,
  Platform,
} from "react-native";

const WINDOW_WIDTH = Dimensions.get("window").width;
const ITEM_WIDTH = WINDOW_WIDTH * 0.88; // Slightly narrower for a peek at the next slide
const ITEM_HEIGHT = 150; // Increased height for a more "cinematic" feel

interface AdsSliderProps {
  ads?: { id: string; image: string; title?: string }[];
}

const defaultAds = [
  {
    id: "1",
    image:
      "https://media.istockphoto.com/id/2098359215/photo/digital-marketing-concept-businessman-using-laptop-with-ads-dashboard-digital-marketing.jpg?b=1&s=612x612&w=0&k=20&c=r6mLg7o-249vf1oBLWdhlE5Ko5AN9mZhRxl-HK8anU4=",
    title: "Boost Your Business Online",
  },
  {
    id: "2",
    image:
      "https://media.istockphoto.com/id/1492180527/photo/digital-marketing-commerce-online-sale-concept-promotion-of-products-or-services-through.jpg?b=1&s=612x612&w=0&k=20&c=ZgJZYQJ5L5XWUsMjdDWZBQFgIZwArLpKkpwNKDMAMHQ=",
    title: "Reach Customers Everywhere",
  },
];

const AdsSlider: React.FC<AdsSliderProps> = ({ ads = defaultAds }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <View style={styles.container}>
      <FlatList
        data={ads}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH + 16}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: (WINDOW_WIDTH - ITEM_WIDTH) / 2,
        }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.slide,
              {
                backgroundColor: isDark ? "#1A1A1E" : "#F3F4F6",
                borderColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.05)",
                borderWidth: 1,
              },
            ]}
          >
            <Image source={{ uri: item.image }} style={styles.image} />

            {/* Premium Overlay Gradient simulated with a view */}
            <View style={styles.textOverlay}>
              {item.title && (
                <View
                  style={[
                    styles.titleContainer,
                    {
                      backgroundColor: isDark
                        ? "rgba(0,0,0,0.5)"
                        : "rgba(255,255,255,0.75)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.title,
                      { color: isDark ? "#FFFFFF" : "#1F2937" },
                    ]}
                  >
                    {item.title}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 18,
  },
  slide: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    marginRight: 16,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  textOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  titleContainer: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
});

export default AdsSlider;
