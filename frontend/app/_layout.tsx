import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import { store } from "../services/store";
import { AuthProvider, useAuth } from "@/contextStore/AuthContext";
import Header from "@/components/Header";
import {
  ThemeProvider as CustomThemeProvider,
  useTheme,
} from "@/contextStore/ThemeContext";

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const router = useRouter();
  const segments = useSegments();
  const isLoggedIn = useAuth();
  const { theme } = useTheme?.() ?? { theme: "light" };

  useEffect(() => {
    if (!loaded) return;

    const inAuthGroup =
      segments[0] === "signin" ||
      segments[0] === "signup" ||
      segments[0] === "choose-role";

    if (!isLoggedIn && !inAuthGroup) {
      router.replace("/signin");
    }
  }, [isLoggedIn, loaded, segments, router]);

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // const currentSegment = segments[segments.length - 1];
  // const inAuthGroup =
  //   currentSegment === "signin" ||
  //   currentSegment === "signup" ||
  //   currentSegment === "choose-role";

  // const hideHeader = inAuthGroup;
  // || currentSegment === "profile";

  return (
    <Provider store={store}>
      <AuthProvider>
        <CustomThemeProvider>
          <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
            {/* {!hideHeader && <Header />} */}
            <Header />
            <Stack>
              <Stack.Screen name="signin" options={{ headerShown: false }} />
              <Stack.Screen name="signup" options={{ headerShown: false }} />
              <Stack.Screen
                name="choose-role"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="property/[id]"
                options={{ headerShown: false }}
              />
               <Stack.Screen
                name="property/edit/[id]"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="MyListingsScreen"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

              <Stack.Screen name="+not-found" />
            </Stack>

            <StatusBar style="auto" />
            <Toast />
          </ThemeProvider>
        </CustomThemeProvider>
      </AuthProvider>
    </Provider>
  );
}
