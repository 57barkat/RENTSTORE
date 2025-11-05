import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import ConfirmationModal from "@/components/ConfirmDialog";

type LocationPickerProps = {
  onPick: (lat: number, lng: number, address?: string) => void;
};

function LocationPicker({ onPick }: LocationPickerProps) {
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];

  const [region, setRegion] = useState<Region | null>(null);
  const [marker, setMarker] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState<string>("");

  // For permission and error modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setModalMessage("Location permission is required.");
        setModalVisible(true);
        setLoading(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      setMarker({ latitude, longitude });
      setLoading(false);
    })();
  }, []);

  const handleMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
    setRegion((r) =>
      r
        ? { ...r, latitude, longitude }
        : { latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    );
  };

  const handleMarkerDrag = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
    setRegion((r) =>
      r
        ? { ...r, latitude, longitude }
        : { latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    );
  };

  const handleConfirm = async () => {
    if (!marker) return;
    try {
      let geocode = await Location.reverseGeocodeAsync(marker);
      let addr =
        geocode && geocode.length
          ? `${geocode[0].name || ""} ${geocode[0].street || ""}, ${
              geocode[0].city || ""
            }, ${geocode[0].country || ""}`
          : "";
      setAddress(addr);
      onPick(marker.latitude, marker.longitude, addr);
    } catch {
      setModalMessage("Could not fetch address.");
      setModalVisible(true);
      onPick(marker.latitude, marker.longitude);
    }
  };

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
          backgroundColor: currentTheme.primary,
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={modalVisible}
        title="Notice"
        message={modalMessage}
        confirmText="OK"
        cancelText="Cancel"
        onConfirm={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
      />
    </View>
  );
}

export default LocationPicker;
