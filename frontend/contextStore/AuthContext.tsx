/* eslint-disable */
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
import { disconnectSocket, connectSocket } from "@/services/socket";
import { useLazyGetMeQuery } from "@/services/api";
import SubscriptionStatusModal from "@/components/SubscriptionStatusModal";

export type UserType = {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  isPhoneVerified: boolean;
  propertyLimit: number;
  usedPropertyCount: number;
  paidPropertyCredits: number;
  paidFeaturedCredits: number;
  propertyCredits: number;
  featuredCredits: number;
  prioritySlotCredits: number;
  subscription: string;
  subscriptionAutoRenew: boolean;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  subscriptionTrialUsed: boolean;
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
  showStatus: (
    title: string,
    message: string,
    type?: "info" | "warning" | "success",
  ) => void;
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
  const [statusModal, setStatusModal] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "info" | "warning" | "success",
  });

  const [triggerGetMe, { data: latestUserData }] = useLazyGetMeQuery();

  const showStatus = (
    title: string,
    message: string,
    type: "info" | "warning" | "success" = "info",
  ) => {
    setStatusModal({ visible: true, title, message, type });
  };

  const formatUserResponse = (
    rawData: any,
    topLevelRole?: string,
    topLevelVerified?: any,
  ): UserType => {
    const u = rawData.user || rawData;
    return {
      id: u.id || u._id,
      name: u.name,
      email: u.email,
      profileImage: u.profileImage,
      role: topLevelRole || u.role,
      isPhoneVerified:
        topLevelVerified === true ||
        u.isphoneverified === true ||
        u.isPhoneVerified === true,
      propertyLimit: u.propertyLimit ?? 0,
      usedPropertyCount: u.usedPropertyCount ?? 0,
      paidPropertyCredits: u.paidPropertyCredits ?? 0,
      paidFeaturedCredits: u.paidFeaturedCredits ?? 0,
      propertyCredits: u.propertyCredits ?? 0,
      featuredCredits: u.featuredCredits ?? 0,
      subscription: u.subscription || "free",
      subscriptionAutoRenew: !!u.subscriptionAutoRenew,
      subscriptionStartDate: u.subscriptionStartDate,
      subscriptionEndDate: u.subscriptionEndDate,
      subscriptionTrialUsed: !!u.subscriptionTrialUsed,
      prioritySlotCredits: u.prioritySlotCredits ?? 0,
    };
  };

  useEffect(() => {
    if (!isAuthenticated || isGuest || !user?.id) return;

    let socketInstance: any;

    const setupSocket = async () => {
      try {
        socketInstance = await connectSocket();
        socketInstance.on(
          "SUBSCRIPTION_MESSAGE",
          async (data: { message: string }) => {
            showStatus(
              "Plan Updated",
              data.message ||
                "Your subscription has expired and your account has been moved to the free tier.",
              "warning",
            );
            try {
              await triggerGetMe().unwrap();
            } catch (err) {
              console.error(err);
            }
          },
        );
      } catch (error) {
        console.error(error);
      }
    };

    setupSocket();

    return () => {
      if (socketInstance) {
        socketInstance.off("SUBSCRIPTION_MESSAGE");
      }
    };
  }, [isAuthenticated, isGuest, user?.id, triggerGetMe]);

  useEffect(() => {
    if (latestUserData) {
      const formatted = formatUserResponse(latestUserData);
      setUser(formatted);
      setIsPhoneVerified(formatted.isPhoneVerified);
      tokenManager.setUserData(formatted);
    }
  }, [latestUserData]);

  const refreshAuthState = useCallback(async () => {
    try {
      await tokenManager.load();
      const accessToken = tokenManager.getAccessToken();
      if (accessToken) {
        await triggerGetMe().unwrap();
      } else {
        setIsGuest(true);
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error(error);
    }
  }, [triggerGetMe]);

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
          triggerGetMe();
        } else {
          setIsGuest(true);
          setIsAuthenticated(false);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [triggerGetMe]);

  const login = async (response: any) => {
    const {
      accessToken,
      refreshToken,
      user: userData,
      role,
      isphoneverified,
    } = response;
    if (!accessToken || !refreshToken) throw new Error("Missing tokens");

    const finalUser = formatUserResponse(userData, role, isphoneverified);

    await tokenManager.setTokens(accessToken, refreshToken);
    await tokenManager.setUserData(finalUser);
    await tokenManager.setPhoneVerified(finalUser.isPhoneVerified);
    if (finalUser.id) await AsyncStorage.setItem("userId", finalUser.id);

    setUser(finalUser);
    setIsAuthenticated(true);
    setIsGuest(false);
    setIsPhoneVerified(finalUser.isPhoneVerified);
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
        showStatus,
      }}
    >
      {children}
      <SubscriptionStatusModal
        visible={statusModal.visible}
        title={statusModal.title}
        message={statusModal.message}
        type={statusModal.type}
        onClose={() => setStatusModal((prev) => ({ ...prev, visible: false }))}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});
