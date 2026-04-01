import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { PropertySectionProps } from "@/types/TabTypes/TabTypes";
import { Ionicons } from "@expo/vector-icons";
import { FontSize } from "@/constants/Typography";

const WINDOW_WIDTH = Dimensions.get("window").width;
// Adjusted width and height to match the vertical rectangular look in the image
const ITEM_WIDTH = WINDOW_WIDTH * 0.58;
const ITEM_HEIGHT = 280;

export const PropertySection: React.FC<
  PropertySectionProps & {
    onToggleFav?: (id: string) => void;
    cardWidth?: number;
    cardHeight?: number;
  }
> = ({
  sectionTitle,
  properties,
  onViewAll,
  onCardPress,
  loading,
  onToggleFav,
  cardWidth = ITEM_WIDTH,
  cardHeight = ITEM_HEIGHT,
}) => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  return (
    <View style={{ marginVertical: 18 }}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
          {sectionTitle}
        </Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <Text
              style={[styles.viewAllText, { color: currentTheme.secondary }]}
            >
              View All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={{ padding: 16 }}>
          <ActivityIndicator size="small" color={currentTheme.secondary} />
        </View>
      ) : (
        <FlatList
          horizontal
          data={properties}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.card,
                {
                  backgroundColor: currentTheme.background,
                  width: cardWidth,
                  height: cardHeight,
                  borderColor: "#E8EEF3",
                  borderWidth: 1,
                },
              ]}
              onPress={() => onCardPress?.(item.id)}
              activeOpacity={0.9}
            >
              <View style={{ height: cardHeight * 0.55 }}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />

                <TouchableOpacity
                  style={styles.favButton}
                  onPress={() => onToggleFav?.(item.id)}
                >
                  <View style={styles.heartCircle}>
                    <Ionicons
                      name={item.isFav ? "heart" : "heart-outline"}
                      size={20}
                      color={item.isFav ? "#FF4D4D" : "#64748B"}
                    />
                  </View>
                </TouchableOpacity>

                {item.featured && (
                  <View
                    style={[
                      styles.featuredTag,
                      { backgroundColor: currentTheme.secondary },
                    ]}
                  >
                    <Text style={styles.featuredText}>FEATURED</Text>
                  </View>
                )}
              </View>

              <View style={styles.cardContent}>
                <Text
                  style={[styles.cardTitle, { color: currentTheme.text }]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>

                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={14} color="#94A3B8" />
                  <Text
                    style={[styles.locationText, { color: "#94A3B8" }]}
                    numberOfLines={1}
                  >
                    {item.city}
                  </Text>
                </View>

                <Text style={styles.rentText}>
                  <Text
                    style={{ color: currentTheme.secondary, fontWeight: "800" }}
                  >
                    Rs. {item.rent?.toLocaleString()}
                  </Text>
                  <Text
                    style={{
                      color: "#94A3B8",
                      fontWeight: "400",
                      fontSize: 12,
                    }}
                  >
                    {" "}
                    / month
                  </Text>
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "700",
  },
  card: {
    borderRadius: 20,
    marginRight: 16,
    overflow: "hidden",
    // Clean shadow for premium feel
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  featuredTag: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featuredText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
  },
  cardContent: {
    padding: 14,
    flex: 1,
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: -4,
  },
  locationText: {
    fontSize: 13,
    fontWeight: "500",
  },
  rentText: {
    fontSize: 16,
    marginTop: 4,
  },
  favButton: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  heartCircle: {
    backgroundColor: "#FFFFFF",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
});
