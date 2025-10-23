import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet, // Import StyleSheet
} from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../../constants/Colors";
import ListAllProperties from "@/components/ListAllProperties";
import { useGetFeaturedPropertiesQuery } from "@/services/api";
import { router } from "expo-router";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons"; // Added icons for better visuals

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

  const renderFeaturedItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        featuredStyles.featuredCard,
        {
          backgroundColor: currentTheme.card,
          // shadowColor: currentTheme.shadow,
          borderColor: currentTheme.border, // Subtle border for definition
        },
      ]}
      onPress={() => handleOpenDetails(item._id)}
    >
      {/* Image with Placeholder */}
      {item.photos?.length > 0 ? (
        <Image
          source={{ uri: item.photos[0] }}
          style={featuredStyles.cardImage}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            featuredStyles.imagePlaceholder,
            { backgroundColor: currentTheme.border },
          ]}
        >
          <Feather name="image" size={30} color={currentTheme.muted} />
          <Text
            style={{ color: currentTheme.muted, marginTop: 5, fontSize: 12 }}
          >
            No Image
          </Text>
        </View>
      )}

      {/* Content */}
      <View style={featuredStyles.cardContent}>
        <Text
          style={[featuredStyles.cardTitle, { color: currentTheme.text }]}
          numberOfLines={1}
        >
          {item.title}
        </Text>

        <Text
          style={[featuredStyles.cardLocation, { color: currentTheme.muted }]}
          numberOfLines={1}
        >
          <Feather name="map-pin" size={12} color={currentTheme.muted} />{" "}
          {item.address?.[0]?.city ?? "Location N/A"}
        </Text>

        <View style={featuredStyles.priceRow}>
          <Text
            style={[featuredStyles.cardPrice, { color: currentTheme.primary }]}
          >
            Rs. {item.monthlyRent?.toLocaleString() ?? "N/A"}
          </Text>
          <Text
            style={[
              featuredStyles.priceDuration,
              { color: currentTheme.muted },
            ]}
          >
            / month
          </Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[
            featuredStyles.detailsButton,
            { backgroundColor: currentTheme.primary },
          ]}
          onPress={() => handleOpenDetails(item._id)}
        >
          <Text style={featuredStyles.detailsButtonText}>View Details</Text>
          <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <>
      {/* Intro Section - More impactful headline */}
      <View
        style={[
          featuredStyles.intro,
          { backgroundColor: currentTheme.background },
        ]}
      >
        <Text style={[featuredStyles.title, { color: currentTheme.primary }]}>
          Your Perfect Home Awaits.
        </Text>
        <Text style={[featuredStyles.subtitle, { color: currentTheme.text }]}>
          Explore quality properties tailored to your needs. Start your search
          below!
        </Text>
      </View>

      {/* Featured Properties Section */}
      <View style={featuredStyles.featuredPropertiesSection}>
        <Text
          style={[featuredStyles.sectionTitle, { color: currentTheme.text }]}
        >
          🔥 Top Featured Rentals
        </Text>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={currentTheme.primary}
            style={featuredStyles.loadingIndicator}
          />
        ) : (
          <FlatList
            data={featuredProperties}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            contentContainerStyle={featuredStyles.featuredListContainer}
            renderItem={renderFeaturedItem}
            ListEmptyComponent={() => (
              <View style={featuredStyles.emptyFeatured}>
                <Text style={{ color: currentTheme.muted }}>
                  No featured properties found.
                </Text>
              </View>
            )}
          />
        )}
      </View>

      {/* Separator before ListAllProperties */}
      <View
        style={[
          featuredStyles.separator,
          { borderBottomColor: currentTheme.border },
        ]}
      />

      <Text
        style={[featuredStyles.allListingsTitle, { color: currentTheme.text }]}
      >
        Browse All Listings
      </Text>
    </>
  );

  return (
    <FlatList
      ListHeaderComponent={renderHeader}
      data={[]}
      renderItem={null}
      ListFooterComponent={<ListAllProperties />}
      style={[
        featuredStyles.container,
        { backgroundColor: currentTheme.background },
      ]}
      contentContainerStyle={featuredStyles.contentContainer}
    />
  );
};

export default HomePage;

// --- Styles ---
const featuredStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20, // Padding at the bottom of the entire screen
  },

  // Intro Styles
  intro: {
    paddingHorizontal: 20,
    paddingVertical: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
  },

  // Featured Section Styles
  featuredPropertiesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  featuredListContainer: {
    paddingHorizontal: 20, // Horizontal padding for the list items
    paddingVertical: 5,
  },
  emptyFeatured: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: "center",
  },

  // Featured Card Styles
  featuredCard: {
    width: 250, // Slightly wider card
    marginRight: 15,
    borderRadius: 15, // Increased corner radius
    overflow: "hidden",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
  },
  cardImage: {
    width: "100%",
    height: 160,
  },
  imagePlaceholder: {
    width: "100%",
    height: 160,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontWeight: "800",
    fontSize: 18,
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 10,
  },
  cardPrice: {
    fontSize: 20,
    fontWeight: "900", // Extra bold price
  },
  priceDuration: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },

  // Details Button
  detailsButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 10,
    gap: 5,
  },
  detailsButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  // All Listings Section
  separator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  allListingsTitle: {
    fontSize: 20,
    fontWeight: "700",
    paddingHorizontal: 10,
    marginBottom: 10, // Ensure space before the ListAllProperties component starts
  },
});
