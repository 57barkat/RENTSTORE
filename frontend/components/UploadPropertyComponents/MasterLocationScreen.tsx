import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Keyboard,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  FlatList,
} from "react-native";
import Mapbox from "@rnmapbox/maps";
import * as Location from "expo-location";
import Constants from "expo-constants";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { FormContext } from "@/contextStore/FormContext";
import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { Address } from "@/types/FinalAddressDetailsScreen.types";
import { searchPlaces, placeDetails } from "@/services/googlePlaces";
import StepContainer from "@/app/upload/Welcome";

const MAPBOX_TOKEN: string =
  (Constants.expoConfig && Constants.expoConfig.extra?.MAPBOX_PUBLIC_TOKEN) ||
  process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN ||
  "";

if (MAPBOX_TOKEN) {
  Mapbox.setAccessToken(MAPBOX_TOKEN);
  Mapbox.setTelemetryEnabled(false);
}

const INITIAL_ZOOM = 15;
const DEBOUNCE_DELAY = 800;

interface MasterLocationProps {
  propertyTypeLabel: string;
  nextPath: any;
  progress: number;
}

const MasterLocationScreen: React.FC<MasterLocationProps> = ({
  propertyTypeLabel,
  nextPath,
  progress,
}) => {
  const formContext = React.useContext(FormContext);
  const { theme } = useTheme();
  const router = useRouter();
  const currentTheme = Colors[theme ?? "light"];

  if (!formContext)
    throw new Error("FormContext missing! Wrap in <FormProvider>.");

  const { updateForm, data } = formContext;

  // --- State ---
  const [address, setAddress] = useState<string>(data.location ?? "");
  const [finalAddress, setFinalAddress] = useState<Address>({
    aptSuiteUnit: "",
    street: "",
    city: "",
    stateTerritory: "",
    zipCode: "",
    country: "",
  });
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isPinFixed, setIsPinFixed] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  // --- Refs ---
  const suppressRegionChangeRef = useRef(false);
  const cameraRef = useRef<Mapbox.Camera | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // --- Logic: Reverse Geocoding ---
  const getFullAddress = useCallback(
    async (location: { latitude: number; longitude: number }) => {
      try {
        const geocode = await Location.reverseGeocodeAsync(location);
        if (geocode?.[0]) {
          const { name, street, city, region, postalCode, country } =
            geocode[0];
          const formatted = [name, street, city, region, postalCode, country]
            .filter(Boolean)
            .join(", ");

          setAddress(formatted);
          setFinalAddress((prev) => ({
            ...prev,
            street: street || "",
            city: city || "",
            stateTerritory: region || "",
            zipCode: postalCode || "",
            country: country || "",
          }));
        }
      } catch (err) {
        console.error("Reverse Geocode Error:", err);
      }
    },
    [],
  );

  // --- Effect: Initial Location ---
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLoading(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const newCoords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setCoords(newCoords);
        await getFullAddress(newCoords);
      } catch (err) {
        console.error("Fetch Location Error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [getFullAddress]);

  // --- Effect: Auto-center camera on load ---
  useEffect(() => {
    if (coords && mapReady) {
      suppressRegionChangeRef.current = true;
      cameraRef.current?.setCamera({
        centerCoordinate: [coords.longitude, coords.latitude],
        zoomLevel: INITIAL_ZOOM,
        animationDuration: 500,
      });
      const t = setTimeout(
        () => (suppressRegionChangeRef.current = false),
        700,
      );
      return () => clearTimeout(t);
    }
  }, [coords, mapReady]);

  // --- Effect: Sync with Form Context ---
  useEffect(() => {
    if (coords) {
      updateForm("lat", coords.latitude);
      updateForm("lng", coords.longitude);
      updateForm("location", address);
      updateForm("address", [finalAddress]);
    }
  }, [coords, address, finalAddress]);

  // --- Handlers ---
  const handleSearch = (text: string) => {
    setAddress(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (text.length > 2) {
        try {
          const results = await searchPlaces(text);
          setSuggestions(results);
        } catch (err) {
          console.error(err);
        }
      } else {
        setSuggestions([]);
      }
    }, DEBOUNCE_DELAY);
  };

  const selectSuggestion = async (item: any) => {
    Keyboard.dismiss();
    const details = await placeDetails(item.place_id);
    if (details) {
      const newCoords = {
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
      };
      setCoords(newCoords);
      setAddress(item.description);
      setSuggestions([]);

      suppressRegionChangeRef.current = true;
      cameraRef.current?.setCamera({
        centerCoordinate: [newCoords.longitude, newCoords.latitude],
        zoomLevel: INITIAL_ZOOM,
        animationDuration: 1000,
      });
      setTimeout(() => (suppressRegionChangeRef.current = false), 1200);
    }
  };

  if (loading) {
    return (
      <View
        style={[styles.center, { backgroundColor: currentTheme.background }]}
      >
        <ActivityIndicator size="large" color={currentTheme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <StepContainer
        onNext={() => router.push(nextPath)}
        isNextDisabled={address.length < 3}
        title={`Where's your ${propertyTypeLabel}?`}
        progress={progress}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.subtitle, { color: currentTheme.muted }]}>
            Address is shared only after booking.
          </Text>

          {/* Search Section */}
          <View style={styles.searchWrapper}>
            <View
              style={[
                styles.searchBar,
                {
                  backgroundColor: currentTheme.card,
                  borderColor: currentTheme.border,
                },
              ]}
            >
              <Ionicons name="search" size={20} color={currentTheme.primary} />
              <TextInput
                value={address}
                onChangeText={handleSearch}
                style={[styles.input, { color: currentTheme.text }]}
                placeholder="Search address..."
                placeholderTextColor={currentTheme.muted}
              />
              {address.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setAddress("");
                    setSuggestions([]);
                  }}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={currentTheme.muted}
                  />
                </TouchableOpacity>
              )}
            </View>

            {suggestions.length > 0 && (
              <View
                style={[
                  styles.suggestionsBox,
                  {
                    backgroundColor: currentTheme.card,
                    borderColor: currentTheme.border,
                  },
                ]}
              >
                <FlatList
                  data={suggestions}
                  keyExtractor={(item) => item.place_id}
                  keyboardShouldPersistTaps="always"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.suggestionItem}
                      onPress={() => selectSuggestion(item)}
                    >
                      <Ionicons
                        name="location-sharp"
                        size={18}
                        color={currentTheme.muted}
                        style={{ marginRight: 10 }}
                      />
                      <Text style={{ color: currentTheme.text, flex: 1 }}>
                        {item.description}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>

          {/* Map Section */}
          <View
            style={[styles.mapWrapper, { borderColor: currentTheme.border }]}
          >
            {coords && (
              <Mapbox.MapView
                style={styles.map}
                styleURL={
                  theme === "dark"
                    ? Mapbox.StyleURL.Dark
                    : Mapbox.StyleURL.Street
                }
                onRegionDidChange={async (e) => {
                  if (!suppressRegionChangeRef.current && isPinFixed) {
                    const newC = {
                      latitude: e.geometry.coordinates[1],
                      longitude: e.geometry.coordinates[0],
                    };
                    setCoords(newC);
                    await getFullAddress(newC);
                  }
                }}
                onDidFinishLoadingMap={() => setMapReady(true)}
              >
                <Mapbox.Camera
                  ref={cameraRef}
                  centerCoordinate={[coords.longitude, coords.latitude]}
                  zoomLevel={INITIAL_ZOOM}
                />
                <Mapbox.PointAnnotation
                  id="marker"
                  coordinate={[coords.longitude, coords.latitude]}
                >
                  <View style={styles.markerContainer}>
                    <View
                      style={[
                        styles.pulse,
                        { backgroundColor: currentTheme.primary + "30" },
                      ]}
                    />
                    <MaterialCommunityIcons
                      name="map-marker-radius"
                      size={45}
                      color={currentTheme.primary}
                    />
                  </View>
                </Mapbox.PointAnnotation>
              </Mapbox.MapView>
            )}

            {/* Lock/Unlock Mode Button */}
            <TouchableOpacity
              style={[
                styles.mapModeFab,
                { backgroundColor: currentTheme.card },
              ]}
              onPress={() => setIsPinFixed(!isPinFixed)}
            >
              <Ionicons
                name={isPinFixed ? "lock-closed" : "move"}
                size={22}
                color={currentTheme.primary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </StepContainer>
    </SafeAreaView>
  );
};

export default MasterLocationScreen;

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  subtitle: { fontSize: 14, marginBottom: 15 },
  searchWrapper: { zIndex: 999, position: "relative" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 15,
    height: 55,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16, height: "100%" },
  suggestionsBox: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    borderRadius: 15,
    borderWidth: 1,
    maxHeight: 250,
    zIndex: 1000,
    elevation: 5,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  mapWrapper: {
    flex: 1,
    marginTop: 15,
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 1,
  },
  map: { flex: 1 },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
  },
  pulse: { position: "absolute", width: 40, height: 40, borderRadius: 20 },
  mapModeFab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});
