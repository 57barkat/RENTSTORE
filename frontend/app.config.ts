import "dotenv/config";
import { ConfigContext, ExpoConfig } from "@expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,

  name: "Rent Store",
  slug: "rent-store",
  scheme: "rentstoreapp",
  version: "1.0.0",
  platforms: ["android", "ios"],
  orientation: "portrait",

  icon: "./assets/images/icon.png",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,

  ios: {
    ...config.ios,
    supportsTablet: true,
    bundleIdentifier: "com.usman_naeem.frontend",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSLocationWhenInUseUsageDescription:
        "This app needs access to your location to show nearby rentals.",
      NSLocationAlwaysAndWhenInUseUsageDescription:
        "This app needs access to your location to show nearby rentals.",
      NSMicrophoneUsageDescription:
        "This app uses the microphone for voice-based property searching.",
      // Optional: background audio for iOS if you want long recordings
      // UIBackgroundModes: ["audio"],
    },
  },

  android: {
    ...(config.android as any),
    package: "com.usman_naeem.frontend",
    softwareKeyboardLayoutMode: "resize",
    permissions: [
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
      "RECORD_AUDIO",
    ],
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    jsEngine: "hermes",

    // 🔑 REQUIRED for Mapbox Android SDK download
    config: {
      mapbox: {
        apiKey: process.env.MAPBOX_PUBLIC_TOKEN,
      },
    },

    enableProguardInReleaseBuilds: true,
    shrinkResources: true,
  },

  web: {
    ...config.web,
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },

  extra: {
    ...config.extra,

    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    GOOGLE_PLACES_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,

    MAPBOX_PUBLIC_TOKEN: process.env.MAPBOX_PUBLIC_TOKEN,
    MAPBOX_DOWNLOADS_TOKEN: process.env.MAPBOX_DOWNLOADS_TOKEN,

    eas: {
      projectId: "44299887-b9d1-4e31-8ce5-0b8686a8f699",
    },

    router: {},
  },

  plugins: [
    "expo-router",

    [
      "expo-build-properties",
      {
        android: {
          kotlinVersion: "2.0.21",
          extraProguardRules: "-keep public class com.horcrux.svg.** { *; }",
        },
        ios: {
          useFrameworks: "static",
        },
      },
    ],

    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],

    // Removed "expo-audio" since we are using expo-av
    "expo-video",
    "expo-web-browser",
    "expo-secure-store",

    // 🗺️ Mapbox plugin — THIS IS CRITICAL
    [
      "@rnmapbox/maps",
      {
        RNMapboxMapsImpl: "mapbox",
        RNMapboxMapsDownloadToken: process.env.MAPBOX_DOWNLOADS_TOKEN,
      },
    ],
  ],
});
