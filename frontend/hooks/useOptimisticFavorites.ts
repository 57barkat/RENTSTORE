import { useCallback, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import Toast from "react-native-toast-message";
import {
  api,
  useAddToFavMutation,
  useGetUserFavoritesQuery,
  useRemoveUserFavoriteMutation,
} from "@/services/api";
import { buildWatermarkedPropertyImageUrls } from "@/utils/properties/cloudinaryImages";

type FavoritePropertyLike = {
  _id?: string;
  id?: string;
  title?: string;
  location?: string;
  city?: string;
  defaultRentType?: "daily" | "weekly" | "monthly";
  dailyRent?: number;
  weeklyRent?: number;
  monthlyRent?: number;
  photos?: string[];
  image?: string;
  isFav?: boolean;
};

type FavoriteEntry = {
  property?: FavoritePropertyLike | null;
};

type ToggleFavoriteOptions = {
  property?: FavoritePropertyLike;
  onOptimisticUpdate?: (nextValue: boolean) => void;
  onRollback?: (previousValue: boolean) => void;
};

const FAVORITES_QUERY_ARG = null as any;

const getPropertyId = (property?: FavoritePropertyLike | null) =>
  property?._id || property?.id;

const buildFavoriteEntry = (property?: FavoritePropertyLike): FavoriteEntry | null => {
  const propertyId = getPropertyId(property);
  if (!propertyId) {
    return null;
  }

  const photos =
    property?.photos && property.photos.length > 0
      ? property.photos
      : property?.image
        ? [property.image]
        : [];

  return {
    property: {
      ...property,
      _id: propertyId,
      photos: buildWatermarkedPropertyImageUrls(photos),
      location: property?.location || property?.city,
      isFav: true,
    },
  };
};

export const useOptimisticFavorites = (enabled = true) => {
  const dispatch = useDispatch<any>();
  const [addToFav] = useAddToFavMutation();
  const [removeFromFav] = useRemoveUserFavoriteMutation();
  const { data } = useGetUserFavoritesQuery(FAVORITES_QUERY_ARG, {
    skip: !enabled,
  });
  const [pendingById, setPendingById] = useState<Record<string, boolean>>({});
  const pendingRef = useRef(new Set<string>());

  const favoriteIds = useMemo(
    () =>
      enabled
        ? (data || [])
            .map((entry: FavoriteEntry) => getPropertyId(entry.property))
            .filter(Boolean) as string[]
        : [],
    [data, enabled],
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
    async (propertyId: string, options?: ToggleFavoriteOptions) => {
      if (!enabled || !propertyId || pendingRef.current.has(propertyId)) {
        return false;
      }

      pendingRef.current.add(propertyId);
      setPendingById((prev) => ({ ...prev, [propertyId]: true }));

      const wasFavorite = favoriteIds.includes(propertyId);
      const nextFavorite = !wasFavorite;
      options?.onOptimisticUpdate?.(nextFavorite);

      const patchResult: { undo: () => void } = dispatch(
        api.util.updateQueryData(
          "getUserFavorites",
          FAVORITES_QUERY_ARG,
          (draft: FavoriteEntry[]) => {
            if (!Array.isArray(draft)) {
              return;
            }

            if (nextFavorite) {
              const alreadyExists = draft.some(
                (entry) => getPropertyId(entry.property) === propertyId,
              );
              if (!alreadyExists) {
                const optimisticEntry = buildFavoriteEntry(options?.property);
                if (optimisticEntry) {
                  draft.unshift(optimisticEntry);
                }
              }
              return;
            }

            return draft.filter(
              (entry) => getPropertyId(entry.property) !== propertyId,
            );
          },
        ),
      );

      try {
        if (wasFavorite) {
          await removeFromFav({ propertyId }).unwrap();
        } else {
          await addToFav({ propertyId }).unwrap();
        }

        return true;
      } catch {
        patchResult.undo();
        options?.onRollback?.(wasFavorite);
        Toast.show({
          type: "error",
          text1: "Favorites update failed",
          text2: "Please try again.",
        });
        return false;
      } finally {
        pendingRef.current.delete(propertyId);
        setPendingById((prev) => {
          const next = { ...prev };
          delete next[propertyId];
          return next;
        });
      }
    },
    [addToFav, dispatch, enabled, favoriteIds, removeFromFav],
  );

  return {
    favoriteIds,
    isFavorite,
    isPending,
    toggleFavorite,
  };
};
