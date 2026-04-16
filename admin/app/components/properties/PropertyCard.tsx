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
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/95 text-slate-800 shadow-lg shadow-slate-950/10 backdrop-blur transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
      >
        {children}
      </Link>
      <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 rounded-full bg-slate-950 px-3 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition group-hover/action:opacity-100">
        {label}
      </span>
    </div>
  );
};

const PropertyCard = ({ property, previewHref }: PropertyCardProps) => {
  const detailHref = buildPropertyHref(property);
  const coverImage = property.photos?.[0] || DEFAULT_PROPERTY_IMAGE;
  const isFeatured = Boolean(property.featured);
  const isBoosted = Boolean(property.boosted || property.isBoosted);
  const addressLabel = [getPropertyLocation(property), getPropertyCity(property)]
    .filter(Boolean)
    .join(", ");

  return (
    <BasePropertyCard
      image={coverImage}
      title={getPropertyTitle(property)}
      className={`${
        isFeatured
          ? "border-amber-300 shadow-[0_0_0_1px_rgba(251,191,36,0.24),0_18px_38px_rgba(245,158,11,0.16)] hover:shadow-[0_0_0_1px_rgba(251,191,36,0.35),0_24px_46px_rgba(245,158,11,0.2)]"
          : "border-slate-200 hover:shadow-slate-200/80"
      }`}
      badges={
        <>
          {isFeatured && (
            <span className="rounded-full bg-amber-400 px-3 py-1 text-[11px] font-semibold text-slate-950 shadow-lg shadow-amber-300/50">
              Featured
            </span>
          )}
          {isBoosted && (
            <span className="rounded-full bg-sky-500 px-3 py-1 text-[11px] font-semibold text-white shadow-lg shadow-sky-300/50">
              Boosted
            </span>
          )}
        </>
      }
      overlay={
        <div className="flex items-center gap-2 opacity-0 transition duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
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
          className="block text-lg font-semibold tracking-tight text-slate-950 transition hover:text-sky-700"
        >
          <span className="line-clamp-1">{getPropertyTitle(property)}</span>
        </Link>
      }
      meta={
        <p className="text-2xl font-semibold tracking-tight text-slate-950">
          {getPropertyPriceDisplay(property)}
        </p>
      }
      summary={
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <MapPin size={15} className="shrink-0 text-sky-700" />
          <span className="line-clamp-1">{addressLabel}</span>
        </p>
      }
    />
  );
};

export default PropertyCard;
