"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import publicApiClient from "@/app/lib/public-api-client";
import type {
  PublicMeResponse,
  PublicUserStatsResponse,
} from "@/app/lib/public-account-types";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  profileImage?: string | null;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
  propertyLimit?: number;
  usedPropertyCount?: number;
  paidPropertyCredits?: number;
  paidFeaturedCredits?: number;
  prioritySlotCredits?: number;
  subscription?: string;
  totalProperties?: number;
  totalFavorites?: number;
}

interface PublicAuthContextValue {
  user: PublicUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<PublicUser>) => void;
}

const PublicAuthContext = createContext<PublicAuthContextValue | null>(null);

const normalizeUser = (
  me: PublicMeResponse | null | undefined,
  stats: PublicUserStatsResponse | null | undefined,
): PublicUser | null => {
  const userId = me?.id || me?._id || stats?.id || stats?._id;
  if (!userId || !me?.email) {
    return null;
  }

  return {
    id: userId,
    name: me?.name || stats?.name || "Account User",
    email: me.email,
    phone: me?.phone || stats?.phone,
    role: me?.role || stats?.role || "user",
    profileImage: me?.profileImage ?? stats?.profileImage ?? null,
    isPhoneVerified: me?.isphoneverified ?? me?.isPhoneVerified ?? false,
    isEmailVerified: me?.isEmailVerified ?? false,
    propertyLimit: me?.propertyLimit,
    usedPropertyCount: me?.usedPropertyCount,
    paidPropertyCredits: me?.paidPropertyCredits,
    paidFeaturedCredits: me?.paidFeaturedCredits,
    prioritySlotCredits: me?.prioritySlotCredits,
    subscription: me?.subscription,
    totalProperties: stats?.totalProperties,
    totalFavorites: stats?.totalFavorites,
  };
};

export default function PublicAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const [{ data: me }, { data: stats }] = await Promise.all([
        publicApiClient.get("/users/me"),
        publicApiClient.get("/user/stats"),
      ]);

      setUser(normalizeUser(me, stats));
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const logout = useCallback(async () => {
    try {
      await publicApiClient.post("/users/logout");
    } catch {
      // Ignore backend logout failures and still clear local cookies/session.
    } finally {
      await fetch("/api/public-auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      setUser(null);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  }, []);

  const updateUser = useCallback((patch: Partial<PublicUser>) => {
    setUser((current) => (current ? { ...current, ...patch } : current));
  }, []);

  const value = useMemo<PublicAuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      refreshSession,
      logout,
      updateUser,
    }),
    [isLoading, logout, refreshSession, updateUser, user],
  );

  return (
    <PublicAuthContext.Provider value={value}>
      {children}
    </PublicAuthContext.Provider>
  );
}

export const usePublicAuth = () => {
  const context = useContext(PublicAuthContext);
  if (!context) {
    throw new Error("usePublicAuth must be used inside PublicAuthProvider.");
  }

  return context;
};
