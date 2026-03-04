"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { tokenManager } from "../services/tokenManager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { disconnectSocket } from "@/services/socket";

export type UserType = {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  isPhoneVerified: boolean;
};

type AuthContextType = {
  user: UserType | null;
  isAuthenticated: boolean;
  isPhoneVerified: boolean;
  loading: boolean;
  login: (response: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuthState: () => Promise<void>;
  setVerified: (status: boolean) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshAuthState = useCallback(async () => {
    await tokenManager.load();
    const accessToken = tokenManager.getAccessToken();
    const storedUserData = tokenManager.getUserData();
    const verified = await tokenManager.getPhoneVerified();

    if (accessToken && storedUserData) {
      setUser(storedUserData);
      setIsAuthenticated(true);
      setIsPhoneVerified(verified === "true");
    }
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await refreshAuthState();
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [refreshAuthState]);

  const login = async (response: any) => {
    const {
      accessToken,
      refreshToken,
      user: userData,
      role,
      isphoneverified,
    } = response;

    if (!accessToken || !refreshToken) {
      throw new Error("Missing tokens in server response");
    }

    const verifiedStatus =
      isphoneverified === true || isphoneverified === "true";

    const finalUser: UserType = {
      id: userData?.id || userData?._id,
      name: userData?.name,
      email: userData?.email,
      profileImage: userData?.profileImage,
      role: role || userData?.role,
      isPhoneVerified: verifiedStatus,
    };

    await tokenManager.setTokens(accessToken, refreshToken);
    await tokenManager.setUserData(finalUser);
    await tokenManager.setPhoneVerified(verifiedStatus);

    if (finalUser.id) {
      await AsyncStorage.setItem("userId", finalUser.id);
    }

    setUser(finalUser);
    setIsAuthenticated(true);
    setIsPhoneVerified(verifiedStatus);
  };

  const logout = async () => {
    disconnectSocket();
    await tokenManager.clear();
    await AsyncStorage.removeItem("userId");
    setUser(null);
    setIsAuthenticated(false);
    setIsPhoneVerified(false);
  };

  const setVerified = async (status: boolean) => {
    await tokenManager.setPhoneVerified(status);
    setIsPhoneVerified(status);
    if (user) {
      const updatedUser = { ...user, isPhoneVerified: status };
      setUser(updatedUser);
      await tokenManager.setUserData(updatedUser);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isPhoneVerified,
        loading,
        login,
        logout,
        refreshAuthState,
        setVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});
