"use client";

import { startTransition, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

import { usePublicAuth } from "@/app/components/public/PublicAuthProvider";
import { usePublicFavorites } from "@/app/components/public/PublicFavoritesProvider";
import type { PublicProperty } from "@/app/lib/property-types";

interface PublicFavoriteButtonProps {
  property: PublicProperty;
  variant?: "overlay" | "inline";
}

export default function PublicFavoriteButton({
  property,
  variant = "overlay",
}: PublicFavoriteButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated } = usePublicAuth();
  const { isFavorite, isPending, toggleFavorite } = usePublicFavorites();
  const [localFavorite, setLocalFavorite] = useState<boolean | null>(null);

  const favorite = useMemo(
    () => (localFavorite === null ? isFavorite(property._id, !!property.isFav) : localFavorite),
    [isFavorite, localFavorite, property._id, property.isFav],
  );

  const pending = isPending(property._id);

  const redirectToLogin = () => {
    const redirect = encodeURIComponent(
      `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
    );
    toast("Login to save favorites.");
    router.push(`/account/login?redirect=${redirect}`);
  };

  const handleToggle = async () => {
    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }

    await toggleFavorite(property, {
      onOptimisticUpdate: (nextValue) => {
        startTransition(() => {
          setLocalFavorite(nextValue);
        });
      },
      onRollback: (previousValue) => {
        startTransition(() => {
          setLocalFavorite(previousValue);
        });
      },
    });

    startTransition(() => {
      setLocalFavorite(null);
    });
  };

  const buttonClassName =
    variant === "overlay"
      ? `inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/60 backdrop-blur transition ${
          favorite
            ? "bg-[var(--admin-danger,#ef4444)] text-white shadow-sm"
            : "bg-white/90 text-[var(--admin-text)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
        }`
      : `inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
          favorite
            ? "border-[var(--admin-danger,#ef4444)] bg-[var(--admin-danger,#ef4444)] text-white"
            : "border-[var(--admin-border)] bg-white text-[var(--admin-text)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
        }`;

  return (
    <button
      type="button"
      aria-pressed={favorite}
      aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
      disabled={pending}
      onClick={handleToggle}
      className={buttonClassName}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={`h-4 w-4 ${favorite ? "fill-current" : ""}`} />
      )}
      {variant === "inline" ? (favorite ? "Saved" : "Save") : null}
    </button>
  );
}
