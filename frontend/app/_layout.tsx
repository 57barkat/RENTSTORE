import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import { store } from "../services/store";
import { useColorScheme } from "@/hooks/useColorScheme";


function useAuth() {
  // Replace with real authentication logic
  return false;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const router = useRouter();
  const segments = useSegments();
  const isLoggedIn = useAuth();

  useEffect(() => {
    if (!loaded) return;

    const inAuthGroup =
      segments[0] === "signin" ||
      segments[0] === "signup" ||
      segments[0] === "choose-role";

    if (!isLoggedIn && !inAuthGroup) {
      router.replace("/signin");
    } else if (isLoggedIn && inAuthGroup) {
      // If logged in, redirect away from auth screens if needed
      // router.replace("/home");
    }
  }, [isLoggedIn, loaded, segments, router]);

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          {/* Auth flow */}
          <Stack.Screen name="signin" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="choose-role" options={{ headerShown: false }} />

          {/* App flow */}
          <Stack.Screen name="home" options={{ headerShown: false }} />

          {/* Catch-all */}
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />

        {/* 🔥 Global Toast Provider */}
        <Toast />
      </ThemeProvider>
    </Provider>
  );
}
