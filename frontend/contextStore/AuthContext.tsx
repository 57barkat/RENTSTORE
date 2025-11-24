import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text } from "react-native";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.apiUrl;

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [isVerified, setIsVerifiedState] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("accessToken");
        const storedRefresh = await AsyncStorage.getItem("refreshToken");
        const storedVerified = await AsyncStorage.getItem("isVerified");

        setIsVerifiedState(storedVerified === "true");

        if (storedToken) {
          // Try refresh on app start
          const response = await fetch(`${API_URL}/api/v1/users/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${storedToken}`,
            },
            body: JSON.stringify({ refreshToken: storedRefresh }),
          });

          if (response.ok) {
            const data = await response.json();
            setToken(data.accessToken);
            await AsyncStorage.setItem("accessToken", data.accessToken);
            await AsyncStorage.setItem("refreshToken", data.refreshToken);
            console.log("Access token refreshed on app start");
          } else {
            // refresh failed
            await logout();
          }
        }
      } catch (error) {
        console.warn("Error refreshing token:", error);
        await logout();
      } finally {
        setLoading(false);
      }
    };

    loadAuth();
  }, []);

  const login = async (
    accessToken: string,
    refreshToken: string,
    verified = false
  ) => {
    setToken(accessToken);
    setIsVerifiedState(verified);
    await AsyncStorage.setItem("accessToken", accessToken);
    await AsyncStorage.setItem("refreshToken", refreshToken);
    await AsyncStorage.setItem("isVerified", verified ? "true" : "false");
  };

  const setVerified = async (verified: boolean) => {
    setIsVerifiedState(verified);
    await AsyncStorage.setItem("isVerified", verified ? "true" : "false");
  };

  const logout = async () => {
    setToken(null);
    setIsVerifiedState(false);
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
    await AsyncStorage.removeItem("isVerified");
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
        setVerified,
      }}
    >
      {loading ? <Text>Loading authentication...</Text> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
