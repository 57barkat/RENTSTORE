import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Bath,
  BedDouble,
  Eye,
  MapPin,
  SquareDashedBottom,
} from "lucide-react";

import PublicFavoriteButton from "@/app/components/public/PublicFavoriteButton";
import type { PublicProperty } from "@/app/lib/property-types";
import {
  isActiveBoostedPromotion,
  isActiveFeaturedPromotion,
} from "@/app/lib/promotion";
import {
  DEFAULT_PROPERTY_IMAGE,
  buildPropertyImageAlt,
  buildPropertyHref,
  getCategoryLabel,
  getPropertyCategory,
  getPropertyCity,
  getPropertyLocationLabel,
  getPropertyPriceDisplay,
  getPropertyTitle,
} from "@/app/lib/property-utils";

interface PropertyCardProps {
  property: PublicProperty;
  previewHref?: string;
}

const buildStatItems = (property: PublicProperty) => {
  const items: Array<{ key: string; value: string }> = [];

  if (property.capacityState?.bedrooms || property.capacityState?.beds) {
    items.push({
      key: "beds",
      value: String(
        property.capacityState?.bedrooms || property.capacityState?.beds,
      ),
    });
  }

  if (property.capacityState?.bathrooms) {
    items.push({
      key: "baths",
      value: String(property.capacityState.bathrooms),
    });
  }

  if (property.size?.value && property.size?.unit) {
    items.push({
      key: "size",
      value: `${property.size.value} ${property.size.unit}`,
    });
  }

  return items.slice(0, 3);
};

const PropertyCard = ({ property, previewHref }: PropertyCardProps) => {
  const detailHref = buildPropertyHref(property);
  const coverImage = property.photos?.[0] || DEFAULT_PROPERTY_IMAGE;
  const title = getPropertyTitle(property);
  const isFeatured = isActiveFeaturedPromotion(property);
  const isBoosted = !isFeatured && isActiveBoostedPromotion(property);
  const categoryLabel = getCategoryLabel(getPropertyCategory(property));
  const cityLabel = getPropertyCity(property);
  const locationLabel = getPropertyLocationLabel(property);
  const imageAlt = buildPropertyImageAlt(property);
  const statItems = buildStatItems(property);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[10px] border border-[var(--admin-border)] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_-24px_var(--admin-shadow)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--admin-card)]">
        <Link href={detailHref} aria-label={title}>
          <Image
            src={coverImage}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>

        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          {isFeatured && (
            <span className="rounded bg-[var(--admin-accent)] px-2 py-1 text-[9px] font-black uppercase leading-none tracking-wide text-white shadow-sm">
              Featured
            </span>
          )}

          {isBoosted && (
            <span className="rounded bg-[var(--admin-secondary)] px-2 py-1 text-[9px] font-black uppercase leading-none tracking-wide text-white shadow-sm">
              Boosted
            </span>
          )}
        </div>

        <div className="absolute right-2 top-2 flex items-center gap-1.5">
          <PublicFavoriteButton property={property} />

          {previewHref && (
            <Link
              href={previewHref}
              scroll={false}
              aria-label="Quick view"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[var(--admin-muted)] shadow-sm backdrop-blur transition hover:bg-white hover:text-[var(--admin-primary)]"
            >
              <Eye size={14} />
            </Link>
          )}
        </div>

        <div className="absolute bottom-2 left-2">
          <span className="inline-flex items-center rounded bg-[var(--admin-primary)] px-3 py-1.5 text-[11px] font-black text-white shadow-[0_12px_24px_-16px_var(--admin-primary)]">
            {getPropertyPriceDisplay(property)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[9px] font-black uppercase tracking-[0.16em] text-[var(--admin-secondary)]">
            {categoryLabel}
          </span>

          {cityLabel && (
            <span className="truncate text-[9px] font-semibold text-[var(--admin-muted)]">
              {cityLabel}
            </span>
          )}
        </div>

        <Link
          href={detailHref}
          className="mt-2 line-clamp-2 min-h-[34px] text-[13px] font-black leading-[1.28] text-[var(--admin-text)] transition hover:text-[var(--admin-primary)]"
        >
          {title}
        </Link>

        {locationLabel && (
          <p className="mt-2 flex items-center gap-1 text-[10px] font-medium text-[var(--admin-muted)]">
            <MapPin
              size={11}
              className="shrink-0 text-[var(--admin-primary)]"
            />
            <span className="line-clamp-1">{locationLabel}</span>
          </p>
        )}

        {statItems.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[var(--admin-border)] pt-3 text-[10px] font-semibold text-[var(--admin-muted)]">
            {statItems.map((item) => (
              <div key={item.key} className="flex min-w-0 items-center gap-1">
                {item.key === "beds" && (
                  <BedDouble
                    size={11}
                    className="text-[var(--admin-primary)]"
                  />
                )}

                {item.key === "baths" && (
                  <Bath size={11} className="text-[var(--admin-primary)]" />
                )}

                {item.key === "size" && (
                  <SquareDashedBottom
                    size={11}
                    className="text-[var(--admin-primary)]"
                  />
                )}

                <span className="truncate">
                  {item.key === "beds" && `${item.value}`}
                  {item.key === "baths" && `${item.value}`}
                  {item.key === "size" && item.value}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-end pt-3">
          <Link
            href={detailHref}
            className="inline-flex items-center gap-1 text-[11px] font-black text-[var(--admin-primary)] transition hover:underline"
          >
            View Details
            <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
