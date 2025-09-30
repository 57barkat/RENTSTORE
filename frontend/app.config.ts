import { ConfigContext, ExpoConfig } from '@expo/config';

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
    bundleIdentifier: "com.usmannaeem.rentstore",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    ...config.android,
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    package: "com.usmannaeem.rentstore",
  },
  web: {
    ...config.web,
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  extra: {
    ...config.extra,
    // The 'auth0' block has been removed as it conflicts with Google OAuth/Expo Auth
    eas: {
      projectId: "44299887-b9d1-4e31-8ce5-0b8686a8f699",
    },
    router: {},
  },
  plugins: [
    "expo-router",
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
    // The "react-native-auth0" plugin has been removed
    "expo-web-browser",
    "expo-secure-store",
  ],
});