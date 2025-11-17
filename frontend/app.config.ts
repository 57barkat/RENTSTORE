// app.config.js
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
        "This app needs access to your location",
      NSLocationAlwaysAndWhenInUseUsageDescription:
        "This app needs access to your location",
    },

    // ❌ Removed Google Maps config (not needed for Mapbox)
    // ❌ Remove any mapbox config here if Android-only
  },

  android: {
    ...(config.android as any),
    permissions: [
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
    ],
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    package: "com.usman_naeem.frontend",

    // ✅ Correct Mapbox config for Android only
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
    MAPBOX_PUBLIC_TOKEN: process.env.MAPBOX_PUBLIC_TOKEN,
    MAPBOX_DOWNLOADS_TOKEN: process.env.MAPBOX_DOWNLOADS_TOKEN,

    // this can stay
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

    // keep your other plugins
    "expo-video",
    "expo-web-browser",
    "expo-secure-store",

    // ❗ You will need this for Mapbox
    "@rnmapbox/maps",
  ],
});

// Optional logs
console.log(
  "Loaded Mapbox Public Token:",
  process.env.MAPBOX_PUBLIC_TOKEN ? "Loaded" : "Missing"
);
console.log(
  "Loaded Mapbox Downloads Token:",
  process.env.MAPBOX_DOWNLOADS_TOKEN ? "Loaded" : "Missing"
);
