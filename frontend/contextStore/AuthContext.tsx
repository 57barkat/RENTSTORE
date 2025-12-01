import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, View, StyleSheet } from "react-native";
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
  const [progress, setProgress] = useState<number>(1); // 1% start

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const steps = [
          async () => {
            const storedToken = await AsyncStorage.getItem("accessToken");
            const storedRefresh = await AsyncStorage.getItem("refreshToken");
            const storedVerified = await AsyncStorage.getItem("isVerified");
            setIsVerifiedState(storedVerified === "true");
            setProgress(20); // 20% after reading AsyncStorage
            return { storedToken, storedRefresh };
          },
          async ({ storedToken, storedRefresh }: any) => {
            if (storedToken) {
              const response = await fetch(`${API_URL}/api/v1/users/refresh`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${storedToken}`,
                },
                body: JSON.stringify({ refreshToken: storedRefresh }),
              });

              setProgress(50); // 50% after sending refresh request

              if (response.ok) {
                const data = await response.json();
                setToken(data.accessToken);
                await AsyncStorage.setItem("accessToken", data.accessToken);
                await AsyncStorage.setItem("refreshToken", data.refreshToken);
                setProgress(100); // 100% on success
                return;
              } else {
                await logout();
                setProgress(100);
              }
            } else {
              setProgress(100); // No token, done
            }
          },
        ];

        let stepData: any = {};
        for (const step of steps) {
          stepData = await step(stepData);
        }
      } catch (error) {
        console.warn("Error refreshing token:", error);
        await logout();
        setProgress(100);
      } finally {
        setLoading(false);
      }
    };

    // Animate progress smoothly
    const animateProgress = () => {
      let current = 1;
      const interval = setInterval(() => {
        if (current < progress) {
          current += 1;
          setProgress(current);
        } else {
          clearInterval(interval);
        }
      }, 20); // adjust speed
    };

    const run = async () => {
      await loadAuth();
      animateProgress();
    };

    run();
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
