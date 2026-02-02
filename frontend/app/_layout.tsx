import React, { useEffect, useState } from "react";
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
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as NavigationBar from "expo-navigation-bar";

import { store } from "../services/store";
import { AuthProvider, useAuth } from "@/contextStore/AuthContext";
import {
  ThemeProvider as CustomThemeProvider,
  useTheme,
} from "@/contextStore/ThemeContext";
import { FormProvider } from "@/contextStore/FormContext";
import Header from "@/components/Header";
import { ApartmentFormProvider } from "@/contextStore/ApartmentFormContextType";
import { SidebarProvider } from "@/contextStore/SidebarContext";
import Sidebar from "@/components/SideBar/Sidebar";

const AppContent = () => {
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const { isAuthenticated, loading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const [redirectDone, setRedirectDone] = useState(false);

  useEffect(() => {
    const hideSystemUI = async () => {
      try {
        await NavigationBar.setVisibilityAsync("hidden");
        await NavigationBar.setBehaviorAsync("sticky-immersive" as any);
      } catch (e) {
        console.warn("Navigation Bar Error: ", e);
      }
    };

    hideSystemUI();

    if (!fontsLoaded || loading || redirectDone) return;

    const currentPath = segments.join("/");

    if (!isAuthenticated) {
      router.replace("/signin");
      setRedirectDone(true);
      return;
    }

    if (isAuthenticated && currentPath !== "homePage") {
      router.replace("/homePage");
      setRedirectDone(true);
    }
  }, [fontsLoaded, loading, isAuthenticated, segments, redirectDone]);

  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // Screens where Header should be hidden
  const hideHeaderScreens = new Set([
    "signin",
    "signup",
    "choose-role",
    "Verification",
    "property/[id]",
    "property/edit/[id]",
    "property/View/[type]",
  ]);
  const currentSegment = segments[segments.length - 1];
  const hideHeader = hideHeaderScreens.has(currentSegment);

  return (
    <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
      {!hideHeader && <Header />}
      <Sidebar />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="signin" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="choose-role" />
        <Stack.Screen name="Verification" />

        <Stack.Screen name="property/[id]" />
        <Stack.Screen name="property/View/[type]" />
        <Stack.Screen name="property/edit/[id]" />
        <Stack.Screen name="MyListingsScreen" />
        <Stack.Screen name="DraftProperties" />
        <Stack.Screen name="upload" />
        <Stack.Screen name="PrivacyPolicyScreen" />
        <Stack.Screen name="favorites" />
        <Stack.Screen name="ChatListScreen" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>

      <StatusBar style="auto" />
      <Toast />
    </ThemeProvider>
  );
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AuthProvider>
          <CustomThemeProvider>
            <ApartmentFormProvider>
              <FormProvider>
                <SidebarProvider>
                  <AppContent />
                </SidebarProvider>
              </FormProvider>
            </ApartmentFormProvider>
          </CustomThemeProvider>
        </AuthProvider>
      </Provider>
    </SafeAreaProvider>
  );
}
