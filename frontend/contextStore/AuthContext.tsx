import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthContextType = {
  token: string | null;
  isVerified: boolean;
  login: (newToken: string, verified?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  setVerified: (verified: boolean) => Promise<void>;
  hasToken: boolean;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  isVerified: false,
  login: async () => {},
  logout: async () => {},
  setVerified: async () => {},
  hasToken: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      const storedToken = await AsyncStorage.getItem("accessToken");
      const storedVerified = await AsyncStorage.getItem("isVerified");
      if (storedToken) setToken(storedToken);
      setIsVerified(storedVerified === "true");
    };
    loadData();
  }, []);

  const login = async (newToken: string, verified = false) => {
    setToken(newToken);
    setIsVerified(verified);
    await AsyncStorage.setItem("accessToken", newToken);
    await AsyncStorage.setItem("isVerified", verified ? "true" : "false");
  };

  const setVerified = async (verified: boolean) => {
    setIsVerified(verified);
    await AsyncStorage.setItem("isVerified", verified ? "true" : "false");
  };

  const logout = async () => {
    setToken(null);
    setIsVerified(false);
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("isVerified");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isVerified,
        login,
        logout,
        setVerified,
        hasToken: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
