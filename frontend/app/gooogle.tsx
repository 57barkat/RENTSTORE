import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useEffect } from "react";
import { makeRedirectUri } from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

export default function useGoogleAuth() {
  const redirectUri = makeRedirectUri({
    scheme: "frontend",         
  });
  console.log("Redirect URI:", redirectUri);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "1234567890-abc123def456ghi789.apps.googleusercontent.com",
    scopes: ["profile", "email"],
    redirectUri,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      if (!authentication) throw new Error("Authentication failed");
      console.log("Access Token:", authentication.accessToken);

      fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${authentication.accessToken}` },
      })
        .then((res) => res.json())
        .then((data) => console.log("Google User Info:", data));
    }
  }, [response]);

  return { promptAsync };
}
