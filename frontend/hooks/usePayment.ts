import { useState, useEffect } from "react";
import { Alert } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useAuth } from "@/contextStore/AuthContext";
import { useRouter } from "expo-router";
import { tokenManager } from "@/services/tokenManager";
import { API_URL } from "@/services/api";

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const { updateUser, refreshAuthState } = useAuth();
  const router = useRouter();

  const verifyPaymentOnBackend = async (tracker: string) => {
    setLoading(true);
    try {
      await tokenManager.load();
      const token = tokenManager.getAccessToken();
      if (!token) throw new Error("Authentication required");

      const res = await fetch(
        `${API_URL}/api/v1/payments/verify?tracker=${tracker}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
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
      if (!token) throw new Error("Authentication required");

      const res = await fetch(`${API_URL}/api/v1/payments/create-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ packageId }),
      });

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
