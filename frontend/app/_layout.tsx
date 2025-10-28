import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { Stack, useRouter, useSegments } from "expo-router";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { useFonts } from "expo-font";

import { store } from "../services/store";
import { AuthProvider, useAuth } from "@/contextStore/AuthContext";
import {
  ThemeProvider as CustomThemeProvider,
  useTheme,
} from "@/contextStore/ThemeContext";
import { FormProvider } from "@/contextStore/FormContext";
import Header from "@/components/Header";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const router = useRouter();
  const segments = useSegments();
  const isLoggedIn = useAuth();
  const { theme } = useTheme?.() ?? { theme: "light" };

  useEffect(() => {
    if (!fontsLoaded) return;

    const inAuthGroup =
      segments[0] === "signin" ||
      segments[0] === "signup" ||
      segments[0] === "choose-role";

    if (!isLoggedIn && !inAuthGroup) {
      router.replace("/signin");
    }
  }, [isLoggedIn, fontsLoaded, segments, router]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // Screens where the custom Header should be hidden
  const hideHeaderScreens = [
    "signin",
    "signup",
    "choose-role",
    "Verification",
    "property/[id]",
    "property/edit/[id]",
  ];
  const currentSegment = segments[segments.length - 1];
  const hideHeader = hideHeaderScreens.includes(currentSegment);

  return (
    
    <Provider store={store}>
      <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
        <FormProvider>
          <AuthProvider>
            <CustomThemeProvider>
              {/* Show custom header only if not hidden */}
              {!hideHeader && <Header />}

              <Stack screenOptions={{ headerShown: false }}>
                {/* Auth Screens */}
                <Stack.Screen name="signin" />
                <Stack.Screen name="signup" />
                <Stack.Screen name="choose-role" />
                <Stack.Screen name="Verification" />

                {/* Property Screens */}
                <Stack.Screen name="property/[id]" />
                <Stack.Screen name="property/edit/[id]" />

                {/* Screens that need FormProvider */}

                <Stack.Screen name="MyListingsScreen" />
                <Stack.Screen name="DraftProperties" />
                <Stack.Screen name="upload" />

                {/* Other Screens */}
                <Stack.Screen name="PrivacyPolicyScreen" />
                <Stack.Screen name="favorites" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="+not-found" />
              </Stack>

              <StatusBar style="auto" />
              <Toast />
            </CustomThemeProvider>
          </AuthProvider>
        </FormProvider>
      </ThemeProvider>
    </Provider>
  );
}
