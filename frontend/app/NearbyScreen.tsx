import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Platform,
  Image,
} from "react-native";
import MapboxGL from "@rnmapbox/maps";
import * as Location from "expo-location";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { useGetNearbyPropertiesQuery } from "@/services/api";
import PropertyCard from "@/components/NearByLocations/PropertyCard";

MapboxGL.setAccessToken(process.env.MAPBOX_PUBLIC_TOKEN);

const { width } = Dimensions.get("window");

const NearbyScreen = () => {
  const { theme } = useTheme();
  const activeColors = Colors[theme];

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [radius, setRadius] = useState(10);
  const mapRef = useRef<MapboxGL.MapView>(null);

  const fetchLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    } catch (err) {
      setLocation({ lat: 33.6844, lng: 73.0479 }); // Default to Islamabad
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, []);

  const { data, isLoading } = useGetNearbyPropertiesQuery(
    location
      ? { lat: location.lat, lng: location.lng, maxDistance: radius * 1000 }
      : { lat: 0, lng: 0, maxDistance: 10000 },
    { skip: !location },
  );

  const propertiesArray = data?.data || [];

  if (!location || isLoading) {
    return (
      <View
        style={[styles.center, { backgroundColor: activeColors.background }]}
      >
        <ActivityIndicator size="large" color={activeColors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: activeColors.background }}>
      <StatusBar translucent backgroundColor="transparent" />

      <MapboxGL.MapView
        style={StyleSheet.absoluteFill}
        logoEnabled={false}
        attributionEnabled={false}
        styleURL={
          theme === "dark" ? MapboxGL.StyleURL.Dark : MapboxGL.StyleURL.Street
        }
      >
        <MapboxGL.Camera
          zoomLevel={13}
          centerCoordinate={[location.lng, location.lat]}
          animationMode="flyTo"
        />

        {/* User Marker */}
        <MapboxGL.PointAnnotation
          id="user"
          coordinate={[location.lng, location.lat]}
        >
          <View
            style={[
              styles.userMarkerCore,
              { backgroundColor: activeColors.primary },
            ]}
          />
        </MapboxGL.PointAnnotation>

        {/* PROPERTY IMAGE MARKERS */}
        {propertiesArray.map((item: any) => {
          // Fix: Access the first image from the 'photos' array provided in your data
          const imageUrl =
            item.photos && item.photos.length > 0
              ? item.photos[0]
              : "https://via.placeholder.com/150";

          return (
            <MapboxGL.MarkerView
              key={item._id}
              id={item._id}
              coordinate={[item.lng, item.lat]}
              anchor={{ x: 0.5, y: 1 }} // Points the bottom of the triangle to the location
            >
              <View style={styles.markerContainer}>
                {/* Glow effect at bottom */}
                <View style={styles.markerGlow} />

                {/* Image Pin */}
                <View
                  style={[
                    styles.imagePinFrame,
                    { borderColor: activeColors.primary },
                  ]}
                >
                  <Image source={{ uri: imageUrl }} style={styles.pinImage} />
                </View>

                {/* Pointer Triangle */}
                <View
                  style={[
                    styles.pinPointer,
                    { borderTopColor: activeColors.primary },
                  ]}
                />
              </View>
            </MapboxGL.MarkerView>
          );
        })}
      </MapboxGL.MapView>

      {/* OVERLAY UI */}
      <SafeAreaView style={styles.overlayContainer} pointerEvents="box-none">
        {/* Search Bar */}
        {/* <View style={styles.searchSection}> */}
        {/* <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={20}
              color="#999"
              style={{ marginLeft: 15 }}
            />
            <TextInput
              placeholder="Search properties..."
              style={styles.searchInput}
            />
          </View>
        </View> */}

        {/* Carousel */}
        {/* <View style={styles.carouselWrapper}>
          <FlatList
            data={propertiesArray}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            snapToInterval={width * 0.85 + 15}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
            renderItem={({ item }) => (
              <View style={{ width: width * 0.85, marginRight: 15 }}>
                <PropertyCard property={item} />
              </View>
            )}
          />
        </View> */}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  overlayContainer: { ...StyleSheet.absoluteFillObject },
  searchSection: { paddingHorizontal: 20, marginTop: 50 },
  searchBar: {
    flexDirection: "row",
    backgroundColor: "white",
    height: 55,
    borderRadius: 15,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  searchInput: { flex: 1, paddingHorizontal: 10, fontSize: 16 },
  carouselWrapper: { position: "absolute", bottom: 0, left: 0, right: 0 },

  // --- MARKER STYLES ---
  markerContainer: {
    alignItems: "center",
    width: 60,
    height: 75,
  },
  imagePinFrame: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    backgroundColor: "white",
    overflow: "hidden",
    elevation: 4,
    zIndex: 2,
  },
  pinImage: {
    width: "100%",
    height: "100%",
  },
  pinPointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -2,
    zIndex: 2,
  },
  markerGlow: {
    position: "absolute",
    bottom: 12,
    width: 25,
    height: 8,
    backgroundColor: "rgba(142, 208, 84, 0.5)",
    borderRadius: 10,
    transform: [{ scaleX: 2.5 }],
    zIndex: 1,
  },
  userMarkerCore: {
    height: 16,
    width: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: "white",
    elevation: 5,
  },
});

export default NearbyScreen;
