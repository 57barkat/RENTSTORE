"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import publicApiClient, {
  isPublicAuthSessionExpiredError,
  refreshPublicAccessToken,
} from "@/app/lib/public-api-client";
import type {
  PublicMeResponse,
  PublicUserStatsResponse,
} from "@/app/lib/public-account-types";
import { PUBLIC_ACCESS_COOKIE } from "@/app/lib/public-auth-config";
import {
  broadcastAuthSessionEvent,
  subscribeAuthSessionEvents,
} from "@/app/lib/session-sync";

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

type PublicAuthStatus = "loading" | "authenticated" | "unauthenticated";

type PublicRefreshSessionOptions = {
  background?: boolean;
};

interface PublicAuthContextValue {
  user: PublicUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCheckingSession: boolean;
  authStatus: PublicAuthStatus;
  refreshSession: (options?: PublicRefreshSessionOptions) => Promise<void>;
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

const SESSION_REFRESH_LEEWAY_MS = 60 * 1000;
const SESSION_FOCUS_REFRESH_LEEWAY_MS = 2 * 60 * 1000;
const FALLBACK_SESSION_REFRESH_MS = 10 * 60 * 1000;

const getCookieValue = (name: string) => {
  if (typeof document === "undefined") {
    return "";
  }

  return (
    document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith(`${name}=`))
      ?.split("=")
      .slice(1)
      .join("=") || ""
  );
};

const decodeBase64Url = (value: string) => {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (padded.length % 4)) % 4;
  return atob(`${padded}${"=".repeat(padLength)}`);
};

const getPublicAccessTokenExpiryMs = () => {
  const token = getCookieValue(PUBLIC_ACCESS_COOKIE);
  const payloadSegment = token.split(".")[1];
  if (!payloadSegment) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(payloadSegment)) as {
      exp?: number;
    };
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

const isUnauthorizedError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "response" in error &&
  (error as { response?: { status?: number } }).response?.status === 401;

const redirectToLoginIfProtectedPage = () => {
  if (typeof window === "undefined") {
    return;
  }

  const { pathname, search } = window.location;
  const isPublicAuthPage =
    pathname === "/account/login" || pathname === "/account/signup";
  const isProtectedPublicPage =
    !isPublicAuthPage &&
    (pathname.startsWith("/account/") ||
      pathname === "/upload-property" ||
      pathname.startsWith("/upload-property/"));

  if (!isProtectedPublicPage) {
    return;
  }

  const redirectPath = encodeURIComponent(`${pathname}${search}`);
  window.location.href = `/account/login?redirect=${redirectPath}`;
};

export default function PublicAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [authStatus, setAuthStatus] = useState<PublicAuthStatus>("loading");
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const userRef = useRef<PublicUser | null>(null);

  const setSessionUser = useCallback((nextUser: PublicUser | null) => {
    userRef.current = nextUser;
    setUser(nextUser);
    setAuthStatus(nextUser ? "authenticated" : "unauthenticated");
  }, []);

  const refreshSession = useCallback(async (options?: PublicRefreshSessionOptions) => {
    const background = options?.background ?? false;
    if (!background) {
      setAuthStatus((current) =>
        current === "authenticated" ? current : "loading",
      );
    }

    setIsCheckingSession(true);

    try {
      const { data: me } = await publicApiClient.get("/users/me");
      let stats: PublicUserStatsResponse | null = null;

      try {
        const response = await publicApiClient.get("/user/stats");
        stats = response.data;
      } catch {
        stats = null;
      }

      setSessionUser(normalizeUser(me, stats));
    } catch (error) {
      if (
        isPublicAuthSessionExpiredError(error) ||
        isUnauthorizedError(error)
      ) {
        setSessionUser(null);
      } else if (userRef.current) {
        setAuthStatus("authenticated");
      } else {
        setSessionUser(null);
      }
    } finally {
      setIsCheckingSession(false);
    }
  }, [setSessionUser]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  useEffect(
    () =>
      subscribeAuthSessionEvents("public", (event) => {
        if (event.type === "logout") {
          setSessionUser(null);
          setIsCheckingSession(false);
          redirectToLoginIfProtectedPage();
          return;
        }

        void refreshSession({ background: true });
      }),
    [refreshSession, setSessionUser],
  );

  useEffect(() => {
    if (authStatus !== "authenticated" || typeof window === "undefined") {
      return;
    }

    let timeoutId: number | null = null;
    let cancelled = false;

    const scheduleRefresh = () => {
      if (cancelled) {
        return;
      }

      const expiryMs = getPublicAccessTokenExpiryMs();
      const delay = expiryMs
        ? Math.max(expiryMs - Date.now() - SESSION_REFRESH_LEEWAY_MS, 15_000)
        : FALLBACK_SESSION_REFRESH_MS;

      timeoutId = window.setTimeout(async () => {
        try {
          await refreshPublicAccessToken();
        } catch {
          await refreshSession({ background: true });
        }

        if (userRef.current) {
          scheduleRefresh();
        }
      }, delay);
    };

    scheduleRefresh();

    return () => {
      cancelled = true;
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [authStatus, refreshSession]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const refreshIfNeeded = () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      const expiryMs = getPublicAccessTokenExpiryMs();
      const shouldRefresh =
        authStatus === "authenticated" &&
        (!expiryMs || expiryMs - Date.now() <= SESSION_FOCUS_REFRESH_LEEWAY_MS);

      if (shouldRefresh || authStatus === "unauthenticated") {
        void refreshSession({ background: true });
      }
    };

    window.addEventListener("focus", refreshIfNeeded);
    document.addEventListener("visibilitychange", refreshIfNeeded);

    return () => {
      window.removeEventListener("focus", refreshIfNeeded);
      document.removeEventListener("visibilitychange", refreshIfNeeded);
    };
  }, [authStatus, refreshSession]);

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
      setSessionUser(null);
      setIsCheckingSession(false);
      broadcastAuthSessionEvent("public", "logout", "manual");
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  }, [setSessionUser]);

  const updateUser = useCallback((patch: Partial<PublicUser>) => {
    setUser((current) => {
      const next = current ? { ...current, ...patch } : current;
      userRef.current = next;
      return next;
    });
  }, []);

  const isLoading = authStatus === "loading";

  const value = useMemo<PublicAuthContextValue>(
    () => ({
      user,
      isAuthenticated: authStatus === "authenticated" && !!user,
      isLoading,
      isCheckingSession,
      authStatus,
      refreshSession,
      logout,
      updateUser,
    }),
    [
      authStatus,
      isCheckingSession,
      isLoading,
      logout,
      refreshSession,
      updateUser,
      user,
    ],
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
