import Link from "next/link";
import {
  ArrowUpRight,
  Bath,
  BedDouble,
  Eye,
  Heart,
  MapPin,
  SquareDashedBottom,
} from "lucide-react";

import type { PublicProperty } from "@/app/lib/property-types";
import {
  DEFAULT_PROPERTY_IMAGE,
  buildPropertyHref,
  getCategoryLabel,
  getPropertyCategory,
  getPropertyCity,
  getPropertyLocation,
  getPropertyPriceDisplay,
  getPropertyTitle,
} from "@/app/lib/property-utils";

interface PropertyCardProps {
  property: PublicProperty;
  previewHref?: string;
}

const buildStatItems = (property: PublicProperty) => {
  const items: Array<{ key: string; label: string; value: string }> = [];

  if (property.capacityState?.bedrooms || property.capacityState?.beds) {
    items.push({
      key: "beds",
      label: "Beds",
      value: String(
        property.capacityState?.bedrooms || property.capacityState?.beds,
      ),
    });
  }

  if (property.capacityState?.bathrooms) {
    items.push({
      key: "baths",
      label: "Baths",
      value: String(property.capacityState.bathrooms),
    });
  }

  if (property.size?.value && property.size?.unit) {
    items.push({
      key: "size",
      label: property.size.unit,
      value: `${property.size.value} ${property.size.unit}`,
    });
  }

  return items.slice(0, 3);
};

const PropertyCard = ({ property, previewHref }: PropertyCardProps) => {
  const detailHref = buildPropertyHref(property);
  const coverImage = property.photos?.[0] || DEFAULT_PROPERTY_IMAGE;
  const title = getPropertyTitle(property);
  const isFeatured = Boolean(property.featured);
  const isBoosted = Boolean(property.boosted || property.isBoosted);
  const categoryLabel = getCategoryLabel(
    getPropertyCategory(property),
  ).toUpperCase();
  const cityLabel = getPropertyCity(property);
  const locationLabel = [getPropertyLocation(property), cityLabel]
    .filter(Boolean)
    .join(", ");
  const statItems = buildStatItems(property);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-white shadow-[0_18px_36px_-30px_var(--admin-shadow)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_44px_-32px_var(--admin-shadow)]">
      <div className="relative aspect-[16/11] overflow-hidden bg-[var(--admin-card)]">
        <Link href={detailHref} aria-label={title}>
          <img
            src={coverImage}
            alt={title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>

        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.28)] via-transparent to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {isFeatured && (
            <span className="rounded-full bg-[var(--admin-accent)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white shadow-sm">
              Featured
            </span>
          )}
          {isBoosted && (
            <span className="rounded-full bg-[var(--admin-secondary)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white shadow-sm">
              Boosted
            </span>
          )}
        </div>

        <div className="absolute right-3 top-3 flex items-center gap-2">
          {previewHref && (
            <Link
              href={previewHref}
              scroll={false}
              aria-label="Quick view"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-white/85 text-[var(--admin-text)] shadow-sm backdrop-blur transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
            >
              <Eye size={15} />
            </Link>
          )}
        </div>

        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center rounded-xl bg-[var(--admin-primary)] px-3.5 py-2 text-sm font-bold text-white shadow-[0_14px_28px_-18px_var(--admin-primary)]">
            {getPropertyPriceDisplay(property)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--admin-secondary)]">
            {categoryLabel}
          </span>
          {cityLabel && (
            <span className="truncate text-[11px] font-medium text-[var(--admin-muted)]">
              {cityLabel}
            </span>
          )}
        </div>

        <Link
          href={detailHref}
          className="mt-2 line-clamp-2 min-h-[2.5rem] text-base font-bold leading-tight tracking-tight text-[var(--admin-text)] transition hover:text-[var(--admin-primary)]"
        >
          {title}
        </Link>

        {locationLabel && (
          <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-[var(--admin-muted)]">
            <MapPin
              size={13}
              className="mt-0.5 shrink-0 text-[var(--admin-primary)]"
            />
            <span className="line-clamp-1">{locationLabel}</span>
          </p>
        )}

        {statItems.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--admin-border)] pt-3 text-xs text-[var(--admin-muted)]">
            {statItems.map((item) => (
              <div key={item.key} className="flex min-w-0 items-center gap-1.5">
                {item.key === "beds" && (
                  <BedDouble
                    size={14}
                    className="text-[var(--admin-primary)]"
                  />
                )}
                {item.key === "baths" && (
                  <Bath size={14} className="text-[var(--admin-primary)]" />
                )}
                {item.key === "size" && (
                  <SquareDashedBottom
                    size={14}
                    className="text-[var(--admin-primary)]"
                  />
                )}
                <span className="truncate font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-end pt-4">
          <Link
            href={detailHref}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--admin-primary)] transition hover:underline"
          >
            View Details
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
