import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
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
      <View style={styles.intro}>
        <Text style={[styles.title, { color: currentTheme.primary }]}>
          Looking for Residence?
        </Text>
        <Text style={[styles.subtitle, { color: currentTheme.text }]}>
          This is the right place for you! Explore a wide variety of properties
          tailored to your needs.
        </Text>
      </View>

      <View style={styles.properties}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
          Featured Properties
        </Text>

        {isLoading ? (
          <ActivityIndicator size="large" color={currentTheme.primary} />
        ) : (
          <FlatList
            data={featuredProperties}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.propertyCard,
                  { backgroundColor: currentTheme.card },
                ]}
              >
                {item.images?.length > 0 ? (
                  <Image
                    source={{ uri: item.images[0] }}
                    style={styles.propertyImage}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={{ color: "#999" }}>No Image</Text>
                  </View>
                )}

                <View style={styles.propertyInfo}>
                  <Text
                    style={[styles.propertyTitle, { color: currentTheme.text }]}
                  >
                    {item.title}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 2,
                    }}
                  >
                    <Text style={styles.price}>
                      <Text style={{ fontSize: 16 }}>💰</Text> {item.rentPrice}{" "}
                      /month
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={styles.views}>
                      <Text style={{ fontSize: 14 }}>📍</Text> {item.city}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.viewButton,
                      { backgroundColor: currentTheme.success },
                    ]}
                    onPress={() => handleOpenDetails(item._id)}
                  >
                    <Text style={styles.viewButtonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  properties: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 20,
    marginBottom: 12,
  },
  propertyCard: {
    width: 220,
    marginHorizontal: 10,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  propertyImage: {
    width: "100%",
    height: 140,
  },
  imagePlaceholder: {
    width: "100%",
    height: 140,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  propertyInfo: {
    padding: 10,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: "500",
    color: "#007BFF",
  },
  views: {
    fontSize: 12,
    color: "gray",
    marginTop: 4,
  },
  viewButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  viewButtonText: { color: "#fff", fontWeight: "600", fontSize: 13 },
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
