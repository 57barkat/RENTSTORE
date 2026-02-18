import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from "react-native";
import MapboxGL from "@rnmapbox/maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { useGetNearbyPropertiesQuery } from "@/services/api";
import PropertyCard from "@/components/NearByLocations/PropertyCard";
import { useRouter } from "expo-router";

MapboxGL.setAccessToken(process.env.MAPBOX_PUBLIC_TOKEN!);

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.85;

const NearbyScreen = () => {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const router = useRouter();
  const cameraRef = useRef<MapboxGL.Camera>(null);
  const flatListRef = useRef<FlatList>(null);

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  const [allProperties, setAllProperties] = useState<any[]>([]);

  const fetchLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
      });
    } catch {
      setLocation({ lat: 33.6844, lng: 73.0479 });
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const { data, isLoading } = useGetNearbyPropertiesQuery(
    location
      ? { lat: location.lat, lng: location.lng, maxDistance: 10000 }
      : { lat: 0, lng: 0, maxDistance: 10000 },
    { skip: !location },
  );

  useEffect(() => {
    if (data?.data) {
      setAllProperties((prev) => {
        const newItems = data.data.filter(
          (item: any) => !prev.some((p) => p._id === item._id),
        );
        return [...prev, ...newItems];
      });
    }
  }, [data]);

  const propertiesArray = allProperties;

  const handleMarkerPress = useCallback(
    (property: any) => {
      const index = propertiesArray.findIndex((p) => p._id === property._id);

      if (index !== -1) {
        flatListRef.current?.scrollToIndex({
          index,
          animated: true,
        });
      }

      cameraRef.current?.flyTo([property.lng, property.lat], 800);
    },
    [propertiesArray],
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const property = viewableItems[0].item;

      cameraRef.current?.flyTo([property.lng, property.lat], 800);
    }
  }).current;

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 70,
  };

  if (!location || isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />

      <TouchableOpacity
        onPress={() => router.back()}
        style={[styles.backButton, { backgroundColor: colors.card }]}
      >
        <Ionicons name="chevron-back" size={22} color={colors.text} />
      </TouchableOpacity>

      <MapboxGL.MapView
        style={StyleSheet.absoluteFill}
        logoEnabled={false}
        attributionEnabled={false}
        styleURL={
          theme === "dark" ? MapboxGL.StyleURL.Dark : MapboxGL.StyleURL.Street
        }
      >
        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={19}
          centerCoordinate={[location.lng, location.lat]}
        />

        {propertiesArray.map((item: any) => (
          <MapboxGL.MarkerView
            key={item._id}
            id={item._id}
            coordinate={[item.lng, item.lat]}
            anchor={{ x: 0.5, y: 1 }}
          >
            <TouchableOpacity
              onPress={() => handleMarkerPress(item)}
              activeOpacity={0.9}
              style={styles.markerContainer}
            >
              <View style={[styles.markerPin, { borderColor: colors.primary }]}>
                <Image
                  source={{ uri: item.photos?.[0] }}
                  style={styles.markerImage}
                />
              </View>
              <View
                style={[
                  styles.markerPointer,
                  { borderTopColor: colors.primary },
                ]}
              />
            </TouchableOpacity>
          </MapboxGL.MarkerView>
        ))}
      </MapboxGL.MapView>

      <View style={styles.sliderContainer}>
        <FlatList
          ref={flatListRef}
          data={propertiesArray}
          horizontal
          pagingEnabled
          snapToInterval={CARD_WIDTH + 16}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={{ width: CARD_WIDTH, marginHorizontal: 8 }}>
              <PropertyCard
                property={item}
                onPress={() => router.push(`/property/${item._id}`)}
              />
            </View>
          )}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 20,
    padding: 10,
    borderRadius: 14,
    elevation: 6,
  },

  sliderContainer: {
    position: "absolute",
    bottom: 30,
  },

  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 60,
  },

  markerPin: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 3,
    backgroundColor: "white",
    overflow: "hidden",
    elevation: 5,
  },

  markerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  markerPointer: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -2,
  },
});

export default NearbyScreen;
