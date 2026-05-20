"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Eye,
  EyeOff,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  RotateCcw,
  Rocket,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";

import PublicAccountShell from "@/app/components/public/PublicAccountShell";
import {
  PublicAccountPanel,
  PublicAccountSectionHeading,
  PublicEmptyState,
} from "@/app/components/public/PublicAccountPieces";
import type {
  DashboardStatsResponse,
  DraftListing,
} from "@/app/lib/public-account-types";
import publicApiClient from "@/app/lib/public-api-client";
import {
  formatPromotionDate,
  getCtr,
  getPromotionStatusLabel,
  isActiveBoostedPromotion,
  isActiveFeaturedPromotion,
} from "@/app/lib/promotion";
import type { PublicProperty } from "@/app/lib/property-types";
import {
  DEFAULT_PROPERTY_IMAGE,
  buildPropertyHref,
  getCategoryLabel,
  getPropertyCategory,
  getPropertyLocationLabel,
  getPropertyPriceDisplay,
  getPropertyTitle,
} from "@/app/lib/property-utils";

type PromotionType = "featured" | "boost";
type ListingStatusFilter =
  | "all"
  | "active"
  | "inactive"
  | "pending"
  | "approved"
  | "featured"
  | "boosted";
type ListingSort =
  | "newest"
  | "oldest"
  | "active"
  | "pending"
  | "approved"
  | "promoted"
  | "mostViewed"
  | "mostImpressions";

type PromotionModalState = {
  property: PublicProperty;
  type: PromotionType;
} | null;

const STATUS_FILTER_OPTIONS: {
  label: string;
  value: ListingStatusFilter;
}[] = [
  { label: "All listings", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Pending review", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Featured", value: "featured" },
  { label: "Boosted", value: "boosted" },
];

const SORT_OPTIONS: { label: string; value: ListingSort }[] = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Active first", value: "active" },
  { label: "Pending first", value: "pending" },
  { label: "Approved first", value: "approved" },
  { label: "Featured / boosted first", value: "promoted" },
  { label: "Most viewed", value: "mostViewed" },
  { label: "Most impressions", value: "mostImpressions" },
];

const getPropertyExpiryLabel = (property: PublicProperty) => {
  if (isActiveFeaturedPromotion(property) && property.featuredUntil) {
    return `Featured until ${formatPromotionDate(property.featuredUntil)}`;
  }

  if (
    !isActiveFeaturedPromotion(property) &&
    isActiveBoostedPromotion(property) &&
    property.boostedUntil
  ) {
    return `Boosted until ${formatPromotionDate(property.boostedUntil)}`;
  }

  if (
    !isActiveFeaturedPromotion(property) &&
    !isActiveBoostedPromotion(property) &&
    (property.featuredUntil || property.boostedUntil)
  ) {
    return `Expired ${formatPromotionDate(
      property.featuredUntil || property.boostedUntil,
    )}`;
  }

  return "";
};

const getStatusTone = (kind: string) => {
  if (kind === "approved" || kind === "active" || kind === "featured") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (kind === "boosted") {
    return "bg-sky-50 text-sky-700 border-sky-200";
  }

  if (kind === "pending") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (kind === "expired") {
    return "bg-slate-100 text-slate-700 border-slate-200";
  }

  return "bg-rose-50 text-rose-700 border-rose-200";
};

