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
import {
  useAddToFavMutation,
  useRemoveUserFavoriteMutation,
} from "@/services/api";
import {
  PropertyCardProps,
  PropertySectionProps,
} from "@/types/TabTypes/TabTypes";
import { Ionicons } from "@expo/vector-icons";

const WINDOW_WIDTH = Dimensions.get("window").width;
const ITEM_WIDTH = WINDOW_WIDTH * 0.55;
const ITEM_HEIGHT = 200;

export const PropertySection: React.FC<PropertySectionProps> = ({
  sectionTitle,
  properties,
  onViewAll,
  onCardPress,
  loading,
}) => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const [addToFav] = useAddToFavMutation();
  const [removeFav] = useRemoveUserFavoriteMutation();

  const handleToggleFav = async (property: PropertyCardProps) => {
    try {
      if (property.isFav) {
        await removeFav({ propertyId: property.id }).unwrap();
      } else {
        await addToFav({ propertyId: property.id }).unwrap();
      }
      property.isFav = !property.isFav;
    } catch (error) {
      console.log("Fav error:", error);
    }
  };

  return (
    <View style={{ marginVertical: 15 }}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
          {sectionTitle}
        </Text>
        {onViewAll && (
          <TouchableOpacity
            onPress={() => {
              if (onViewAll) onViewAll();
            }}
          >
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
          data={Array.isArray(properties) ? properties : []}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 5 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: currentTheme.card }]}
              onPress={() => onCardPress?.(item.id)}
            >
              <Image
                source={{ uri: item.image }}
                style={styles.cardImage}
                resizeMode="cover"
              />

              <TouchableOpacity
                style={styles.favButton}
                onPress={() => handleToggleFav(item)}
              >
                <Text style={{ fontSize: 20 }}>
                  {item.isFav ? (
                    <Ionicons
                      name="heart"
                      size={32}
                      color={currentTheme.danger}
                    />
                  ) : (
                    <Ionicons
                      name="heart-outline"
                      size={32}
                      color={currentTheme.danger}
                    />
                  )}
                </Text>
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

              {/* Card Content */}
              <View style={styles.cardContent}>
                <Text
                  style={[styles.cardTitle, { color: currentTheme.text }]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                {item.city && (
                  <Text
                    style={[styles.locationText, { color: currentTheme.muted }]}
                    numberOfLines={1}
                  >
                    {item.city}, {item.country}
                  </Text>
                )}
                {item.rent && (
                  <Text
                    style={[styles.rentText, { color: currentTheme.secondary }]}
                  >
                    Rs. {item.rent.toLocaleString()} / month
                  </Text>
                )}
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
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  viewAllText: { fontSize: 13, fontWeight: "600" },
  card: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderRadius: 14,
    marginRight: 15,
    overflow: "hidden",
    elevation: 3,
  },
  cardImage: { width: "100%", height: "60%" },
  featuredTag: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 10,
  },
  featuredText: { color: "#ffffff", fontSize: 9, fontWeight: "500" },
  cardContent: { padding: 8, flex: 1, justifyContent: "space-between" },
  cardTitle: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  locationText: { fontSize: 12, fontWeight: "500" },
  rentText: { fontSize: 13, fontWeight: "600", marginTop: 2 },
  favButton: { position: "absolute", top: 8, right: 8, zIndex: 20 },
});
