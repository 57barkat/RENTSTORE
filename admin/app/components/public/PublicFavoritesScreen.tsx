"use client";

import Link from "next/link";
import { Heart, Loader2, Trash2 } from "lucide-react";

import PublicAccountShell from "@/app/components/public/PublicAccountShell";
import { PublicEmptyState } from "@/app/components/public/PublicAccountPieces";
import { usePublicFavorites } from "@/app/components/public/PublicFavoritesProvider";
import PropertyImagePlaceholder from "@/app/components/properties/PropertyImagePlaceholder";
import type { PublicProperty } from "@/app/lib/property-types";
import {
  buildPropertyHref,
  getPropertyLocationLabel,
  getPropertyPrimaryPhoto,
  getPropertyPriceDisplay,
  getPropertyTitle,
} from "@/app/lib/property-utils";

export default function PublicFavoritesScreen() {
  const { favorites: favoriteEntries, isLoading, toggleFavorite } =
    usePublicFavorites();
  const favorites = favoriteEntries
    .map((entry) => entry.property)
    .filter((property): property is PublicProperty => !!property);

  const handleRemove = async (property: PublicProperty) => {
    await toggleFavorite(property);
  };

  return (
    <PublicAccountShell
      title="Your favorites"
      description="Saved properties stay here so you can compare them later without refetching the full marketplace."
    >
      {isLoading ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-[2rem] border border-[var(--admin-border)] bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--admin-primary)]" />
        </div>
      ) : favorites.length === 0 ? (
        <PublicEmptyState
          title="No favorites yet"
          description="Browse the marketplace and save the properties you want to revisit."
          ctaHref="/"
          ctaLabel="Browse listings"
          icon={Heart}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {favorites.map((property) => {
            const primaryPhoto = getPropertyPrimaryPhoto(property);

            return (
              <article
                key={property._id}
                className="overflow-hidden rounded-[1.75rem] border border-[var(--admin-border)] bg-white shadow-[0_18px_36px_-30px_var(--admin-shadow)]"
              >
                {primaryPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={primaryPhoto}
                    alt={getPropertyTitle(property)}
                    className="aspect-[16/10] w-full object-cover"
                  />
                ) : (
                  <div className="aspect-[16/10] w-full">
                    <PropertyImagePlaceholder />
                  </div>
                )}

                <div className="p-5">
                  <h2 className="text-xl font-black tracking-tight text-[var(--admin-text)]">
                    {getPropertyTitle(property)}
                  </h2>
                  <p className="mt-2 text-sm text-[var(--admin-muted)]">
                    {getPropertyLocationLabel(property) ||
                      "Location unavailable"}
                  </p>
                  <p className="mt-3 text-lg font-bold text-[var(--admin-primary)]">
                    {getPropertyPriceDisplay(property)}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={buildPropertyHref(property)}
                      className="inline-flex items-center justify-center rounded-2xl border border-[var(--admin-border)] px-4 py-3 text-sm font-semibold text-[var(--admin-text)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
                    >
                      View details
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleRemove(property)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--admin-border)] px-4 py-3 text-sm font-semibold text-[var(--admin-danger)] transition hover:border-[var(--admin-danger)]"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </PublicAccountShell>
  );
}
