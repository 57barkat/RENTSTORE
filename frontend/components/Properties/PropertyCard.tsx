import React from "react";
import { TouchableOpacity, View, Text, Image, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width: WINDOW_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (WINDOW_WIDTH - 30) / 2;
const IMAGE_HEIGHT = CARD_WIDTH * 1;

export const PropertyCard = ({ item, theme, onPress, onToggleFav }: any) => (
  <TouchableOpacity
    activeOpacity={0.9}
    style={{
      width: CARD_WIDTH,
      backgroundColor: theme.card,
      borderRadius: 16,
      marginHorizontal: 4,
      marginVertical: 4,
      marginBottom: 16,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 4,
      overflow: "hidden",
    }}
    onPress={onPress}
  >
    <View>
      <Image
        source={{ uri: item.image }}
        style={{ width: "100%", height: IMAGE_HEIGHT }}
        resizeMode="cover"
      />
      {item.featured && (
        <View
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 6,
            backgroundColor: theme.secondary,
            zIndex: 10,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 9, fontWeight: "500" }}>
            FEATURED
          </Text>
        </View>
      )}
      <TouchableOpacity
        activeOpacity={0.7}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          backgroundColor: "rgba(255,255,255,0.9)",
          borderRadius: 20,
          padding: 6,
          zIndex: 20,
        }}
        onPress={() => onToggleFav(item.id)}
      >
        <Ionicons
          name={item.isFav ? "heart" : "heart-outline"}
          size={20}
          color={item.isFav ? theme.danger : "#11181C"}
        />
      </TouchableOpacity>
    </View>

    <View style={{ padding: 12 }}>
      <Text
        style={{
          fontSize: 11,
          fontWeight: "700",
          color: theme.primary,
          textTransform: "uppercase",
          marginBottom: 2,
        }}
      >
        {item.city}
      </Text>
      <Text
        style={{
          fontSize: 15,
          fontWeight: "600",
          color: theme.text,
          marginBottom: 8,
        }}
        numberOfLines={1}
      >
        {item.title}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "baseline" }}>
        <Text style={{ fontSize: 16, fontWeight: "800", color: theme.text }}>
          Rs. {item.rent?.toLocaleString()}
        </Text>
        <Text style={{ fontSize: 12, color: theme.muted }}> /mo</Text>
      </View>
    </View>
  </TouchableOpacity>
);
