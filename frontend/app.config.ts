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
    },
  },
  android: {
    ...config.android,
    // [1] CORRECT LOCATION for templateDir override
     ...(config.android as any),
    templateDir: "./templates", 
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    package: "com.usman_naeem.frontend",
  },
  web: {
    ...config.web,
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  extra: {
    ...config.extra,
    // [2] Cleaned up 'extra' block: Only keep generic metadata and EAS project ID
    eas: {
      projectId: "44299887-b9d1-4e31-8ce5-0b8686a8f699",
    },
    router: {},
  },
  plugins: [
    "expo-router",
    // [3] Use expo-build-properties plugin to enforce Kotlin version
    [
      "expo-build-properties",
      {
        android: {
          kotlinVersion: "2.0.21", // <--- CORRECT LOCATION for Kotlin version
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
    "expo-video",
    "expo-web-browser",
    "expo-secure-store",
  ],
});