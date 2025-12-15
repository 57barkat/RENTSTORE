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

import { store } from "../services/store";
import { AuthProvider, useAuth } from "@/contextStore/AuthContext";
import {
  ThemeProvider as CustomThemeProvider,
  useTheme,
} from "@/contextStore/ThemeContext";
import { FormProvider } from "@/contextStore/FormContext";
import Header from "@/components/Header";
import { HostelFormProvider } from "@/contextStore/HostelFormContext";
import { ApartmentFormProvider } from "@/contextStore/ApartmentFormContextType";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SidebarProvider } from "@/contextStore/SidebarContext";
import Sidebar from "@/components/SideBar/Sidebar";

const AppContent = () => {
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const { hasToken, loading } = useAuth();
  const isLoggedIn = hasToken;
  const router = useRouter();
  const segments = useSegments();
  const { theme = "light" } = useTheme();

  // --------------------------
  // Redirect logic
  // --------------------------
  const [redirectDone, setRedirectDone] = useState(false);

  useEffect(() => {
    if (!fontsLoaded || loading || redirectDone) return;

    const currentPath = segments.join("/");

    if (!isLoggedIn) {
      router.replace("/signin");
      setRedirectDone(true); // mark as done
      return;
    }

    // Only redirect if logged in and not already on homePage
    if (isLoggedIn && currentPath !== "homePage") {
      router.replace("/homePage");
      setRedirectDone(true); // mark as done
    }
  }, [fontsLoaded, loading, isLoggedIn, segments, router, redirectDone]);

  // --------------------------
  // Loader while fonts or auth are loading
  // --------------------------
  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // --------------------------
  // Hide header on specific screens
  // --------------------------
  const hideHeaderScreens = [
    "signin",
    "signup",
    "choose-role",
    "Verification",
    "property/[id]",
    "property/edit/[id]",
    "property/View/[type]",
  ];
  const currentSegment = segments[segments.length - 1];
  const hideHeader = hideHeaderScreens.includes(currentSegment);

  return (
    <>
      {!hideHeader && <Header />}

      <Stack screenOptions={{ headerShown: false }}>
        {/* Auth Screens */}
        <Stack.Screen name="signin" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="choose-role" />
        <Stack.Screen name="Verification" />

        {/* Property Screens */}
        <Stack.Screen name="property/[id]" />
        <Stack.Screen name="property/View/[type]" />

        <Stack.Screen name="property/edit/[id]" />

        {/* Screens with FormProvider */}
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
    </>
  );
};

export default function RootLayout() {
  const { theme = "light" } = useTheme();

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AuthProvider>
          <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
            <ApartmentFormProvider>
              <HostelFormProvider>
                <FormProvider>
                  <CustomThemeProvider>
                    <SidebarProvider>
                      <Sidebar />
                      <AppContent />
                    </SidebarProvider>
                  </CustomThemeProvider>
                </FormProvider>
              </HostelFormProvider>
            </ApartmentFormProvider>
          </ThemeProvider>
        </AuthProvider>
      </Provider>
    </SafeAreaProvider>
  );
}
