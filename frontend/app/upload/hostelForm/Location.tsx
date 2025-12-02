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
// import { HostelFormContext } from "@/contextStore/HostelFormContext";
import { FormContext } from "@/contextStore/FormContext";

import { useTheme } from "@/contextStore/ThemeContext";
import { Colors } from "@/constants/Colors";
import { Address } from "@/types/FinalAddressDetailsScreen.types";

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

const INITIAL_ZOOM = 15;
const DEBOUNCE_DELAY_MS = 400;

interface MapboxSuggestion {
  id: string;
  place_name: string;
  center: [number, number];
  text?: string;
  street?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
}

interface Coords {
  latitude: number;
  longitude: number;
}

const searchMapboxPlaces = async (
  query: string
): Promise<MapboxSuggestion[]> => {
  if (!query || query.length < 2 || !MAPBOX_TOKEN) return [];
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=6&types=address,place,locality,neighborhood,region,country`;

    const res = await fetch(url);
    const json = await res.json();

    return (json.features || []).map((f: any) => {
      const context = f.context || [];
      return {
        id: f.id,
        place_name: f.place_name,
        center: f.center,
        street: f.text || "",
        city: context.find((c: any) => c.id.startsWith("place"))?.text || "",
        region: context.find((c: any) => c.id.startsWith("region"))?.text || "",
        postalCode:
          context.find((c: any) => c.id.startsWith("postcode"))?.text || "",
        country:
          context.find((c: any) => c.id.startsWith("country"))?.text || "",
      };
    });
  } catch (err) {
    console.error("Mapbox search error:", err);
    return [];
  }
};

const HostelLocationScreen: React.FC = () => {
  const formContext = useContext(FormContext);
  const { theme } = useTheme();
  const router = useRouter();

  if (!formContext)
    throw new Error(
      "HostelFormContext is missing! Wrap in <HostelFormProvider>."
    );

  const { data, updateForm } = formContext;
  const currentTheme = Colors[theme ?? "light"];

  const [address, setAddress] = useState<string>(data.location ?? "");
  const [finalAddress, setFinalAddress] = useState<Address>({
    aptSuiteUnit: "",
    street: "",
    city: "",
    stateTerritory: "",
    zipCode: "",
    country: "",
  });

  const [coords, setCoords] = useState<Coords | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(
    null
  );
  const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([]);
  const [isPinFixed, setIsPinFixed] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const suppressRegionChangeRef = useRef(false);
  const cameraRef = useRef<Mapbox.Camera | null>(null);
  const mapRef = useRef<Mapbox.MapView | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  /** Reverse geocode coords into full address */
  const getFullAddress = useCallback(async (location: Coords) => {
    try {
      const geocode = await Location.reverseGeocodeAsync(location);
      if (geocode?.[0]) {
        const { name, street, city, region, postalCode, country } = geocode[0];

        const formatted = [name, street, city, region, postalCode, country]
          .filter(Boolean)
          .join(", ");

        setAddress(formatted);

        setFinalAddress((prev) => ({
          aptSuiteUnit: name || prev.aptSuiteUnit || "",
          street: street || prev.street || "",
          city: city || prev.city || "",
          stateTerritory: region || prev.stateTerritory || "",
          zipCode: postalCode || prev.zipCode || "",
          country: country || prev.country || "",
        }));

        return formatted;
      }
    } catch (err) {
      console.error("Reverse geocode error:", err);
    }
    return "";
  }, []);

  /** Fetch device location on mount */
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setLoading(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setPermissionGranted(false);
          return;
        }
        setPermissionGranted(true);

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const newCoords: Coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setCoords(newCoords);
        await getFullAddress(newCoords);
      } catch (err) {
        console.error("Fetch location error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLocation();
  }, [getFullAddress]);

  /** Center camera on initial coords once map ready */
  useEffect(() => {
    if (!coords || !mapReady) return;
    suppressRegionChangeRef.current = true;
    cameraRef.current?.setCamera({
      centerCoordinate: [coords.longitude, coords.latitude],
      zoomLevel: INITIAL_ZOOM,
      animationDuration: 500,
    });
    const t = setTimeout(() => {
      suppressRegionChangeRef.current = false;
    }, 700);
    return () => clearTimeout(t);
  }, [coords, mapReady]);

  /** Sync coords/address to form context */
  useEffect(() => {
    if (!coords) return;
    updateForm("lat", coords.latitude);
    updateForm("lng", coords.longitude);
    updateForm("location", address);
    updateForm("address", [finalAddress]);
  }, [coords, address, finalAddress]);

  /** Handle input changes with debounce */
  const handleAddressChange = useCallback((text: string) => {
    setAddress(text);
    setSuggestions([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text || text.length < 2) return;

    debounceRef.current = setTimeout(async () => {
      const results = await searchMapboxPlaces(text);
      setSuggestions(results);
    }, DEBOUNCE_DELAY_MS);
  }, []);

  /** Handle selecting a Mapbox suggestion */
  const selectSuggestion = useCallback(
    async (item: MapboxSuggestion) => {
      if (!item?.center) return;
      const [longitude, latitude] = item.center;
      const newCoords: Coords = { latitude, longitude };

      suppressRegionChangeRef.current = true;
      setCoords(newCoords);
      setSuggestions([]);
      Keyboard.dismiss();

      cameraRef.current?.setCamera({
        centerCoordinate: [longitude, latitude],
        zoomLevel: INITIAL_ZOOM,
        animationDuration: 500,
      });

      // Merge reverse-geocode info if available
      setFinalAddress((prev) => ({
        aptSuiteUnit: prev.aptSuiteUnit || item.street || "",
        street: prev.street || item.street || "",
        city: prev.city || item.city || "",
        stateTerritory: prev.stateTerritory || item.region || "",
        zipCode: prev.zipCode || item.postalCode || "",
        country: prev.country || item.country || "",
      }));

      setAddress(item.place_name);

      // Optionally run reverse geocode to fill missing details
      await getFullAddress(newCoords);

      setTimeout(() => {
        suppressRegionChangeRef.current = false;
      }, 700);
    },
    [getFullAddress]
  );

  /** Toggle fixed pin mode */
  const toggleMapMode = useCallback(() => setIsPinFixed((v) => !v), []);

  /** Update coords/address on map movement (fixed pin mode) */
  const onRegionDidChange = useCallback(
    async (e: any) => {
      if (!mapReady || suppressRegionChangeRef.current) return;
      if (!isPinFixed || isDragging) return;
      const center = e?.geometry?.coordinates;
      if (!center || center.length < 2) return;
      const [longitude, latitude] = center;
      const newCoords: Coords = { latitude, longitude };
      setCoords(newCoords);
      await getFullAddress(newCoords);
    },
    [isPinFixed, isDragging, getFullAddress, mapReady]
  );

  /** Marker drag events */
  const onMarkerDragStart = () => setIsDragging(true);
  const onMarkerDragEnd = async (e: any) => {
    setIsDragging(false);
    const coordsArr = e?.geometry?.coordinates;
    if (!coordsArr || coordsArr.length < 2) return;
    const [longitude, latitude] = coordsArr;
    const newCoords: Coords = { latitude, longitude };

    suppressRegionChangeRef.current = true;
    setCoords(newCoords);
    await getFullAddress(newCoords);

    cameraRef.current?.setCamera({
      centerCoordinate: [longitude, latitude],
      zoomLevel: INITIAL_ZOOM,
      animationDuration: 300,
    });

    setTimeout(() => {
      suppressRegionChangeRef.current = false;
    }, 500);
  };

  /** Navigate to next step */
  const handleNext = useCallback(() => {
    if (address && address.length >= 3)
      router.push("/upload/hostelForm/PropertyDetails");
  }, [address]);

  /** Loading or permission denied states */
  if (loading)
    return (
      <View
        style={[styles.center, { backgroundColor: currentTheme.background }]}
      >
        <ActivityIndicator size="large" color={currentTheme.primary} />
        <Text style={{ marginTop: 8, color: currentTheme.muted }}>
          Fetching location...
        </Text>
      </View>
    );

  if (permissionGranted === false)
    return (
      <View
        style={[styles.center, { backgroundColor: currentTheme.background }]}
      >
        <Text
          style={{ textAlign: "center", padding: 16, color: currentTheme.text }}
        >
          Location permission denied. Enable location access in settings.
        </Text>
      </View>
    );

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
          style={{ zIndex: 10 }}
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
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={toggleMapMode}
              style={{ paddingHorizontal: 8 }}
            >
              <Ionicons
                name={isPinFixed ? "pin" : "pin-outline"}
                size={20}
                color={currentTheme.muted}
              />
            </TouchableOpacity>
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
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.suggestionItem,
                      { borderColor: currentTheme.border },
                    ]}
                    onPress={() => selectSuggestion(item)}
                  >
                    <Text style={{ color: currentTheme.text }}>
                      {item.place_name}
                    </Text>
                  </TouchableOpacity>
                )}
                keyboardShouldPersistTaps="handled"
              />
            </View>
          )}
        </KeyboardAvoidingView>

        <View style={styles.mapArea}>
          {coords ? (
            <Mapbox.MapView
              ref={mapRef}
              style={styles.map}
              styleURL="mapbox://styles/mapbox/streets-v12"
              logoEnabled={false}
              compassEnabled
              onRegionDidChange={onRegionDidChange}
              onDidFinishLoadingMap={() => setMapReady(true)}
            >
              <Mapbox.Camera
                ref={cameraRef}
                centerCoordinate={[coords.longitude, coords.latitude]}
                zoomLevel={INITIAL_ZOOM}
                animationDuration={500}
              />

              <Mapbox.PointAnnotation
                id="marker"
                coordinate={[coords.longitude, coords.latitude]}
                draggable={!isPinFixed}
                onDragStart={onMarkerDragStart}
                onDragEnd={onMarkerDragEnd}
              >
                <View
                  style={{ alignItems: "center", justifyContent: "center" }}
                >
                  <Ionicons name="location" size={42} color="red" />
                </View>
              </Mapbox.PointAnnotation>
            </Mapbox.MapView>
          ) : (
            <ActivityIndicator size="large" style={{ marginTop: 40 }} />
          )}
        </View>
      </StepContainer>
    </SafeAreaView>
  );
};

export default HostelLocationScreen;

const styles = StyleSheet.create({
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
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
