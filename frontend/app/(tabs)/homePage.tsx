import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../../constants/Colors";
import ListAllProperties from "@/components/ListAllProperties";
import { useGetFeaturedPropertiesQuery } from "@/services/api";
import { router } from "expo-router";

// Get screen width for responsive image sizing
const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.6; // Card takes up 60% of the screen width

const HomePage: React.FC = () => {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const {
    data: featuredProperties,
    isLoading,
    refetch,
  } = useGetFeaturedPropertiesQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleOpenDetails = (id: string) => {
    router.push(`/property/${id}`);
  };

  const renderHeader = () => (
    <>
      <View style={[styles.intro, { backgroundColor: currentTheme.background }]}>
        <Text style={[styles.title, { color: currentTheme.primary }]}>
          Looking for Residence?
        </Text>
        <Text style={[styles.subtitle, { color: currentTheme.text }]}>
          This is the right place for you! Explore a wide variety of properties
          tailored to your needs.
        </Text>
      </View>

      <View style={styles.featuredPropertiesSection}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
          Featured Properties
        </Text>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={currentTheme.primary}
            style={styles.loadingIndicator}
          />
        ) : (
          <FlatList
            data={featuredProperties}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.featuredList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.propertyCard,
                  { backgroundColor: currentTheme.card },
                ]}
                onPress={() => handleOpenDetails(item._id)}
              >
                {item.images?.length > 0 ? (
                  <Image
                    source={{ uri: item.images[0] }}
                    style={styles.propertyImage}
                  />
                ) : (
                  <View style={[styles.imagePlaceholder, { backgroundColor: currentTheme.border }]}>
                    <Text style={{ color: currentTheme.secondary }}>
                      No Image
                    </Text>
                  </View>
                )}

                <View style={styles.propertyInfo}>
                  <Text
                    style={[styles.propertyTitle, { color: currentTheme.text }]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <View style={styles.priceAndLocation}>
                    <Text style={[styles.priceText, { color: currentTheme.accent }]}>
                      <Text style={{ fontSize: 16 }}>💰</Text> {item.rentPrice} /month
                    </Text>
                    <Text style={[styles.locationText, { color: currentTheme.secondary }]}>
                      <Text style={{ fontSize: 14 }}>📍</Text> {item.city}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.viewButton,
                      { backgroundColor: currentTheme.primary },
                    ]}
                    onPress={() => handleOpenDetails(item._id)}
                  >
                    <Text style={styles.viewButtonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </>
  );

  return (
    <FlatList
      ListHeaderComponent={renderHeader}
      data={[]}
      renderItem={null}
      ListFooterComponent={<ListAllProperties />}
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  intro: {
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  featuredPropertiesSection: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 24,
    marginBottom: 12,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  featuredList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  propertyCard: {
    width: CARD_WIDTH,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 16, // Use marginRight instead of marginHorizontal
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  propertyImage: {
    width: "100%",
    height: CARD_WIDTH * 0.75,
    resizeMode: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    height: CARD_WIDTH * 0.75,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  propertyInfo: {
    padding: 12,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  priceAndLocation: {
    marginBottom: 8,
  },
  priceText: {
    fontSize: 15,
    fontWeight: "600",
  },
  locationText: {
    fontSize: 13,
    marginTop: 4,
  },
  views: {
    fontSize: 12,
    color: "gray",
    marginTop: 4,
  },
  viewButton: {
    alignSelf: "stretch",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  viewButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  filterCard: {
    borderRadius: 12,
    padding: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default HomePage;