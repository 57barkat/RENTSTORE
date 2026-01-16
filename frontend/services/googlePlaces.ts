import Constants from "expo-constants";

const GOOGLE_API_KEY: string | undefined =
  process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ||
  Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY;

if (!GOOGLE_API_KEY) {
  console.warn("⚠️ GOOGLE_MAPS_API_KEY is missing");
} else {
  console.log("✅ GOOGLE_MAPS_API_KEY is set", GOOGLE_API_KEY);
}

/**
 * Address autocomplete (typing suggestions)
 */
export const searchPlaces = async (input: string) => {
  if (!input || input.length < 2) return [];

  const url =
    "https://maps.googleapis.com/maps/api/place/autocomplete/json" +
    `?input=${encodeURIComponent(input)}` +
    `&types=address` +
    `&components=country:pk` +
    `&language=en` +
    `&key=${GOOGLE_API_KEY}`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (json.status !== "OK") {
      console.warn("Autocomplete error:", json.status, json.error_message);
      return [];
    }

    return json.predictions;
  } catch (error) {
    console.error("Autocomplete fetch failed:", error);
    return [];
  }
};

/**
 * Fetch full place details after selection
 */
export const placeDetails = async (placeId: string) => {
  if (!placeId) return null;

  const url =
    "https://maps.googleapis.com/maps/api/place/details/json" +
    `?place_id=${placeId}` +
    `&fields=geometry,address_component,formatted_address,name` +
    `&key=${GOOGLE_API_KEY}`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (json.status !== "OK") {
      console.warn("Place details error:", json.status);
      return null;
    }

    return json.result;
  } catch (error) {
    console.error("Place details fetch failed:", error);
    return null;
  }
};
