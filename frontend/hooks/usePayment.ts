import { useState, useEffect } from "react";
import { Alert } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useAuth } from "@/contextStore/AuthContext";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { tokenManager } from "@/services/tokenManager";

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const { user, updateUser, refreshAuthState } = useAuth();
  const router = useRouter();

  const getSecret = () =>
    Constants?.expoConfig?.extra?.myAppSecret || "aganstaysecretkey";

  const verifyPaymentOnBackend = async (tracker: string) => {
    setLoading(true);
    try {
      await tokenManager.load();
      const token = tokenManager.getAccessToken();

      const res = await fetch(
        `https://banefully-jointed-freya.ngrok-free.dev/api/v1/payments/verify?tracker=${tracker}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-frontend-secret": getSecret(),
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await res.json();

      if (data.success || data.state === "TRACKER_COMPLETED") {
        if (data.user) await updateUser(data.user);
        Alert.alert("Success", "Credits updated!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Pending", "Confirmation not received from bank yet.");
      }
    } catch (err: any) {
      Alert.alert("Error", "Failed to verify payment.", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (packageId: string) => {
    setLoading(true);
    try {
      await tokenManager.load();
      const token = tokenManager.getAccessToken();

      const res = await fetch(
        "https://banefully-jointed-freya.ngrok-free.dev/api/v1/payments/create-checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-frontend-secret": getSecret(),
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: user?.id, packageId }),
        },
      );

      const data = await res.json();
      if (!data.url) throw new Error("Invalid session");

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        "rentstoreapp://",
      );

      if (result.type === "success" && result.url) {
        const parsed = Linking.parse(result.url);
        const tracker = parsed.queryParams?.tracker as string;
        if (tracker) verifyPaymentOnBackend(tracker);
      } else {
        refreshAuthState();
      }
    } catch (err: any) {
      Alert.alert("Error", "Could not initiate payment flow.", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleUrl = (url: string) => {
      const parsed = Linking.parse(url);
      const tracker = parsed.queryParams?.tracker as string;
      if (tracker) verifyPaymentOnBackend(tracker);
    };

    const sub = Linking.addEventListener("url", (event) =>
      handleUrl(event.url),
    );
    Linking.getInitialURL().then((url) => url && handleUrl(url));
    return () => sub.remove();
  }, []);

  return { handlePayment, loading };
};
