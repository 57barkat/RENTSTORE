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
  Animated,
  Linking,
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
  const [address, setAddress] = useState<string>(data.location ?? "");
  const [finalAddress, setFinalAddress] = useState<Address>({
    aptSuiteUnit: "",
    street: "",
    city: "",
    stateTerritory: "",
    zipCode: "",
    country: "",
  });
  const [permissionStatus, setPermissionStatus] = useState<
    "checking" | "granted" | "denied"
  >("checking");
  const [areaName, setAreaName] = useState<string>(data.area ?? "");
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isMoving, setIsMoving] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const suppressRegionChangeRef = useRef(false);
  const cameraRef = useRef<Mapbox.Camera | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchedCoords = useRef<{ lat: number; lng: number } | null>(null);
  const markerMoveAnim = useRef(new Animated.Value(0)).current;

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getFullAddress = useCallback(
    async (location: { latitude: number; longitude: number }) => {
      if (lastFetchedCoords.current) {
        const dist = calculateDistance(
          location.latitude,
          location.longitude,
          lastFetchedCoords.current.lat,
          lastFetchedCoords.current.lng,
        );
        if (dist < 50) return;
      }
      try {
        const geocode = await Location.reverseGeocodeAsync(location);
        if (geocode?.[0]) {
          const {
            name,
            street,
            city,
            region,
            postalCode,
            country,
            district,
            subregion,
          } = geocode[0];
          const detectedArea = district || subregion || "";
          setAreaName(detectedArea);
          const formatted = [
            name,
            street,
            detectedArea,
            city,
            region,
            postalCode,
            country,
          ]
            .filter(Boolean)
            .join(", ");
          setAddress(formatted);
          setFinalAddress({
            aptSuiteUnit: "",
            street: street || name || "",
            city: city || "",
            stateTerritory: region || "",
            zipCode: postalCode || "",
            country: country || "",
          });
          lastFetchedCoords.current = {
            lat: location.latitude,
            lng: location.longitude,
          };
        }
      } catch (err) {
        console.error("Reverse Geocode Error:", err);
      }
    },
    [],
  );

  const initLocation = async () => {
    try {
      setLoading(true);
      let { status, canAskAgain } =
        await Location.getForegroundPermissionsAsync();

      if (status !== "granted" && canAskAgain) {
        const request = await Location.requestForegroundPermissionsAsync();
        status = request.status;
      }

      if (status !== "granted") {
        setPermissionStatus("denied");
        setLoading(false);
        return;
      }

      setPermissionStatus("granted");

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        try {
          await Location.enableNetworkProviderAsync();
        } catch (e) {
          setPermissionStatus("denied");
          setLoading(false);
          return;
        }
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newCoords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      setCoords(newCoords);
      await getFullAddress(newCoords);
    } catch (err) {
      console.log("Location error:", err);
      setPermissionStatus("denied");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initLocation();
  }, [getFullAddress]);

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

  useEffect(() => {
    if (coords) {
      updateForm("lat", coords.latitude);
      updateForm("lng", coords.longitude);
      updateForm("location", address);
      updateForm("area", areaName);
      updateForm("address", [finalAddress]);
    }
  }, [coords, address, finalAddress, areaName]);

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

  const animateMarker = (toValue: number) => {
    Animated.spring(markerMoveAnim, {
      toValue,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  if (loading || permissionStatus === "checking") {
    return (
      <View
        style={[styles.center, { backgroundColor: currentTheme.background }]}
      >
        <ActivityIndicator size="large" color={currentTheme.primary} />
      </View>
    );
  }

  if (permissionStatus === "denied") {
    return (
      <SafeAreaView
        style={[
          styles.center,
          { backgroundColor: currentTheme.background, padding: 30 },
        ]}
      >
        <MaterialCommunityIcons
          name="map-marker-off"
          size={64}
          color={currentTheme.muted}
        />
        <Text
          style={{
            color: currentTheme.text,
            fontSize: 18,
            fontWeight: "700",
            marginTop: 20,
            textAlign: "center",
          }}
        >
          Location Access Required
        </Text>
        <Text
          style={{
            color: currentTheme.muted,
            textAlign: "center",
            marginTop: 10,
            marginBottom: 30,
          }}
        >
          To accurately list your property, we need access to your location
          services.
        </Text>
        <TouchableOpacity
          style={[
            styles.confirmLocationBtn,
            {
              backgroundColor: currentTheme.primary,
              position: "relative",
              left: 0,
              right: 0,
              width: "100%",
            },
          ]}
          onPress={() => Linking.openSettings()}
        >
          <Text style={styles.confirmBtnText}>Open Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={initLocation} style={{ marginTop: 20 }}>
          <Text style={{ color: currentTheme.primary, fontWeight: "600" }}>
            Try Again
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <StepContainer
        onNext={() => router.push(nextPath)}
        isNextDisabled={address.length < 3 || isMoving}
        title={`Where's your ${propertyTypeLabel}?`}
        progress={progress}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.subtitle, { color: currentTheme.muted }]}>
            Address is shared only after booking.
          </Text>
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
                placeholderTextColor={currentTheme.placeholder}
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
          <View
            style={[styles.mapWrapper, { borderColor: currentTheme.border }]}
          >
            {permissionStatus === "granted" && coords && (
              <Mapbox.MapView
                style={styles.map}
                styleURL={
                  theme === "dark"
                    ? Mapbox.StyleURL.Dark
                    : Mapbox.StyleURL.Street
                }
                onRegionIsChanging={() => {
                  if (!isMoving) {
                    setIsMoving(true);
                    animateMarker(-15);
                  }
                }}
                onRegionDidChange={async (e) => {
                  setIsMoving(false);
                  animateMarker(0);
                  if (!suppressRegionChangeRef.current) {
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
              </Mapbox.MapView>
            )}
            <View style={styles.staticMarkerContainer} pointerEvents="none">
              <Animated.View
                style={[
                  styles.staticMarker,
                  { transform: [{ translateY: markerMoveAnim }] },
                ]}
              >
                <MaterialCommunityIcons
                  name="map-marker"
                  size={48}
                  color={currentTheme.primary}
                />
              </Animated.View>
              <View
                style={[
                  styles.markerShadow,
                  {
                    backgroundColor: isMoving
                      ? "rgba(0,0,0,0.05)"
                      : "rgba(0,0,0,0.15)",
                    transform: [{ scale: isMoving ? 0.6 : 1 }],
                  },
                ]}
              />
            </View>
            <TouchableOpacity
              style={[
                styles.mapModeFab,
                { backgroundColor: currentTheme.card },
              ]}
              onPress={async () => {
                const loc = await Location.getCurrentPositionAsync({});
                cameraRef.current?.setCamera({
                  centerCoordinate: [loc.coords.longitude, loc.coords.latitude],
                  zoomLevel: INITIAL_ZOOM,
                  animationDuration: 1000,
                });
              }}
            >
              <Ionicons name="locate" size={24} color={currentTheme.primary} />
            </TouchableOpacity>
            {!isMoving && address.length > 3 && (
              <TouchableOpacity
                style={[
                  styles.confirmLocationBtn,
                  { backgroundColor: currentTheme.primary },
                ]}
                onPress={() => router.push(nextPath)}
              >
                <Text style={styles.confirmBtnText}>Confirm Location</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </StepContainer>
    </SafeAreaView>
  );
};

export default MasterLocationScreen;

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  subtitle: {
    fontSize: 14,
    marginBottom: 15,
    fontWeight: "500",
    paddingLeft: 5,
  },
  searchWrapper: { zIndex: 999, position: "relative" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 15,
    height: 60,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16, height: "100%" },
  suggestionsBox: {
    position: "absolute",
    top: 65,
    left: 0,
    right: 0,
    borderRadius: 18,
    borderWidth: 1,
    maxHeight: 300,
    zIndex: 1000,
    elevation: 10,
    overflow: "hidden",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  mapWrapper: {
    flex: 1,
    marginTop: 20,
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 1,
    position: "relative",
  },
  map: { flex: 1 },
  staticMarkerContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -24,
    marginTop: -48,
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
  },
  staticMarker: { zIndex: 2 },
  markerShadow: {
    width: 12,
    height: 4,
    borderRadius: 6,
    bottom: 2,
    position: "absolute",
    zIndex: 1,
  },
  mapModeFab: {
    position: "absolute",
    bottom: 25,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  confirmLocationBtn: {
    position: "absolute",
    bottom: 25,
    left: 20,
    right: 90,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  confirmBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
