"use client";

import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowUpRight,
  Bath,
  BedDouble,
  CheckCircle2,
  Eye,
  MapPin,
  SquareDashedBottom,
  Zap,
} from "lucide-react";

import PublicFavoriteButton from "@/app/components/public/PublicFavoriteButton";
import { useReportedProperties } from "@/app/components/public/ReportedPropertiesProvider";
import PropertyCardGalleryTrigger from "@/app/components/properties/PropertyCardGalleryTrigger";
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
  const items: Array<{ key: string; value: string; label: string }> = [];

  if (property.capacityState?.bedrooms || property.capacityState?.beds) {
    const value =
      property.capacityState?.bedrooms || property.capacityState?.beds;

    items.push({
      key: "beds",
      value: String(value),
      label: Number(value) === 1 ? "Bed" : "Beds",
    });
  }

  if (property.capacityState?.bathrooms) {
    items.push({
      key: "baths",
      value: String(property.capacityState.bathrooms),
      label: Number(property.capacityState.bathrooms) === 1 ? "Bath" : "Baths",
    });
  }

  if (property.size?.value && property.size?.unit) {
    items.push({
      key: "size",
      value: `${property.size.value} ${property.size.unit}`,
      label: "",
    });
  }

  if (property.furnishing) {
    items.push({
      key: "furnishing",
      value: property.furnishing,
      label: "",
    });
  }

  return items.slice(0, 4);
};

const PropertyCard = ({ property, previewHref }: PropertyCardProps) => {
  const { isPropertyHidden } = useReportedProperties();

  const detailHref = buildPropertyHref(property);
  const galleryImages =
    property.photos && property.photos.length > 0
      ? property.photos
      : [DEFAULT_PROPERTY_IMAGE];

  const title = getPropertyTitle(property);
  const isFeatured = isActiveFeaturedPromotion(property);
  const isBoosted = !isFeatured && isActiveBoostedPromotion(property);
  const isVerified = Boolean(property.isApproved);
  const categoryLabel = getCategoryLabel(getPropertyCategory(property));
  const cityLabel = getPropertyCity(property);
  const locationLabel = getPropertyLocationLabel(property);
  const imageAlt = buildPropertyImageAlt(property);
  const statItems = buildStatItems(property);

  if (isPropertyHidden(property._id)) {
    return null;
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.1rem] border border-[var(--admin-border)] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[color:color-mix(in_srgb,var(--admin-primary)_36%,var(--admin-border))] hover:shadow-[0_22px_55px_-34px_rgba(0,31,143,0.42)]">
      <div className="relative aspect-[1.42] overflow-hidden bg-[var(--admin-card)]">
        <PropertyCardGalleryTrigger
          images={galleryImages}
          imageAltBase={imageAlt}
          title={title}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, (max-width: 1536px) 25vw, 20vw"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/5" />

        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          {isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--admin-accent)] px-2.5 py-1.5 text-[9px] font-black uppercase leading-none text-white shadow-sm">
              Featured
            </span>
          )}

          {isBoosted && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1.5 text-[9px] font-black uppercase leading-none text-white shadow-sm">
              <Zap className="h-3 w-3 fill-current" />
              Boosted
            </span>
          )}

          {isVerified && (
            <span
              title="Verification means limited platform checks only. It does not guarantee ownership, legal title, condition, availability, or transaction safety."
              className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1.5 text-[9px] font-black uppercase leading-none text-white shadow-sm"
            >
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </span>
          )}
        </div>

        <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
          <Suspense fallback={null}>
            <PublicFavoriteButton property={property} />
          </Suspense>

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
      </div>

      <Link
        href={detailHref}
        aria-label={`View details for ${title}`}
        className="flex flex-1 flex-col px-3.5 py-3.5 outline-none focus-visible:ring-4 focus-visible:ring-[var(--admin-primary)]/15"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[10px] font-black uppercase text-[var(--admin-secondary)]">
            {categoryLabel}
          </span>

          {cityLabel && (
            <span className="truncate text-[10px] font-semibold text-[var(--admin-muted)]">
              {cityLabel}
            </span>
          )}
        </div>

        <h3 className="mt-2 line-clamp-2 min-h-[38px] text-sm font-black leading-[1.35] text-[var(--admin-text)] transition group-hover:text-[var(--admin-primary)]">
          {title}
        </h3>

        {locationLabel && (
          <p className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[var(--admin-muted)]">
            <MapPin
              size={12}
              className="shrink-0 text-[var(--admin-primary)]"
            />
            <span className="line-clamp-1">{locationLabel}</span>
          </p>
        )}

        {statItems.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[var(--admin-border)] pt-3 text-[10px] font-bold text-[var(--admin-muted)]">
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
                  {item.key === "beds" && `${item.value} ${item.label}`}
                  {item.key === "baths" && `${item.value} ${item.label}`}
                  {item.key === "size" && item.value}
                  {item.key === "furnishing" && item.value}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <p className="text-[10px] font-black uppercase text-[var(--admin-muted)]">
              Rent
            </p>
            <p className="mt-1 text-sm font-black text-[var(--admin-primary)]">
              {getPropertyPriceDisplay(property)}
            </p>
          </div>

          <span
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--admin-border)] bg-[var(--admin-primary-soft)] text-[var(--admin-primary)] transition group-hover:border-[var(--admin-primary)] group-hover:bg-[var(--admin-primary)] group-hover:text-white"
            aria-hidden="true"
          >
            <ArrowUpRight size={14} />
          </span>
        </div>
      </Link>
    </article>
  );
};

export default PropertyCard;
