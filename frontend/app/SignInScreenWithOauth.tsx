import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useEffect } from "react";
import { TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contextStore/AuthContext";
import { useLoginWithGoogleMutation } from "@/services/api";

WebBrowser.maybeCompleteAuthSession();

export default function GoogleLoginButton() {
  const router = useRouter();
  const { login } = useAuth();

  const [loginWithGoogle] = useLoginWithGoogleMutation();

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "311271558655-dbrfn63org9ol6humtt5dsbharh3mbg6.apps.googleusercontent.com",
    iosClientId:
      "311271558655-v5ubb2pq4qccn6ru5q4apg50q15t9m98.apps.googleusercontent.com",
    webClientId:
      "311271558655-dbrfn63org9ol6humtt5dsbharh3mbg6.apps.googleusercontent.com",
  });

  useEffect(() => {
    const handleAuth = async () => {
      if (response?.type === "success") {
        const { authentication } = response;
        // send Google accessToken to your backend for verification
        const res = await loginWithGoogle({
          access_token: authentication?.accessToken,
        }).unwrap();

        await login(res.accessToken);
        console.log(res);
        router.replace("/homePage");
      }
    };
    handleAuth();
  }, [response]);

  return (
    <TouchableOpacity
      disabled={!request}
      onPress={() => promptAsync({ useProxy: true } as any)}
      style={{
        backgroundColor: "#4285F4",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "600" }}>
        Continue with Google
      </Text>
    </TouchableOpacity>
  );
}
