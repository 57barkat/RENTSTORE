import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, Eye, MapPin } from "lucide-react";

import BasePropertyCard from "@/app/components/properties/BasePropertyCard";
import type { PublicProperty } from "@/app/lib/property-types";
import {
  DEFAULT_PROPERTY_IMAGE,
  buildPropertyHref,
  getPropertyCity,
  getPropertyLocation,
  getPropertyPriceDisplay,
  getPropertyTitle,
} from "@/app/lib/property-utils";

interface PropertyCardProps {
  property: PublicProperty;
  previewHref?: string;
}

interface ActionLinkProps {
  href: string;
  label: string;
  scroll?: boolean;
  children: ReactNode;
}

const ActionLink = ({ href, label, scroll, children }: ActionLinkProps) => {
  return (
    <div className="group/action relative">
      <Link
        href={href}
        scroll={scroll}
        aria-label={label}
        title={label}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--admin-border)] bg-[rgba(255,255,255,0.96)] text-[var(--admin-text)] shadow-[0_18px_40px_-26px_var(--admin-shadow)] backdrop-blur transition hover:-translate-y-0.5 hover:border-[var(--admin-primary)] hover:bg-[var(--admin-surface)] hover:text-[var(--admin-primary)]"
      >
        {children}
      </Link>
      <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 rounded-full bg-[var(--admin-text)] px-3 py-1 text-[11px] font-medium text-[var(--admin-background)] opacity-0 shadow-lg transition group-hover/action:opacity-100">
        {label}
      </span>
    </div>
  );
};

interface MobileActionButtonProps {
  href: string;
  label: string;
  scroll?: boolean;
  children: ReactNode;
}

const MobileActionButton = ({
  href,
  label,
  scroll,
  children,
}: MobileActionButtonProps) => {
  return (
    <Link
      href={href}
      scroll={scroll}
      className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-2.5 text-sm font-medium text-[var(--admin-text)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
    >
      {children}
      <span>{label}</span>
    </Link>
  );
};

const PropertyCard = ({ property, previewHref }: PropertyCardProps) => {
  const detailHref = buildPropertyHref(property);
  const coverImage = property.photos?.[0] || DEFAULT_PROPERTY_IMAGE;
  const isFeatured = Boolean(property.featured);
  const isBoosted = Boolean(property.boosted || property.isBoosted);
  const addressLabel = [
    getPropertyLocation(property),
    getPropertyCity(property),
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <BasePropertyCard
      image={coverImage}
      title={getPropertyTitle(property)}
      className={`${
        isFeatured
          ? "border-[var(--admin-accent)] shadow-[0_0_0_1px_var(--admin-accent-soft),0_18px_38px_var(--admin-accent-soft)] hover:shadow-[0_0_0_1px_var(--admin-accent),0_24px_46px_var(--admin-accent-soft)]"
          : "border-[var(--admin-border)]"
      }`}
      badges={
        <>
          {isFeatured && (
            <span className="admin-badge-featured rounded-full px-3 py-1 text-[11px] font-semibold shadow-lg shadow-[rgba(245,159,11,0.18)]">
              Featured
            </span>
          )}
          {isBoosted && (
            <span className="admin-badge-info rounded-full px-3 py-1 text-[11px] font-semibold shadow-lg shadow-[var(--admin-info-soft)]">
              Boosted
            </span>
          )}
        </>
      }
      overlay={
        <div className="hidden items-center gap-2 opacity-0 transition duration-200 md:flex md:group-hover:opacity-100 md:group-focus-within:opacity-100">
          {previewHref && (
            <ActionLink href={previewHref} scroll={false} label="Quick View">
              <Eye size={18} />
            </ActionLink>
          )}
          <ActionLink href={detailHref} label="View Full Details">
            <ArrowUpRight size={18} />
          </ActionLink>
        </div>
      }
      titleHref={
        <Link
          href={detailHref}
          className="block text-lg font-semibold tracking-tight text-[var(--admin-text)] transition hover:text-[var(--admin-primary)]"
        >
          <span className="line-clamp-1">{getPropertyTitle(property)}</span>
        </Link>
      }
      meta={
        <p className="text-xl font-semibold tracking-tight text-[var(--admin-text)]">
          {getPropertyPriceDisplay(property)}
        </p>
      }
      summary={
        <p className="flex items-center gap-2 text-sm text-[var(--admin-muted)]">
          <MapPin size={15} className="shrink-0 text-[var(--admin-primary)]" />
          <span className="line-clamp-1">{addressLabel}</span>
        </p>
      }
      actions={
        <div className="flex gap-3 pt-1 md:hidden">
          {previewHref && (
            <MobileActionButton
              href={previewHref}
              scroll={false}
              label="Quick View"
            >
              <Eye size={16} />
            </MobileActionButton>
          )}
          <MobileActionButton href={detailHref} label="View Details">
            <ArrowUpRight size={16} />
          </MobileActionButton>
        </div>
      }
    />
  );
};

export default PropertyCard;
