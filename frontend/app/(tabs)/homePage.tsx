import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "../../constants/Colors";
import ListAllProperties from "@/components/ListAllProperties";
import { useGetFeaturedPropertiesQuery } from "@/services/api";
import { router } from "expo-router";
import { styles } from "../../styles/homePage";

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
      <View
        style={[styles.intro, { backgroundColor: currentTheme.background }]}
      >
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
                  <View
                    style={[
                      styles.imagePlaceholder,
                      { backgroundColor: currentTheme.border },
                    ]}
                  >
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
                    <Text
                      style={[styles.priceText, { color: currentTheme.accent }]}
                    >
                      <Text style={{ fontSize: 16 }}>💰</Text> {item.rentPrice}{" "}
                      /month
                    </Text>
                    <Text
                      style={[
                        styles.locationText,
                        { color: currentTheme.secondary },
                      ]}
                    >
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

export default HomePage;
