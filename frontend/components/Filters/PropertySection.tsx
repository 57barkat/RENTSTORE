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
import { getPriceDisplay } from "@/utils/properties/formatProperties";

const WINDOW_WIDTH = Dimensions.get("window").width;
const ITEM_WIDTH = WINDOW_WIDTH * 0.7;
const ITEM_HEIGHT = 300;

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
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
          {sectionTitle}
        </Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
            <Text
              style={[styles.viewAllText, { color: currentTheme.secondary }]}
            >
              View All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={currentTheme.secondary} />
        </View>
      ) : (
        <FlatList
          horizontal
          data={properties}
          keyExtractor={(item) =>
            item.id || item._id || Math.random().toString()
          }
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardWidth + 16}
          decelerationRate="fast"
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isFeatured = item.featured === true || item.sortWeight === 3;
            const isBoosted = item.isBoosted === true || item.sortWeight === 2;
            const priceInfo = getPriceDisplay(item);

            return (
              <TouchableOpacity
                style={[
                  styles.card,
                  {
                    backgroundColor: currentTheme.card,
                    width: cardWidth,
                    height: cardHeight,
                    borderColor: isFeatured
                      ? currentTheme.featured
                      : theme === "dark"
                        ? "#334155"
                        : "#E8EEF3",
                    borderWidth: isFeatured ? 1.5 : 1,
                    elevation: isFeatured ? 8 : 4,
                  },
                ]}
                onPress={() => onCardPress?.(item.id)}
                activeOpacity={0.9}
              >
                <View style={{ height: cardHeight * 0.55 }}>
                  <Image
                    source={{
                      uri:
                        item.image ||
                        item.photos?.[0] ||
                        "https://via.placeholder.com/300",
                    }}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />

                  <View style={styles.topRowOverlay}>
                    {isFeatured ? (
                      <View
                        style={[
                          styles.tag,
                          styles.featuredTag,
                          {
                            backgroundColor: currentTheme.featured,
                            shadowColor: currentTheme.featured,
                          },
                        ]}
                      >
                        <Ionicons name="flash" size={10} color="#FFF" />
                        <Text style={styles.tagText}>FEATURED AD</Text>
                      </View>
                    ) : isBoosted ? (
                      <View
                        style={[
                          styles.tag,
                          { backgroundColor: currentTheme.secondary },
                        ]}
                      >
                        <Ionicons name="rocket" size={10} color="#FFF" />
                        <Text style={styles.tagText}>BOOSTED</Text>
                      </View>
                    ) : (
                      <View /> // Spacer
                    )}

                    <TouchableOpacity
                      style={styles.heartCircle}
                      onPress={() => onToggleFav?.(item.id)}
                    >
                      <Ionicons
                        name={item.isFav ? "heart" : "heart-outline"}
                        size={18}
                        color={item.isFav ? "#FF4D4D" : "#1E293B"}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.cardContent}>
                  <View>
                    <Text
                      style={[styles.cardTitle, { color: currentTheme.text }]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>

                    <View style={styles.locationRow}>
                      <Ionicons
                        name="location-sharp"
                        size={12}
                        color={currentTheme.secondary}
                      />
                      <Text style={styles.locationText} numberOfLines={1}>
                        {item.location || item.city || "Islamabad"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.footerRow}>
                    <View style={styles.priceContainer}>
                      <Text
                        style={[
                          styles.rentAmount,
                          { color: currentTheme.secondary },
                        ]}
                      >
                        {priceInfo
                          ? `Rs. ${priceInfo.val.toLocaleString()}`
                          : "Price N/A"}
                      </Text>
                      {priceInfo && (
                        <Text
                          style={[
                            styles.rentUnit,
                            { color: currentTheme.muted },
                          ]}
                        >
                          /{priceInfo.label}
                        </Text>
                      )}
                    </View>

                    {(isFeatured || isBoosted) && (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={
                          isFeatured
                            ? currentTheme.featured
                            : currentTheme.secondary
                        }
                      />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 14 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "700",
    opacity: 0.8,
  },
  loaderContainer: { padding: 40, alignItems: "center" },
  listContent: { paddingLeft: 20, paddingRight: 4, paddingBottom: 15 },
  card: {
    borderRadius: 28,
    marginRight: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  cardImage: { width: "100%", height: "100%" },
  topRowOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  featuredTag: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  tagText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heartCircle: {
    backgroundColor: "rgba(255,255,255,0.9)",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    padding: 16,
    flex: 1,
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    fontWeight: "500",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  rentAmount: {
    fontSize: 18,
    fontWeight: "800",
  },
  rentUnit: {
    fontSize: 12,
    fontWeight: "600",
  },
});
