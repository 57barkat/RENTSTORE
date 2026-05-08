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
import { toast } from "react-hot-toast";

import { usePublicAuth } from "@/app/components/public/PublicAuthProvider";
import publicApiClient from "@/app/lib/public-api-client";
import type { PublicProperty } from "@/app/lib/property-types";

type FavoriteEntry = {
  property?: PublicProperty | null;
};

type ToggleFavoriteOptions = {
  onOptimisticUpdate?: (nextValue: boolean) => void;
  onRollback?: (previousValue: boolean) => void;
};

interface PublicFavoritesContextValue {
  favorites: FavoriteEntry[];
  favoriteIds: string[];
  isFavorite: (propertyId?: string, fallback?: boolean) => boolean;
  isPending: (propertyId?: string) => boolean;
  toggleFavorite: (
    property: PublicProperty,
    options?: ToggleFavoriteOptions,
  ) => Promise<boolean>;
  refreshFavorites: () => Promise<void>;
  isLoading: boolean;
}

const PublicFavoritesContext = createContext<PublicFavoritesContextValue | null>(
  null,
);

const getPropertyId = (property?: PublicProperty | null) => property?._id;

export default function PublicFavoritesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = usePublicAuth();
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingById, setPendingById] = useState<Record<string, boolean>>({});
  const pendingRef = useRef(new Set<string>());

  const refreshFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await publicApiClient.get("/favorites");
      setFavorites(Array.isArray(response.data) ? response.data : []);
    } catch {
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void refreshFavorites();
  }, [refreshFavorites]);

  const favoriteIds = useMemo(
    () =>
      favorites
        .map((entry) => getPropertyId(entry.property))
        .filter(Boolean) as string[],
    [favorites],
  );

  const isFavorite = useCallback(
    (propertyId?: string, fallback = false) =>
      propertyId ? favoriteIds.includes(propertyId) : fallback,
    [favoriteIds],
  );

  const isPending = useCallback(
    (propertyId?: string) => Boolean(propertyId && pendingById[propertyId]),
    [pendingById],
  );

  const toggleFavorite = useCallback(
    async (property: PublicProperty, options?: ToggleFavoriteOptions) => {
      const propertyId = property._id;
      if (!isAuthenticated || !propertyId || pendingRef.current.has(propertyId)) {
        return false;
      }

      const previousFavorites = favorites;
      const wasFavorite = favoriteIds.includes(propertyId);
      const nextFavorite = !wasFavorite;

      pendingRef.current.add(propertyId);
      setPendingById((current) => ({ ...current, [propertyId]: true }));
      options?.onOptimisticUpdate?.(nextFavorite);

      setFavorites((current) => {
        if (nextFavorite) {
          const exists = current.some(
            (entry) => getPropertyId(entry.property) === propertyId,
          );
          if (exists) {
            return current;
          }

          return [{ property: { ...property, isFav: true } }, ...current];
        }

        return current.filter((entry) => getPropertyId(entry.property) !== propertyId);
      });

      try {
        if (wasFavorite) {
          await publicApiClient.delete(`/favorites/${propertyId}`);
        } else {
          await publicApiClient.post(`/favorites/${propertyId}`);
        }

        return true;
      } catch (error) {
        setFavorites(previousFavorites);
        options?.onRollback?.(wasFavorite);
        toast.error(
          error instanceof Error ? error.message : "Favorites update failed.",
        );
        return false;
      } finally {
        pendingRef.current.delete(propertyId);
        setPendingById((current) => {
          const next = { ...current };
          delete next[propertyId];
          return next;
        });
      }
    },
    [favoriteIds, favorites, isAuthenticated],
  );

  const value = useMemo<PublicFavoritesContextValue>(
    () => ({
      favorites,
      favoriteIds,
      isFavorite,
      isPending,
      toggleFavorite,
      refreshFavorites,
      isLoading,
    }),
    [
      favoriteIds,
      favorites,
      isFavorite,
      isLoading,
      isPending,
      refreshFavorites,
      toggleFavorite,
    ],
  );

  return (
    <PublicFavoritesContext.Provider value={value}>
      {children}
    </PublicFavoritesContext.Provider>
  );
}

export const usePublicFavorites = () => {
  const context = useContext(PublicFavoritesContext);
  if (!context) {
    throw new Error(
      "usePublicFavorites must be used inside PublicFavoritesProvider.",
    );
  }

  return context;
};
