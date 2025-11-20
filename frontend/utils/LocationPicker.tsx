import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import Constants from "expo-constants";
import Toast from "react-native-toast-message";

type LocationPickerProps = {
  onPick: (lat: number, lng: number, address?: string) => void;
};

const LocationPicker: React.FC<LocationPickerProps> = ({ onPick }) => {
  const [region, setRegion] = useState<Region | null>(null);
  const [marker, setMarker] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState<string>("");

  const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey;
  console.log("GOOGLE_MAPS_API_KEY", GOOGLE_MAPS_API_KEY);

  // Fetch current location on mount
  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Toast.show({
            type: "error",
            text1: "Permission Denied",
            text2: "Location permission is required.",
          });
          setLoading(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = loc.coords;

        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
        setMarker({ latitude, longitude });
      } catch (err) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Could not fetch current location.",
        });
      } finally {
        setLoading(false);
      }
    };

    getLocation();
  }, []);

  // Map press handler
  const handleMapPress = useCallback((e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
    setRegion((r) =>
      r
        ? { ...r, latitude, longitude }
        : { latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    );
  }, []);

  // Marker drag handler
  const handleMarkerDrag = useCallback((e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
    setRegion((r) =>
      r
        ? { ...r, latitude, longitude }
        : { latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    );
  }, []);

  // Confirm selection
  const handleConfirm = useCallback(async () => {
    if (!marker) return;

    try {
      const geocode = await Location.reverseGeocodeAsync(marker);
      const addr =
        geocode && geocode.length
          ? `${geocode[0].name || ""} ${geocode[0].street || ""}, ${
              geocode[0].city || ""
            }, ${geocode[0].country || ""}`
          : "";

      setAddress(addr);
      onPick(marker.latitude, marker.longitude, addr);
      Toast.show({
        type: "success",
        text1: "Location Selected",
        text2: addr || "Location coordinates selected",
      });
    } catch {
      onPick(marker.latitude, marker.longitude);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not fetch address, coordinates selected instead.",
      });
    }
  }, [marker, onPick]);

  // Loading or web fallback
  if (loading || !region) {
    return (
      <View
        style={{ height: 300, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (Platform.OS === "web") {
    return (
      <View
        style={{ height: 300, justifyContent: "center", alignItems: "center" }}
      >
        <Text style={{ color: "#333" }}>
          Map location picker is only available on mobile devices.
        </Text>
      </View>
    );
  }

  // Render Map
  return (
    <View style={{ height: 340, marginVertical: 10 }}>
      <MapView style={{ flex: 1 }} region={region} onPress={handleMapPress}>
        {marker && (
          <Marker coordinate={marker} draggable onDragEnd={handleMarkerDrag} />
        )}
      </MapView>

      <TouchableOpacity
        style={{
          marginTop: 10,
          padding: 10,
          backgroundColor: "#007bff",
          borderRadius: 8,
          alignItems: "center",
        }}
        onPress={handleConfirm}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>
          Confirm Location
        </Text>
      </TouchableOpacity>

      {address ? (
        <Text style={{ marginTop: 5, color: "#333" }}>Address: {address}</Text>
      ) : null}
    </View>
  );
};

export default LocationPicker;