function ListingBadge({ label, tone }: { label: string; tone: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${tone}`}
    >
      {label}
    </span>
  );
}

function getPropertyCreatedTime(property: PublicProperty) {
  const value = property.createdAt || property.updatedAt || "";
  const time = value ? new Date(value).getTime() : 0;

  return Number.isFinite(time) ? time : 0;
}

function getAddressSearchText(property: PublicProperty) {
  const addresses = Array.isArray(property.address)
    ? property.address
    : property.address
      ? [property.address]
      : [];

  return addresses
    .flatMap((address) => [
      address.aptSuiteUnit,
      address.street,
      address.city,
      address.stateTerritory,
      address.country,
      address.zipCode,
    ])
    .filter(Boolean)
    .join(" ");
}

function isPendingReview(property: PublicProperty) {
  return property.isApproved !== true;
}

function isApprovedListing(property: PublicProperty) {
  return property.isApproved === true;
}

function isActiveListing(property: PublicProperty) {
  return property.status !== false;
}

function getPromotionRank(property: PublicProperty) {
  if (isActiveFeaturedPromotion(property)) return 2;
  if (isActiveBoostedPromotion(property)) return 1;
  return 0;
}

function propertyMatchesFilter(
  property: PublicProperty,
  filter: ListingStatusFilter,
) {
  if (filter === "all") return true;
  if (filter === "active") return isActiveListing(property);
  if (filter === "inactive") return property.status === false;
  if (filter === "pending") return isPendingReview(property);
  if (filter === "approved") return isApprovedListing(property);
  if (filter === "featured") return isActiveFeaturedPromotion(property);
  if (filter === "boosted") return isActiveBoostedPromotion(property);
  return true;
}

function propertyMatchesSearch(property: PublicProperty, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const category = getPropertyCategory(property);
  const searchText = [
    getPropertyTitle(property),
    getPropertyLocationLabel(property),
    getCategoryLabel(category),
    category,
    property.hostOption,
    property.propertyType,
    property.location,
    property.area,
    getAddressSearchText(property),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchText.includes(normalizedQuery);
}

function sortListings(listings: PublicProperty[], sortBy: ListingSort) {
  return [...listings].sort((left, right) => {
    const newestFallback =
      getPropertyCreatedTime(right) - getPropertyCreatedTime(left);

    if (sortBy === "oldest") {
      return getPropertyCreatedTime(left) - getPropertyCreatedTime(right);
    }

    if (sortBy === "active") {
      return (
        Number(isActiveListing(right)) - Number(isActiveListing(left)) ||
        newestFallback
      );
    }

    if (sortBy === "pending") {
      return (
        Number(isPendingReview(right)) - Number(isPendingReview(left)) ||
        newestFallback
      );
    }

    if (sortBy === "approved") {
      return (
        Number(isApprovedListing(right)) - Number(isApprovedListing(left)) ||
        newestFallback
      );
    }

    if (sortBy === "promoted") {
      return getPromotionRank(right) - getPromotionRank(left) || newestFallback;
    }

    if (sortBy === "mostViewed") {
      return (right.views ?? 0) - (left.views ?? 0) || newestFallback;
    }

    if (sortBy === "mostImpressions") {
      return (
        (right.impressions ?? 0) - (left.impressions ?? 0) || newestFallback
      );
    }

    return newestFallback;
  });
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[1.35rem] border border-[var(--admin-border)] bg-white px-4 py-4 shadow-[0_16px_40px_-36px_var(--admin-shadow)]">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--admin-muted)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-[var(--admin-text)]">
        {value}
      </p>
    </div>
  );
}

function ListingControls({
  searchQuery,
  statusFilter,
  sortBy,
  visibleCount,
  totalCount,
  onSearchChange,
  onFilterChange,
  onSortChange,
  onReset,
}: {
  searchQuery: string;
  statusFilter: ListingStatusFilter;
  sortBy: ListingSort;
  visibleCount: number;
  totalCount: number;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: ListingStatusFilter) => void;
  onSortChange: (value: ListingSort) => void;
  onReset: () => void;
}) {
  const hasControlsChanged =
    searchQuery.trim().length > 0 ||
    statusFilter !== "all" ||
    sortBy !== "newest";

  return (
    <PublicAccountPanel className="p-4 sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search title, city, area, location, or category"
            className="w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-background)] py-3 pl-11 pr-4 text-sm font-medium text-[var(--admin-text)] outline-none transition placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-primary)] focus:bg-white focus:ring-4 focus:ring-[rgba(0,0,128,0.08)]"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="inline-flex items-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-background)] px-3 py-3 text-sm font-semibold text-[var(--admin-text)]">
            <SlidersHorizontal className="h-4 w-4 text-[var(--admin-primary)]" />
            <select
              value={sortBy}
              onChange={(event) =>
                onSortChange(event.target.value as ListingSort)
              }
              className="min-w-0 bg-transparent text-sm font-semibold text-[var(--admin-text)] outline-none"
              aria-label="Sort listings"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={onReset}
            disabled={!hasControlsChanged}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--admin-muted)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {STATUS_FILTER_OPTIONS.map((option) => {
          const selected = statusFilter === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onFilterChange(option.value)}
              className={`inline-flex min-h-10 shrink-0 items-center justify-center rounded-full border px-4 text-sm font-bold transition ${
                selected
                  ? "border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white"
                  : "border-[var(--admin-border)] bg-[var(--admin-background)] text-[var(--admin-muted)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs font-semibold text-[var(--admin-muted)]">
        Showing {visibleCount} of {totalCount} listing
        {totalCount === 1 ? "" : "s"}
      </p>
    </PublicAccountPanel>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[1.35rem] border border-[var(--admin-border)] bg-white px-4 py-4 shadow-[0_16px_40px_-36px_var(--admin-shadow)]">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--admin-muted)]">
        {label}
      </p>

      <p className="mt-2 truncate text-lg font-black text-[var(--admin-text)]">
        {value}
      </p>
    </div>
  );
}

function PromotionModal({
  state,
  loading,
  onClose,
  onConfirm,
}: {
  state: PromotionModalState;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!state) return null;

  const promotionLabel = state.type === "featured" ? "Featured" : "Boosted";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 px-4">
      <div className="w-full max-w-md rounded-[2rem] border border-[var(--admin-border)] bg-white p-6 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--admin-secondary)]">
              Promote listing
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--admin-text)]">
              {promotionLabel} this property?
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--admin-border)] text-[var(--admin-muted)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 text-sm leading-6 text-[var(--admin-muted)]">
          Promotion helps your property appear higher in matching search
          results. It still respects user filters and review rules.
        </p>

        <div className="mt-5 rounded-[1.5rem] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
          <p className="text-sm font-semibold text-[var(--admin-text)]">
            {getPropertyTitle(state.property)}
          </p>

          <p className="mt-2 text-sm text-[var(--admin-muted)]">
            Duration: 15 days
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center rounded-2xl border border-[var(--admin-border)] px-4 py-3 text-sm font-semibold text-[var(--admin-text)]"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--admin-primary)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Confirm {promotionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function PropertyManagementCard({
  property,
  onDelete,
  onToggleStatus,
  onOpenPromotion,
}: {
  property: PublicProperty;
  onDelete: (property: PublicProperty) => void;
  onToggleStatus: (property: PublicProperty) => void;
  onOpenPromotion: (property: PublicProperty, type: PromotionType) => void;
}) {
  const isFeatured = isActiveFeaturedPromotion(property);
  const isBoosted = !isFeatured && isActiveBoostedPromotion(property);
  const promotionStatus = getPromotionStatusLabel(property);
  const expiryLabel = getPropertyExpiryLabel(property);

  const eligibleForPromotion =
    property.isApproved === true &&
    property.status !== false &&
    property.moderationStatus !== "DELETED" &&
    property.moderationStatus !== "INACTIVE";

  const canFeature = eligibleForPromotion && !isFeatured;
  const canBoost = eligibleForPromotion && !isFeatured && !isBoosted;
  const ctr = getCtr(property);

  return (
    <PublicAccountPanel className="overflow-hidden rounded-[2rem] border border-[var(--admin-border)] bg-white shadow-[0_28px_90px_-60px_var(--admin-shadow)]">
      <div className="block xl:hidden">
        <div className="p-4">
          <div className="flex gap-4">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[1.35rem] bg-[var(--admin-card)]">
              <Image
                src={property.photos?.[0] || DEFAULT_PROPERTY_IMAGE}
                alt={getPropertyTitle(property)}
                fill
                sizes="112px"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 to-transparent" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-1.5">
                <ListingBadge
                  label={property.isApproved ? "Approved" : "Pending"}
                  tone={getStatusTone(
                    property.isApproved ? "approved" : "pending",
                  )}
                />

                <ListingBadge
                  label={property.status === false ? "Inactive" : "Active"}
                  tone={getStatusTone(
                    property.status === false ? "inactive" : "active",
                  )}
                />
              </div>

              <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--admin-secondary)]">
                {getCategoryLabel(getPropertyCategory(property)).toUpperCase()}
              </p>

              <h2 className="mt-1 line-clamp-2 text-base font-black leading-snug text-[var(--admin-text)]">
                {getPropertyTitle(property)}
              </h2>

              <p className="mt-1 line-clamp-1 text-xs font-medium text-[var(--admin-muted)]">
                {getPropertyLocationLabel(property) || "Location unavailable"}
              </p>

              <p className="mt-2 text-base font-black text-[var(--admin-primary)]">
                {getPropertyPriceDisplay(property)}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-[var(--admin-background)] px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--admin-muted)]">
                Views
              </p>

              <p className="mt-1 text-sm font-black text-[var(--admin-text)]">
                {property.views ?? 0}
              </p>
            </div>

            <div className="rounded-2xl bg-[var(--admin-background)] px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--admin-muted)]">
                CTR
              </p>

              <p className="mt-1 text-sm font-black text-[var(--admin-text)]">
                {ctr.toFixed(1)}%
              </p>
            </div>

            <div className="rounded-2xl bg-[var(--admin-background)] px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--admin-muted)]">
                Promo
              </p>

              <p className="mt-1 truncate text-sm font-black text-[var(--admin-text)]">
                {promotionStatus}
              </p>
            </div>
          </div>

          {expiryLabel ? (
            <div className="mt-3 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-background)] px-3 py-3">
              <p className="text-xs font-bold text-[var(--admin-muted)]">
                {expiryLabel}
              </p>
            </div>
          ) : null}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              href={buildPropertyHref(property)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-white px-3 py-3 text-sm font-bold text-[var(--admin-text)]"
            >
              <Eye className="h-4 w-4" />
              View
            </Link>

            <Link
              href={`/account/properties/${property._id}/edit`}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-white px-3 py-3 text-sm font-bold text-[var(--admin-text)]"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>

            <button
              type="button"
              onClick={() => onToggleStatus(property)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-white px-3 py-3 text-sm font-bold text-[var(--admin-text)]"
            >
              <EyeOff className="h-4 w-4" />
              {property.status === false ? "Activate" : "Pause"}
            </button>

            <button
              type="button"
              onClick={() => onDelete(property)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm font-bold text-rose-700"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>

          <div className="mt-3 grid gap-2">
            <button
              type="button"
              disabled={!canFeature}
              onClick={() => onOpenPromotion(property, "featured")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--admin-primary)] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              <Sparkles className="h-4 w-4" />
              {isFeatured ? "Featured Active" : "Make Featured"}
            </button>

            <button
              type="button"
              disabled={!canBoost}
              onClick={() => onOpenPromotion(property, "boost")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--admin-primary)] bg-white px-4 py-3 text-sm font-bold text-[var(--admin-primary)] disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
            >
              <Rocket className="h-4 w-4" />
              {isBoosted ? "Boosted Active" : "Boost listing"}
            </button>
          </div>
        </div>
      </div>

      <div className="hidden xl:grid xl:grid-cols-[260px_minmax(0,1fr)_270px]">
        <div className="relative min-h-[280px] overflow-hidden bg-[var(--admin-card)]">
          <Image
            src={property.photos?.[0] || DEFAULT_PROPERTY_IMAGE}
            alt={getPropertyTitle(property)}
            fill
            sizes="260px"
            className="object-cover transition duration-500 hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-transparent" />

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <ListingBadge
              label={property.isApproved ? "Approved" : "Pending"}
              tone={getStatusTone(property.isApproved ? "approved" : "pending")}
            />

            <ListingBadge
              label={property.status === false ? "Inactive" : "Active"}
              tone={getStatusTone(
                property.status === false ? "inactive" : "active",
              )}
            />
          </div>

          <div className="absolute bottom-4 left-4 right-4 rounded-[1.35rem] border border-white/15 bg-white/90 p-4 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.8)] backdrop-blur">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-muted)]">
              Price
            </p>

            <p className="mt-1 text-xl font-black text-[var(--admin-primary)]">
              {getPropertyPriceDisplay(property)}
            </p>
          </div>
        </div>

        <div className="p-7">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--admin-secondary)]">
                {getCategoryLabel(getPropertyCategory(property)).toUpperCase()}
              </p>

              <h2 className="mt-2 max-w-3xl text-2xl font-semibold leading-snug tracking-tight text-[var(--admin-text)]">
                {getPropertyTitle(property)}
              </h2>

              <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-[var(--admin-muted)]">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-[var(--admin-primary)]" />
                <span className="line-clamp-2">
                  {getPropertyLocationLabel(property) || "Location unavailable"}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {promotionStatus === "Featured Active" ? (
                <ListingBadge
                  label="Featured"
                  tone={getStatusTone("featured")}
                />
              ) : null}

              {promotionStatus === "Boosted Active" ? (
                <ListingBadge label="Boosted" tone={getStatusTone("boosted")} />
              ) : null}

              {promotionStatus === "Expired" ? (
                <ListingBadge label="Expired" tone={getStatusTone("expired")} />
              ) : null}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MiniMetric label="Promotion" value={promotionStatus} />
            <MiniMetric label="Views" value={property.views ?? 0} />
            <MiniMetric label="Impressions" value={property.impressions ?? 0} />
            <MiniMetric label="CTR" value={`${ctr.toFixed(1)}%`} />
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-[var(--admin-border)] bg-[linear-gradient(135deg,var(--admin-primary-soft),var(--admin-card))] px-4 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-[var(--admin-text)]">
                  Promotion improves listing visibility.
                </p>

                <p className="mt-1 text-sm leading-6 text-[var(--admin-muted)]">
                  It helps your property appear higher in matching results, but
                  still respects user filters and review rules.
                </p>
              </div>

              {expiryLabel ? (
                <div className="rounded-2xl border border-[var(--admin-border)] bg-white px-4 py-3 text-sm font-bold text-[var(--admin-text)]">
                  {expiryLabel}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="border-l border-[var(--admin-border)] bg-[var(--admin-background)]/55 p-5">
          <div className="sticky top-24 space-y-4">
            <div className="grid gap-3">
              <Link
                href={buildPropertyHref(property)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-white px-4 py-3 text-sm font-bold text-[var(--admin-text)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
              >
                <Eye className="h-4 w-4" />
                View listing
              </Link>

              <Link
                href={`/account/properties/${property._id}/edit`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-white px-4 py-3 text-sm font-bold text-[var(--admin-text)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
              >
                <Pencil className="h-4 w-4" />
                Edit details
              </Link>

              <button
                type="button"
                onClick={() => onToggleStatus(property)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-white px-4 py-3 text-sm font-bold text-[var(--admin-text)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
              >
                <EyeOff className="h-4 w-4" />
                {property.status === false
                  ? "Activate listing"
                  : "Pause listing"}
              </button>
            </div>

            <div className="rounded-[1.5rem] border border-[var(--admin-border)] bg-white p-4 shadow-[0_18px_44px_-38px_var(--admin-shadow)]">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                Promotion actions
              </p>

              <div className="mt-3 grid gap-3">
                <button
                  type="button"
                  disabled={!canFeature}
                  onClick={() => onOpenPromotion(property, "featured")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--admin-primary)] px-4 py-3 text-sm font-bold text-white shadow-[0_18px_34px_-26px_var(--admin-primary)] transition hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
                >
                  <Sparkles className="h-4 w-4" />
                  {isFeatured ? "Featured Active" : "Make Featured"}
                </button>

                <button
                  type="button"
                  disabled={!canBoost}
                  onClick={() => onOpenPromotion(property, "boost")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--admin-primary)] bg-white px-4 py-3 text-sm font-bold text-[var(--admin-primary)] transition hover:-translate-y-0.5 hover:bg-[var(--admin-primary)] hover:text-white disabled:cursor-not-allowed disabled:translate-y-0 disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-white"
                >
                  <Rocket className="h-4 w-4" />
                  {isBoosted ? "Boosted Active" : "Boost listing"}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onDelete(property)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
            >
              <Trash2 className="h-4 w-4" />
              Delete listing
            </button>
          </div>
        </div>
      </div>
    </PublicAccountPanel>
  );
}

export default function PublicMyPropertiesScreen() {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<PublicProperty[]>([]);
  const [drafts, setDrafts] = useState<DraftListing[]>([]);
  const [promotionModal, setPromotionModal] =
    useState<PromotionModalState>(null);
  const [promoting, setPromoting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ListingStatusFilter>("all");
  const [sortBy, setSortBy] = useState<ListingSort>("newest");

  const mergeListingAnalytics = (
    properties: PublicProperty[],
    dashboard?: DashboardStatsResponse,
  ) => {
    const analyticsMap = new Map(
      (dashboard?.data || []).map((property) => [property._id, property]),
    );

    return properties.map((property) => ({
      ...analyticsMap.get(property._id),
      ...property,
    }));
  };

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [listingResponse, draftResponse, dashboardResponse] =
        await Promise.all([
          publicApiClient.get("/properties/my-listings", {
            params: { page: 1, limit: 24, sort: "newest" },
          }),
          publicApiClient.get("/properties/drafts"),
          publicApiClient.get("/properties/dashboard-stats", {
            params: { page: 1, limit: 50 },
          }),
        ]);

      setListings(
        mergeListingAnalytics(
          Array.isArray(listingResponse.data?.data)
            ? listingResponse.data.data
            : [],
          dashboardResponse.data,
        ),
      );

      setDrafts(Array.isArray(draftResponse.data) ? draftResponse.data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const emptyState = useMemo(
    () => listings.length === 0 && drafts.length === 0,
    [drafts.length, listings.length],
  );

  const listingSummary = useMemo(
    () => ({
      total: listings.length,
      active: listings.filter(isActiveListing).length,
      pending: listings.filter(isPendingReview).length,
      drafts: drafts.length,
      featured: listings.filter((property) =>
        isActiveFeaturedPromotion(property),
      ).length,
      boosted: listings.filter((property) => isActiveBoostedPromotion(property))
        .length,
    }),
    [drafts.length, listings],
  );

  const filteredListings = useMemo(
    () =>
      sortListings(
        listings.filter(
          (property) =>
            propertyMatchesFilter(property, statusFilter) &&
            propertyMatchesSearch(property, searchQuery),
        ),
        sortBy,
      ),
    [listings, searchQuery, sortBy, statusFilter],
  );

  const resetListingControls = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortBy("newest");
  }, []);

  const handleDeleteListing = async (property: PublicProperty) => {
    if (!window.confirm("Delete this property permanently?")) return;

    try {
      await publicApiClient.delete(`/properties/${property._id}`);
      setListings((current) =>
        current.filter((item) => item._id !== property._id),
      );
      toast.success("Property deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed.");
    }
  };

  const handleToggleStatus = async (property: PublicProperty) => {
    try {
      const nextStatus = property.status === false;

      await publicApiClient.patch(`/properties/${property._id}/visibility`, {
        status: nextStatus,
      });

      setListings((current) =>
        current.map((item) =>
          item._id === property._id ? { ...item, status: nextStatus } : item,
        ),
      );

      toast.success(
        nextStatus ? "Property activated." : "Property deactivated.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Status update failed.",
      );
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    if (!window.confirm("Delete this draft?")) return;

    try {
      await publicApiClient.delete(`/properties/drafts/${draftId}`);
      setDrafts((current) => current.filter((draft) => draft._id !== draftId));
      toast.success("Draft deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Draft deletion failed.",
      );
    }
  };

  const handlePromote = async () => {
    if (!promotionModal) return;

    setPromoting(true);

    try {
      const response = await publicApiClient.post(
        `/properties/${promotionModal.property._id}/promote`,
        {
          type: promotionModal.type,
        },
      );

      const updatedProperty =
        response.data?.property || response.data?.data?.property || null;

      if (updatedProperty?._id) {
        setListings((current) =>
          current.map((property) =>
            property._id === updatedProperty._id
              ? { ...property, ...updatedProperty }
              : property,
          ),
        );
      } else {
        await loadData();
      }

      toast.success(
        promotionModal.type === "featured"
          ? "Listing promoted to Featured."
          : "Listing promoted to Boosted.",
      );

      setPromotionModal(null);
    } catch (error: unknown) {
      const message =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
          ? String(error.response.data.message)
          : error instanceof Error
            ? error.message
            : "Promotion failed.";

      if (message.includes("No Featured Credits")) {
        toast.error("No featured credits remaining.");
      } else if (message.includes("No Boost Slots")) {
        toast.error("No boost credits remaining.");
      } else if (message.includes("approved")) {
        toast.error("Only approved listings can be promoted.");
      } else if (message.includes("Unauthorized") || message.includes("own")) {
        toast.error("You can only promote your own eligible listings.");
      } else {
        toast.error(message);
      }
    } finally {
      setPromoting(false);
    }
  };

  return (
    <PublicAccountShell
      title="My Properties"
      description="Manage published, pending, and draft listings from a cleaner operational view with promotion controls and performance context."
    >
      <PromotionModal
        state={promotionModal}
        loading={promoting}
        onClose={() => {
          if (!promoting) setPromotionModal(null);
        }}
        onConfirm={() => void handlePromote()}
      />

      {loading ? (
        <PublicAccountPanel className="flex min-h-[320px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--admin-primary)]" />
        </PublicAccountPanel>
      ) : emptyState ? (
        <PublicEmptyState
          title="No uploads yet"
          description="You haven't published any property listings yet."
          ctaHref="/upload-property"
          ctaLabel="Upload your first property"
          icon={Plus}
        />
      ) : (
        <div className="space-y-8">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <SummaryCard label="Total" value={listingSummary.total} />
            <SummaryCard label="Active" value={listingSummary.active} />
            <SummaryCard label="Pending" value={listingSummary.pending} />
            <SummaryCard label="Drafts" value={listingSummary.drafts} />
            <SummaryCard label="Featured" value={listingSummary.featured} />
            <SummaryCard label="Boosted" value={listingSummary.boosted} />
          </div>

          {listings.length > 0 ? (
            <section className="space-y-5">
              <PublicAccountPanel className="p-5 sm:p-6">
                <PublicAccountSectionHeading
                  eyebrow="Listings"
                  title="Published and pending listings"
                  description="Promotion can help your listing appear higher in matching search results while still respecting user filters and review rules."
                  action={
                    <div className="inline-flex items-center gap-2 rounded-full bg-[var(--admin-surface)] px-4 py-2 text-sm font-semibold text-[var(--admin-muted)]">
                      <BarChart3 className="h-4 w-4 text-[var(--admin-primary)]" />
                      {filteredListings.length === listings.length
                        ? `${listings.length} listings`
                        : `${filteredListings.length} of ${listings.length} listings`}
                    </div>
                  }
                />
              </PublicAccountPanel>

              <ListingControls
                searchQuery={searchQuery}
                statusFilter={statusFilter}
                sortBy={sortBy}
                visibleCount={filteredListings.length}
                totalCount={listings.length}
                onSearchChange={setSearchQuery}
                onFilterChange={setStatusFilter}
                onSortChange={setSortBy}
                onReset={resetListingControls}
              />

              {filteredListings.length > 0 ? (
                <div className="grid gap-5">
                  {filteredListings.map((property) => (
                    <PropertyManagementCard
                      key={property._id}
                      property={property}
                      onDelete={handleDeleteListing}
                      onToggleStatus={handleToggleStatus}
                      onOpenPromotion={(selectedProperty, type) =>
                        setPromotionModal({
                          property: selectedProperty,
                          type,
                        })
                      }
                    />
                  ))}
                </div>
              ) : (
                <PublicAccountPanel className="p-8 text-center">
                  <h3 className="text-xl font-black text-[var(--admin-text)]">
                    No listings match your filters.
                  </h3>

                  <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--admin-muted)]">
                    Try a different search term, status filter, or sort option
                    to bring your listings back into view.
                  </p>

                  <button
                    type="button"
                    onClick={resetListingControls}
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--admin-primary)] px-5 py-3 text-sm font-bold text-white transition hover:opacity-95"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Clear filters
                  </button>
                </PublicAccountPanel>
              )}
            </section>
          ) : null}

          {drafts.length > 0 ? (
            <PublicAccountPanel className="p-5 sm:p-6">
              <PublicAccountSectionHeading
                eyebrow="Drafts"
                title="Saved drafts"
                description="Continue unfinished listings or remove drafts you no longer need."
                action={
                  <ShieldCheck className="h-5 w-5 text-[var(--admin-primary)]" />
                }
              />

              <div className="mt-5 grid gap-4">
                {drafts.map((draft) => (
                  <div
                    key={draft._id}
                    className="flex flex-col gap-4 rounded-[1.35rem] border border-[var(--admin-border)] bg-[var(--admin-background)] px-4 py-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="text-base font-bold text-[var(--admin-text)]">
                        {getPropertyTitle(draft) || "Untitled draft"}
                      </p>

                      <p className="mt-1 text-sm text-[var(--admin-muted)]">
                        {draft.location ||
                          draft.area ||
                          "Draft location not set yet"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/upload-property?draftId=${draft._id}`}
                        className="inline-flex items-center justify-center rounded-2xl border border-[var(--admin-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--admin-text)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
                      >
                        Continue editing
                      </Link>

                      <button
                        type="button"
                        onClick={() => void handleDeleteDraft(draft._id)}
                        className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-700 transition hover:border-rose-300"
                      >
                        Delete draft
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </PublicAccountPanel>
          ) : null}
        </div>
      )}
    </PublicAccountShell>
  );
}
