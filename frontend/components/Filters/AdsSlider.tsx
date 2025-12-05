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
} from "react-native";

const WINDOW_WIDTH = Dimensions.get("window").width || 1;
const ITEM_WIDTH = WINDOW_WIDTH * 0.9;
const ITEM_HEIGHT = 130;

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
  // {
  //   id: "2",
  //   image:
  //     "https://media.istockphoto.com/id/1492180527/photo/digital-marketing-commerce-online-sale-concept-promotion-of-products-or-services-through.jpg?b=1&s=612x612&w=0&k=20&c=ZgJZYQJ5L5XWUsMjdDWZBQFgIZwArLpKkpwNKDMAMHQ=",
  //   title: "Reach Customers Everywhere",
  // },
];

const AdsSlider: React.FC<AdsSliderProps> = ({ ads = defaultAds }) => {
  const { theme } = useTheme();
  const currentColors = Colors[theme];

  return (
    <View style={styles.container}>
      {/* <Text style={[styles.heading, { color: currentColors.text }]}> */}
      {/* Advertisements */}
      {/* </Text> */}
      <FlatList
        data={ads}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: (WINDOW_WIDTH - ITEM_WIDTH) / 2,
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={{ uri: item.image }} style={styles.image} />
            {item.title && (
              <Text
                style={[
                  styles.title,
                  {
                    color:
                      currentColors.text === "dark" ? "#cec8c8" : "#443d3d",
                  },
                ]}
              >
                {item.title}
              </Text>
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  slide: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    marginRight: 16,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    justifyContent: "flex-end",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  title: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    fontSize: 16,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});

export default AdsSlider;
