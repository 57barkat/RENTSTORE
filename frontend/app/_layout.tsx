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

  useEffect(() => {
    const setupSystemUI = async () => {
      try {
        await NavigationBar.setVisibilityAsync("hidden");
        await NavigationBar.setBehaviorAsync("overlay-swipe");
        await NavigationBar.setBackgroundColorAsync(
          theme === "dark" ? "#000000" : "#ffffff",
        );
      } catch (e) {
        console.warn("Navigation Bar Error: ", e);
      }
    };
    setupSystemUI();
  }, [theme]);

  useEffect(() => {
    if (!fontsLoaded || loading) return;

    const segment = segments[0] ?? "";
    const inAuthGroup =
      segment === "(auth)" || segment === "signin" || segment === "signup";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/signin");
    } else if (isAuthenticated && (inAuthGroup || segment === "")) {
      router.replace("/homePage");
    }
  }, [fontsLoaded, loading, isAuthenticated, segments]);

  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  const hideHeaderScreens = new Set([
    "signin",
    "signup",
    "choose-role",
    "Verification",
    "property/[id]",
    "property/edit/[id]",
    "property/View/[type]",
    "chat/[roomId]",
  ]);

  const currentSegment = segments[segments.length - 1] ?? "";
  const currentPath = segments.join("/");

  const hideHeader =
    hideHeaderScreens.has(currentSegment) || hideHeaderScreens.has(currentPath);

  return (
    <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
      {!hideHeader && <Header />}
      <Sidebar />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="signin" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="choose-role" />
        <Stack.Screen name="Verification" />
        <Stack.Screen name="chat/[roomId]" />
        <Stack.Screen name="property/[id]" />
        <Stack.Screen name="property/View/[type]" />
        <Stack.Screen name="property/edit/[id]" />
        <Stack.Screen name="MyListingsScreen" />
        <Stack.Screen name="DraftProperties" />
        <Stack.Screen name="upload" />
        <Stack.Screen name="PrivacyPolicyScreen" />
        <Stack.Screen name="favorites" />
        <Stack.Screen name="NearbyScreen" />
        <Stack.Screen name="ChatListScreen" />
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
            <FormProvider>
              <SidebarProvider>
                <AppContent />
              </SidebarProvider>
            </FormProvider>
          </CustomThemeProvider>
        </AuthProvider>
      </Provider>
    </SafeAreaProvider>
  );
}
