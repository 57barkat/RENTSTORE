import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text } from "react-native";

type AuthContextType = {
  token: string | null;
  isVerified: boolean;
  hasToken: boolean;
  loading: boolean;
  login: (newToken: string, verified?: boolean) => Promise<void>;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isVerified, setIsVerifiedState] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        console.log("Loading auth from AsyncStorage...");
        const keys = await AsyncStorage.getAllKeys();
        console.log("AsyncStorage keys:", keys);

        const storedToken = await AsyncStorage.getItem("accessToken");
        const storedVerified = await AsyncStorage.getItem("isVerified");

        if (storedToken) setToken(storedToken);
        setIsVerifiedState(storedVerified === "true");

        console.log("Stored token:", storedToken);
        console.log("Verified:", storedVerified);
      } catch (error) {
        console.warn("Error loading auth from AsyncStorage:", error);
      } finally {
        setLoading(false);
        console.log("Auth loading finished");
      }
    };

    loadAuth();
  }, []);

  const login = async (newToken: string, verified = false) => {
    setToken(newToken);
    setIsVerifiedState(verified);
    await AsyncStorage.setItem("accessToken", newToken);
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
      {loading ? (
        <Text>Loading authentication...</Text> // Safe RN rendering
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
