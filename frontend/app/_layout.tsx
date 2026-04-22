import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { LengthProvider } from "@/contextStore/LengthContext";
import { UserStatsProvider } from "@/contextStore/UserStatsContext";

if (__DEV__) {
  require("../ReactotronConfig");
}

const AppContent = () => {
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const {
    isAuthenticated,
    isGuest,
    loading,
    authExitReason,
    clearAuthExitReason,
  } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const currentSegments = segments as string[];
  const [navReady, setNavReady] = useState(false);
  const previousAuthRef = useRef(false);

  const rootSegment = currentSegments[0] ?? "";
  const nestedSegment = currentSegments[1] ?? "";
  const isAuthRoute = ["signin", "signup"].includes(rootSegment);
  const isProtectedRoute = useMemo(() => {
    if (
      [
        "OwnerDashboard",
        "ChatListScreen",
        "favorites",
        "MyListingsScreen",
        "upload",
        "DraftProperties",
        "TransactionHistory",
      ].includes(rootSegment)
    ) {
      return true;
    }

    if (rootSegment === "chat") {
      return true;
    }

    if (rootSegment === "shop" && nestedSegment === "BuyCredits") {
      return true;
    }

    return false;
  }, [nestedSegment, rootSegment]);

  useEffect(() => {
    const setupSystemUI = async () => {
      try {
        await NavigationBar.setVisibilityAsync("hidden");
        await NavigationBar.setBehaviorAsync("overlay-swipe");
        await NavigationBar.setBackgroundColorAsync(
          theme === "dark" ? "#000000" : "#ffffff",
        );
      } catch (e) {
        console.warn("Navigation bar error:", e);
      }
    };
    setupSystemUI();
  }, [theme]);

  useEffect(() => {
    if (!fontsLoaded || loading) return;
    const wasAuthenticated = previousAuthRef.current;

    const timeout = setTimeout(() => {
      if (isAuthenticated) {
        previousAuthRef.current = true;
        clearAuthExitReason();

        if (isAuthRoute) {
          setNavReady(false);
          router.replace("/");
          return;
        }

        setNavReady(true);
        return;
      }

      previousAuthRef.current = false;

      if (isGuest && isProtectedRoute) {
        setNavReady(false);

        if (wasAuthenticated || authExitReason) {
          router.replace("/");
          return;
        }

        router.replace("/signin");
        return;
      }

      if (!isProtectedRoute && authExitReason) {
        clearAuthExitReason();
      }

      setNavReady(true);
    }, 1);
    return () => clearTimeout(timeout);
  }, [
    authExitReason,
    clearAuthExitReason,
    fontsLoaded,
    isAuthRoute,
    isAuthenticated,
    isGuest,
    isProtectedRoute,
    loading,
    router,
  ]);

  if (!fontsLoaded || loading || !navReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme === "dark" ? "#000" : "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
      <Sidebar />
      <Stack
        screenOptions={{
          headerShown: true,
          header: () => <Header />,
          animation: "slide_from_right",
          animationDuration: 200,
        }}
      >
        <Stack.Screen
          name="signin"
          options={{
            headerShown: false,
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="signup"
          options={{
            headerShown: false,
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="choose-role"
          options={{
            headerShown: false,
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="Verification"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="chat/[roomId]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="property/[id]"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="property/View/[type]"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="property/edit/[id]"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen name="MyListingsScreen" />
        <Stack.Screen name="TransactionHistory" />
        <Stack.Screen name="shop/BuyCredits.tsx" />
        <Stack.Screen name="DraftProperties" />
        <Stack.Screen name="OwnerDashboard" />
        <Stack.Screen name="upload" />
        <Stack.Screen name="PrivacyPolicyScreen" />
        <Stack.Screen name="favorites" />
        <Stack.Screen name="NearbyScreen" />
        <Stack.Screen name="ChatListScreen" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Toast />
    </ThemeProvider>
  );
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AuthProvider>
          <LengthProvider>
            <CustomThemeProvider>
              <FormProvider>
                <SidebarProvider>
                  <UserStatsProvider>
                    <AppContent />
                  </UserStatsProvider>
                </SidebarProvider>
              </FormProvider>
            </CustomThemeProvider>
          </LengthProvider>
        </AuthProvider>
      </Provider>
    </SafeAreaProvider>
  );
}
