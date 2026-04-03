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
import { useLazyGetMeQuery } from "@/services/api";

export type UserType = {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  isPhoneVerified: boolean;
  propertyLimit?: number;
  usedPropertyCount?: number;
  paidPropertyCredits?: number;
  paidFeaturedCredits?: number;
};

type AuthContextType = {
  user: UserType | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isPhoneVerified: boolean;
  loading: boolean;
  login: (response: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuthState: () => Promise<void>;
  setVerified: (status: boolean) => Promise<void>;
  updateUser: (newUserData: Partial<UserType>) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ triggerGetMe is a function we can call safely anywhere
  const [triggerGetMe, { data: latestUserData }] = useLazyGetMeQuery();

  /**
   * Syncs the RTK Query data into the AuthContext state
   */
  useEffect(() => {
    if (latestUserData) {
      const latestUser = (latestUserData as any).user || latestUserData;

      const formattedUser: UserType = {
        id: latestUser.id || latestUser._id,
        name: latestUser.name,
        email: latestUser.email,
        profileImage: latestUser.profileImage,
        role: latestUser.role,
        isPhoneVerified:
          latestUser.isphoneverified === true ||
          latestUser.isPhoneVerified === true,
        propertyLimit: latestUser.propertyLimit,
        usedPropertyCount: latestUser.usedPropertyCount,
        paidPropertyCredits: latestUser.paidPropertyCredits,
        paidFeaturedCredits: latestUser.paidFeaturedCredits,
      };

      setUser(formattedUser);
      setIsPhoneVerified(formattedUser.isPhoneVerified);
      tokenManager.setUserData(formattedUser);
    }
  }, [latestUserData]);

  const refreshAuthState = useCallback(async () => {
    try {
      await tokenManager.load();
      const accessToken = tokenManager.getAccessToken();
      if (accessToken) {
        // ✅ Calling the trigger function instead of refetch
        await triggerGetMe().unwrap();
      } else {
        setIsGuest(true);
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Manual refresh failed", error);
    }
  }, [triggerGetMe]);

  /**
   * Initial Bootstrap
   */
  useEffect(() => {
    const bootstrap = async () => {
      try {
        await tokenManager.load();
        const accessToken = tokenManager.getAccessToken();
        const storedUser = tokenManager.getUserData();

        if (accessToken && storedUser) {
          setUser(storedUser);
          setIsAuthenticated(true);
          setIsGuest(false);
          setIsPhoneVerified(storedUser.isPhoneVerified);

          // ✅ This is now safe to call during bootstrap!
          triggerGetMe();
        } else {
          setIsGuest(true);
          setIsAuthenticated(false);
        }
      } catch (e) {
        console.error("Auth bootstrap failed", e);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [triggerGetMe]);

  // ... login, updateUser, logout, setVerified stay exactly the same ...
  const login = async (response: any) => {
    const {
      accessToken,
      refreshToken,
      user: userData,
      role,
      isphoneverified,
    } = response;
    if (!accessToken || !refreshToken) throw new Error("Missing tokens");

    const verifiedStatus =
      isphoneverified === true || isphoneverified === "true";
    const finalUser: UserType = {
      id: userData?.id || userData?._id,
      name: userData?.name,
      email: userData?.email,
      profileImage: userData?.profileImage,
      role: role || userData?.role,
      isPhoneVerified: verifiedStatus,
      propertyLimit: userData?.propertyLimit,
      usedPropertyCount: userData?.usedPropertyCount,
      paidPropertyCredits: userData?.paidPropertyCredits,
      paidFeaturedCredits: userData?.paidFeaturedCredits,
    };

    await tokenManager.setTokens(accessToken, refreshToken);
    await tokenManager.setUserData(finalUser);
    await tokenManager.setPhoneVerified(verifiedStatus);
    if (finalUser.id) await AsyncStorage.setItem("userId", finalUser.id);

    setUser(finalUser);
    setIsAuthenticated(true);
    setIsGuest(false);
    setIsPhoneVerified(verifiedStatus);
  };

  const updateUser = async (newUserData: Partial<UserType> | any) => {
    if (!user) return;
    const dataToMerge = newUserData.user ? newUserData.user : newUserData;
    const updatedUser = {
      ...user,
      ...dataToMerge,
      id: dataToMerge.id || dataToMerge._id || user.id,
    };
    setUser(updatedUser);
    await tokenManager.setUserData(updatedUser);
  };

  const logout = async () => {
    disconnectSocket();
    await tokenManager.clear();
    await AsyncStorage.removeItem("userId");
    setUser(null);
    setIsAuthenticated(false);
    setIsGuest(true);
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
        isGuest,
        isPhoneVerified,
        loading,
        login,
        logout,
        refreshAuthState,
        setVerified,
        updateUser,
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
