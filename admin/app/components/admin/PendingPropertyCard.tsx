/* eslint-disable @next/next/no-img-element */
"use client";

import { CheckCircle, Eye, MapPin, Trash2 } from "lucide-react";

import BasePropertyCard from "@/app/components/properties/BasePropertyCard";
import { getAvatarPlaceholder } from "@/app/lib/avatar";
import { DEFAULT_PROPERTY_IMAGE } from "@/app/lib/property-utils";
import {
  formatPromotionDate,
  getCtr,
  getPromotionStatusLabel,
  isActiveBoostedPromotion,
  isActiveFeaturedPromotion,
} from "@/app/lib/promotion";

interface PendingProperty {
  _id: string;
  title: string;
  location: string;
  monthlyRent: number;
  hostOption?: string;
  status?: boolean;
  isApproved?: boolean;
  ownerId: {
    name: string;
    email: string;
    profileImage?: string;
  };
  photos: string[];
  featured?: boolean;
  featuredUntil?: string;
  isBoosted?: boolean;
  boostedUntil?: string;
  sortWeight?: number;
  impressions?: number;
  views?: number;
  promotedImpressions?: number;
  ctr?: number;
  promotionStatusLabel?: string;
}

interface PendingPropertyCardProps {
  property: PendingProperty;
  onReview: (id: string) => void;
  onApprove: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isProcessing?: boolean;
  activeAction?: "approve" | "delete" | "save" | null;
}

export default function PendingPropertyCard({
  property,
  onReview,
  onApprove,
  onDelete,
  isProcessing = false,
  activeAction = null,
}: PendingPropertyCardProps) {
  const categoryLabel = property.hostOption
    ? property.hostOption.charAt(0).toUpperCase() + property.hostOption.slice(1)
    : "Property";
  const isFeatured = isActiveFeaturedPromotion(property);
  const isBoosted = !isFeatured && isActiveBoostedPromotion(property);
  const ctr = property.ctr ?? getCtr(property);
  const promotionStatusLabel =
    property.promotionStatusLabel || getPromotionStatusLabel(property);
  const activePromotionUntil = isFeatured
    ? formatPromotionDate(property.featuredUntil)
    : isBoosted
      ? formatPromotionDate(property.boostedUntil)
      : null;

  return (
    <BasePropertyCard
      image={property.photos?.[0] || DEFAULT_PROPERTY_IMAGE}
      title={property.title}
      className="border-[var(--admin-border)] hover:shadow-[0_24px_46px_-32px_var(--admin-shadow)]"
      badges={
        <div className="flex gap-2">
          <span
            className={`rounded px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-lg ${
              property.isApproved ? "bg-[var(--admin-secondary)]" : "bg-primary"
            }`}
          >
            {property.isApproved ? "Approved" : "Pending Approval"}
          </span>
          <span className="rounded border border-border bg-card px-2 py-1 text-[9px] font-black uppercase tracking-widest text-foreground shadow-lg">
            {categoryLabel}
          </span>
          <span
            className={`rounded border px-2 py-1 text-[9px] font-black uppercase tracking-widest shadow-lg ${
              property.status
                ? "border-[var(--admin-secondary-strong)] bg-[var(--admin-secondary-soft)] text-[var(--admin-secondary)]"
                : "border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-muted)]"
            }`}
          >
            {property.status ? "Active" : "Inactive"}
          </span>
          <span className="rounded border border-border bg-card px-2 py-1 text-[9px] font-black uppercase tracking-widest text-foreground shadow-lg">
            {promotionStatusLabel}
          </span>
          {isFeatured && (
            <span className="rounded bg-[var(--admin-accent)] px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-lg">
              Featured
            </span>
          )}
          {!isFeatured && isBoosted && (
            <span className="rounded bg-[var(--admin-secondary)] px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-lg">
              Boosted
            </span>
          )}
        </div>
      }
      overlay={
        <button
          type="button"
          onClick={() => onReview(property._id)}
          disabled={isProcessing}
          className="inline-flex items-center gap-2 rounded-full bg-[color:color-mix(in_srgb,var(--admin-background)_94%,transparent)] px-4 py-2 text-xs font-bold text-[var(--admin-text)] shadow-lg backdrop-blur transition hover:bg-[var(--admin-info-soft)] hover:text-[var(--admin-info)]"
        >
          <Eye className="h-4 w-4" /> Review
        </button>
      }
      meta={
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary" /> {property.location}
        </p>
      }
      summary={
        <div className="space-y-3 border-y border-border/50 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 overflow-hidden rounded-full border border-border bg-accent">
                {property.ownerId?.profileImage ? (
                  <img
                    src={property.ownerId.profileImage}
                    alt={property.ownerId.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={getAvatarPlaceholder(property.ownerId?.name || "Owner")}
                    alt={property.ownerId?.name || "Owner"}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-tighter text-muted-foreground">
                  Owner
                </p>
                <p className="text-[11px] font-semibold">
                  {property.ownerId?.name}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold uppercase tracking-tighter text-muted-foreground">
                Rent
              </p>
              <p className="text-sm font-black text-primary">
                Rs.{" "}
                {property.monthlyRent?.toLocaleString?.() || property.monthlyRent}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <p className="font-semibold text-muted-foreground">Sort Weight</p>
            <p className="text-right font-black text-foreground">
              {property.sortWeight ?? 1}
            </p>
            <p className="font-semibold text-muted-foreground">Views</p>
            <p className="text-right font-black text-foreground">
              {property.views ?? 0}
            </p>
            <p className="font-semibold text-muted-foreground">Impressions</p>
            <p className="text-right font-black text-foreground">
              {property.impressions ?? 0}
            </p>
            <p className="font-semibold text-muted-foreground">CTR</p>
            <p className="text-right font-black text-foreground">
              {ctr.toFixed(1)}%
            </p>
            <p className="font-semibold text-muted-foreground">
              Promoted Impr.
            </p>
            <p className="text-right font-black text-foreground">
              {property.promotedImpressions ?? 0}
            </p>
            <p className="font-semibold text-muted-foreground">Featured Until</p>
            <p className="text-right font-black text-foreground">
              {property.featuredUntil
                ? formatPromotionDate(property.featuredUntil)
                : "Not set"}
            </p>
            <p className="font-semibold text-muted-foreground">Boosted Until</p>
            <p className="text-right font-black text-foreground">
              {property.boostedUntil
                ? formatPromotionDate(property.boostedUntil)
                : "Not set"}
            </p>
            {activePromotionUntil && (
              <>
                <p className="font-semibold text-muted-foreground">Active Until</p>
                <p className="text-right font-black text-foreground">
                  {activePromotionUntil}
                </p>
              </>
            )}
          </div>
        </div>
      }
      actions={
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onDelete(property._id)}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2 rounded-lg border border-[rgba(220,38,38,0.2)] bg-[var(--admin-error-soft)] px-3 py-2 text-xs font-bold text-[var(--admin-error)] transition-all hover:bg-[var(--admin-error)] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {isProcessing && activeAction === "delete"
              ? "Rejecting..."
              : "Reject"}
          </button>
          {property.isApproved ? (
            <div className="flex items-center justify-center rounded-lg border border-border bg-accent px-3 py-2 text-xs font-bold text-muted-foreground">
              Approved
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onApprove(property._id)}
              disabled={isProcessing}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              {isProcessing && activeAction === "approve"
                ? "Approving..."
                : "Approve"}
            </button>
          )}
        </div>
      }
    />
  );
}
