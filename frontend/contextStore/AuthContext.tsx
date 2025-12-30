import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator, StyleSheet } from "react-native";

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

  useEffect(() => {
    let mounted = true;

    const bootstrapAuth = async () => {
      try {
        const [[, accessToken], [, verified]] = await AsyncStorage.multiGet([
          "accessToken",
          "isVerified",
        ]);

        if (!mounted) return;

        setToken(accessToken ?? null);
        setIsVerified(verified === "true");
      } catch (error) {
        console.warn("Auth bootstrap error:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    bootstrapAuth();

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
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
