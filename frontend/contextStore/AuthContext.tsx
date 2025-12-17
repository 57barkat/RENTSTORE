import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, View, StyleSheet } from "react-native";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.apiUrl ?? "";

type AuthContextType = {
  token: string | null;
  isVerified: boolean;
  hasToken: boolean;
  loading: boolean;
  login: (
    accessToken: string,
    refreshToken: string,
    verified?: boolean
  ) => Promise<void>;
  logout: () => Promise<void>;
  setVerified: (verified: boolean) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  isVerified: false,
  hasToken: false,
  loading: true,
  login: async () => {},
  logout: async () => {},
  setVerified: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(1);

  useEffect(() => {
    let mounted = true;

    const loadAuth = async () => {
      try {
        const storedAccessToken = await AsyncStorage.getItem("accessToken");
        const storedRefreshToken = await AsyncStorage.getItem("refreshToken");
        const storedVerified = await AsyncStorage.getItem("isVerified");

        if (!mounted) return;

        setIsVerified(storedVerified === "true");
        setProgress(30);

        if (storedAccessToken && storedRefreshToken) {
          const response = await fetch(`${API_URL}/api/v1/users/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              refreshToken: storedRefreshToken,
            }),
          });

          setProgress(60);

          if (response.ok) {
            const data = await response.json();

            if (!mounted) return;

            setToken(data.accessToken);

            await AsyncStorage.multiSet([
              ["accessToken", data.accessToken],
              ["refreshToken", data.refreshToken],
            ]);

            setProgress(100);
          } else {
            await logout();
            setProgress(100);
          }
        } else {
          setProgress(100);
        }
      } catch (err) {
        console.warn("Auth bootstrap error:", err);
        await logout();
        setProgress(100);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (
    accessToken: string,
    refreshToken: string,
    verified = false
  ) => {
    setToken(accessToken);
    setIsVerified(verified);

    await AsyncStorage.multiSet([
      ["accessToken", accessToken],
      ["refreshToken", refreshToken],
      ["isVerified", verified ? "true" : "false"],
    ]);
  };

  const logout = async () => {
    setToken(null);
    setIsVerified(false);

    await AsyncStorage.multiRemove([
      "accessToken",
      "refreshToken",
      "isVerified",
    ]);
  };

  const setVerifiedFlag = async (verified: boolean) => {
    setIsVerified(verified);
    await AsyncStorage.setItem("isVerified", verified ? "true" : "false");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isVerified,
        hasToken: !!token,
        loading,
        login,
        logout,
        setVerified: setVerifiedFlag,
      }}
    >
      {loading ? (
        <View style={styles.loaderContainer}>
          <Text style={styles.loaderText}>
            Loading authentication... {progress}%
          </Text>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loaderText: {
    fontSize: 16,
    marginBottom: 10,
  },
  progressBarBackground: {
    width: "80%",
    height: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#4caf50",
  },
});
