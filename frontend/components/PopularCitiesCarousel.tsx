// PopularCitiesCarousel.tsx
import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";

interface CityItem {
  name: string;
  image: string;
}

interface Props {
  onSelect: (city: string) => void;
}

const POPULAR_CITIES: CityItem[] = [
  {
    name: "Islamabad",
    image: "https://i.imgur.com/EvVJFDH.jpeg",
  },
  {
    name: "Lahore",
    image: "https://i.imgur.com/yqJyz5u.jpeg",
  },
  {
    name: "Karachi",
    image: "https://i.imgur.com/56xya8X.jpeg",
  },
];

export default function PopularCitiesCarousel({ onSelect }: Props) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text
        style={[styles.title, { color: theme === "dark" ? "white" : "black" }]}
      >
        Popular Cities
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {POPULAR_CITIES.map((city) => (
          <TouchableOpacity
            key={city.name}
            style={styles.card}
            onPress={() => onSelect(city.name)}
          >
            <Image source={{ uri: city.image }} style={styles.image} />
            <View style={styles.overlay} />
            <Text style={styles.cityName}>{city.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 15 },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  card: {
    width: 140,
    height: 90,
    marginRight: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
  overlay: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.3)",
    width: "100%",
    height: "100%",
  },
  cityName: {
    position: "absolute",
    bottom: 8,
    left: 10,
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
