import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  TextInput,
  Keyboard,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  FlatList,
  KeyboardAvoidingView,
} from "react-native";
import Mapbox from "@rnmapbox/maps";
import * as Location from "expo-location";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import StepContainer from "../Welcome";
import { HostelFormContext } from "@/contextStore/HostelFormContext";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";

// --- Mapbox Token Initialization
const MAPBOX_TOKEN: string =
  (Constants.expoConfig && Constants.expoConfig.extra?.MAPBOX_PUBLIC_TOKEN) ||
  process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN ||
  "";

if (MAPBOX_TOKEN) {
  Mapbox.setAccessToken(MAPBOX_TOKEN);
  Mapbox.setTelemetryEnabled(false);
} else {
  console.warn(
    "Mapbox public token is missing. Map functionality may be impaired."
  );
}

// Constants
const DEFAULT_COORDS = { latitude: 37.78825, longitude: -122.4324 };
const DEBOUNCE_DELAY_MS = 450;
const INITIAL_ZOOM = 14;

interface MapboxSuggestion {
  id: string;
  place_name: string;
  text?: string;
  center: [number, number];
}

interface Coords {
  latitude: number;
  longitude: number;
}

// Mapbox search
const searchMapboxPlaces = async (
  query: string
): Promise<MapboxSuggestion[]> => {
  if (!MAPBOX_TOKEN || !query || query.length < 2) return [];
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=6`;
    const res = await fetch(url);
    const json = await res.json();
    return (json.features || []).map((f: any) => ({
      id: f.id,
      place_name: f.place_name,
      center: f.center,
      text: f.text,
    }));
  } catch (err) {
    console.error("Mapbox search error:", err);
    return [];
  }
};

const HostelLocationScreen = () => {
  const formContext = useContext(HostelFormContext);
  const { theme } = useTheme();
  const currentTheme = Colors[theme ?? "light"];
  const router = useRouter();

  if (!formContext)
    throw new Error(
      "HostelFormContext is missing! Wrap in <HostelFormProvider>."
    );

  const { data, updateForm } = formContext;
  const [address, setAddress] = useState<string>(data.location ?? "");
  const [coords, setCoords] = useState<Coords>(DEFAULT_COORDS);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(
    null
  );
  const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPinFixed, setIsPinFixed] = useState(true);
  const [isMarkerDraggable, setIsMarkerDraggable] = useState(false);

  const cameraRef = useRef<Mapbox.Camera | null>(null);
  const mapRef = useRef<Mapbox.MapView | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Reverse geocode
  const reverseGeocode = useCallback(
    async (location: Coords): Promise<string> => {
      try {
        const geo = await Location.reverseGeocodeAsync(location);
        if (geo?.[0]) {
          const { name, street, city } = geo[0];
          return `${name || ""} ${street || ""} ${city || ""}`.trim();
        }
      } catch (err) {
        console.error("Reverse geocoding error:", err);
      }
      return "";
    },
    []
  );

  // Initial location
  useEffect(() => {
    const fetchInitialLocation = async () => {
      try {
        setLoading(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        const granted = status === "granted";
        setPermissionGranted(granted);
        if (!granted) return;

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const newCoords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setCoords(newCoords);
        const addr = await reverseGeocode(newCoords);
        setAddress(addr);
      } catch (err) {
        console.error("Initial location error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialLocation();
  }, [reverseGeocode]);

  // Update form context
  useEffect(() => {
    updateForm("lat", coords.latitude);
    updateForm("lng", coords.longitude);
    updateForm("location", address);
  }, [coords, address]);

  // Debounced search
  const handleAddressChange = useCallback((text: string) => {
    setAddress(text);
    setSuggestions([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!text || text.length < 2) return;
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchMapboxPlaces(text);
      setSuggestions(results);
      setIsSearching(false);
    }, DEBOUNCE_DELAY_MS);
  }, []);

  const selectSuggestion = useCallback(
    async (item: MapboxSuggestion) => {
      if (!item?.center) return;
      const [lon, lat] = item.center;
      const newCoords = { latitude: lat, longitude: lon };
      setCoords(newCoords);
      setSuggestions([]);
      Keyboard.dismiss();
      cameraRef.current?.setCamera({
        centerCoordinate: [lon, lat],
        zoomLevel: INITIAL_ZOOM,
        animationDuration: 500,
      });
      const addr = await reverseGeocode(newCoords);
      setAddress(addr);
    },
    [reverseGeocode]
  );

  const onRegionDidChange = useCallback(
    async (e: any) => {
      const center = e?.geometry?.coordinates;
      if (!center || center.length < 2) return;
      const [lon, lat] = center;
      const newCoords = { latitude: lat, longitude: lon };
      setCoords(newCoords);
      const addr = await reverseGeocode(newCoords);
      setAddress(addr);
    },
    [reverseGeocode]
  );

  const onMarkerDragEnd = useCallback(
    async (e: any) => {
      const coordsArr = e?.geometry?.coordinates;
      if (!coordsArr || coordsArr.length < 2) return;
      const [lon, lat] = coordsArr;
      const newCoords = { latitude: lat, longitude: lon };
      setCoords(newCoords);
      const addr = await reverseGeocode(newCoords);
      setAddress(addr);
    },
    [reverseGeocode]
  );

  const handleNext = () => {
    if (address && address.length >= 3)
      router.push("/upload/hostelForm/PropertyDetails");
  };

  const toggleMapMode = useCallback(() => {
    setIsPinFixed((v) => !v);
    setIsMarkerDraggable((v) => !v);
  }, []);

  const renderSuggestion = ({ item }: { item: MapboxSuggestion }) => (
    <TouchableOpacity
      style={[styles.suggestionItem, { borderColor: currentTheme.border }]}
      onPress={() => selectSuggestion(item)}
    >
      <Text style={{ color: currentTheme.text }}>{item.place_name}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View
        style={[styles.center, { backgroundColor: currentTheme.background }]}
      >
        <ActivityIndicator size="large" color={currentTheme.primary} />
        <Text style={{ color: currentTheme.muted, marginTop: 8 }}>
          Getting your location...
        </Text>
      </View>
    );
  }

  if (permissionGranted === false) {
    return (
      <View
        style={[styles.center, { backgroundColor: currentTheme.background }]}
      >
        <Text
          style={{ color: currentTheme.text, padding: 16, textAlign: "center" }}
        >
          Location permission is required to automatically set your location.
          Please enable location access in your device settings.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <StepContainer
        onNext={handleNext}
        isNextDisabled={!address || address.length < 3}
        title="Where's your hostel located?"
        progress={20}
      >
        <Text style={{ color: currentTheme.text, marginBottom: 8 }}>
          Your hostel address is only shared after a reservation is confirmed.
        </Text>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.inputContainer}
        >
          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: currentTheme.card,
                borderColor: currentTheme.border,
              },
            ]}
          >
            <Ionicons
              name="location-sharp"
              size={20}
              color={currentTheme.primary}
            />
            <TextInput
              placeholder="Enter your hostel address"
              placeholderTextColor={currentTheme.muted}
              value={address}
              onChangeText={handleAddressChange}
              style={[styles.input, { color: currentTheme.text }]}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
            {isSearching ? (
              <ActivityIndicator
                size="small"
                style={{ marginRight: 8 }}
                color={currentTheme.muted}
              />
            ) : (
              <TouchableOpacity
                style={styles.mapModeToggle}
                onPress={toggleMapMode}
              >
                <Ionicons
                  name={isPinFixed ? "pin" : "pin-outline"}
                  size={20}
                  color={currentTheme.muted}
                />
              </TouchableOpacity>
            )}
          </View>

          {suggestions.length > 0 && (
            <View
              style={[
                styles.suggestionsContainer,
                {
                  backgroundColor: currentTheme.card,
                  borderColor: currentTheme.border,
                },
              ]}
            >
              <FlatList
                data={suggestions}
                keyExtractor={(i) => i.id}
                renderItem={renderSuggestion}
                keyboardShouldPersistTaps="handled"
              />
            </View>
          )}
        </KeyboardAvoidingView>

        <View style={styles.mapArea}>
          <Mapbox.MapView
            ref={mapRef}
            style={styles.map}
            styleURL="mapbox://styles/mapbox/streets-v12"
            onRegionDidChange={isPinFixed ? onRegionDidChange : undefined}
            logoEnabled={false}
            compassEnabled
          >
            <Mapbox.Camera
              ref={cameraRef}
              centerCoordinate={[coords.longitude, coords.latitude]}
              zoomLevel={INITIAL_ZOOM}
              animationDuration={500}
            />

            {isPinFixed && (
              <View pointerEvents="none" style={styles.centerPinContainer}>
                <Ionicons name="location" size={42} color="red" />
              </View>
            )}

            {!isPinFixed && (
              <Mapbox.PointAnnotation
                id="draggableMarker"
                coordinate={[coords.longitude, coords.latitude]}
                draggable={isMarkerDraggable}
                onDragEnd={onMarkerDragEnd}
              >
                <View style={styles.marker}>
                  <Ionicons name="location" size={34} color="red" />
                </View>
              </Mapbox.PointAnnotation>
            )}

            {isPinFixed && (
              <Mapbox.PointAnnotation
                id="centerCoordinateAnnotation"
                coordinate={[coords.longitude, coords.latitude]}
              >
                <View style={{ width: 1, height: 1 }} />
              </Mapbox.PointAnnotation>
            )}
          </Mapbox.MapView>

          <View style={styles.attribution}>
            <Text
              style={[styles.attributionText, { color: currentTheme.muted }]}
            >
              © Mapbox © OpenStreetMap
            </Text>
          </View>
        </View>
      </StepContainer>
    </SafeAreaView>
  );
};

export default HostelLocationScreen;
const styles = StyleSheet.create({
  inputContainer: { zIndex: 10 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
    marginHorizontal: 2,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    paddingVertical: 0,
    height: 20,
  },
  mapModeToggle: { paddingHorizontal: 8 },
  suggestionsContainer: {
    borderRadius: 8,
    maxHeight: 220,
    marginHorizontal: 2,
    marginTop: 4,
    overflow: "hidden",
    borderWidth: 1,
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    zIndex: 11,
  },
  suggestionItem: { padding: 14, borderBottomWidth: 1 },
  mapArea: { flex: 1, marginTop: 10, overflow: "hidden", borderRadius: 8 },
  map: { flex: 1 },
  centerPinContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -21,
    marginTop: -42,
    zIndex: 10,
  },
  marker: { alignItems: "center", justifyContent: "center" },
  attribution: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  attributionText: { fontSize: 11 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
