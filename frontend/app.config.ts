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
  newArchEnabled: true, // Fabric + TurboModules

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
      /* 🎤 Added for expo-audio */
      NSMicrophoneUsageDescription:
        "This app uses the microphone for voice-based property searching.",
    },
  },

  android: {
    ...(config.android as any),
    package: "com.usman_naeem.frontend",
    /* 🎤 Added RECORD_AUDIO for expo-audio */
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

    // 🔥 BUILD SIZE OPTIMIZATIONS
    enableProguardInReleaseBuilds: true,
    shrinkResources: true,

    config: {
      mapbox: {
        apiKey: process.env.MAPBOX_PUBLIC_TOKEN,
      },
    },
  },

  web: {
    ...config.web,
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },

  extra: {
    ...config.extra,

    // ✅ GOOGLE MAPS / PLACES API KEY
    GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,

    // ✅ MAPBOX KEYS
    MAPBOX_PUBLIC_TOKEN: process.env.MAPBOX_PUBLIC_TOKEN,
    MAPBOX_DOWNLOADS_TOKEN: process.env.MAPBOX_DOWNLOADS_TOKEN,

    // ✅ BACKEND API
    apiUrl: process.env.EXPO_PUBLIC_API_URL,

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
          // 🔥 Forces the compiler to remove unused code to reduce that 700MB
          extraProguardRules: "-keep public class com.horcrux.svg.** { *; }",
        },
        ios: {
          // Optimization for iOS
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
    // 🎤 Added expo-audio plugin if required by your SDK version
    "expo-audio",
    "expo-video",
    "expo-web-browser",
    "expo-secure-store",
    [
      "@rnmapbox/maps",
      {
        RNMapboxMapsImpl: "mapbox",
        RNMapboxMapsDownloadToken: process.env.MAPBOX_DOWNLOADS_TOKEN,
      },
    ],
  ],
});
