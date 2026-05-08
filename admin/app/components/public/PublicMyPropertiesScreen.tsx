"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Rocket,
  ShieldCheck,
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
  PublicMetricPill,
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
type PromotionModalState = { property: PublicProperty; type: PromotionType } | null;

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
    return `Expired ${formatPromotionDate(property.featuredUntil || property.boostedUntil)}`;
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
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${tone}`}
    >
      {label}
    </span>
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
          Promotion improves visibility in matching search results. It does not bypass user filters.
        </p>
        <div className="mt-5 rounded-[1.5rem] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
          <p className="text-sm font-semibold text-[var(--admin-text)]">
            {getPropertyTitle(state.property)}
          </p>
          <p className="mt-2 text-sm text-[var(--admin-muted)]">Duration: 15 days</p>
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
    <PublicAccountPanel className="overflow-hidden">
      <div className="grid gap-0 xl:grid-cols-[220px_minmax(0,1fr)_290px]">
        <div className="relative min-h-[210px] overflow-hidden bg-[var(--admin-card)] xl:min-h-full">
          <Image
            src={property.photos?.[0] || DEFAULT_PROPERTY_IMAGE}
            alt={getPropertyTitle(property)}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 40vw, 220px"
            className="object-cover"
          />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <ListingBadge
              label={property.isApproved ? "Approved" : "Pending"}
              tone={getStatusTone(property.isApproved ? "approved" : "pending")}
            />
            <ListingBadge
              label={property.status === false ? "Inactive" : "Active"}
              tone={getStatusTone(property.status === false ? "inactive" : "active")}
            />
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--admin-secondary)]">
                {getCategoryLabel(getPropertyCategory(property)).toUpperCase()}
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--admin-text)]">
                {getPropertyTitle(property)}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--admin-muted)]">
                {getPropertyLocationLabel(property) || "Location unavailable"}
              </p>
            </div>

            <div className="rounded-[1.35rem] border border-[var(--admin-border)] bg-[var(--admin-background)] px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--admin-muted)]">
                Price
              </p>
              <p className="mt-1 text-lg font-black text-[var(--admin-primary)]">
                {getPropertyPriceDisplay(property)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {promotionStatus === "Featured Active" ? (
              <ListingBadge label="Featured" tone={getStatusTone("featured")} />
            ) : null}
            {promotionStatus === "Boosted Active" ? (
              <ListingBadge label="Boosted" tone={getStatusTone("boosted")} />
            ) : null}
            {promotionStatus === "Expired" ? (
              <ListingBadge label="Expired" tone={getStatusTone("expired")} />
            ) : null}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <PublicMetricPill label="Promotion" value={promotionStatus} />
            <PublicMetricPill label="Views" value={property.views ?? 0} />
            <PublicMetricPill label="Impressions" value={property.impressions ?? 0} />
            <PublicMetricPill label="CTR" value={`${ctr.toFixed(1)}%`} />
          </div>

          <div className="mt-5 rounded-[1.35rem] border border-[var(--admin-border)] bg-[var(--admin-background)] px-4 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--admin-text)]">
                  Promotion improves visibility in matching search results.
                </p>
                <p className="mt-1 text-sm text-[var(--admin-muted)]">
                  It never overrides user filters or moderation rules.
                </p>
              </div>
              {expiryLabel ? (
                <p className="text-sm font-semibold text-[var(--admin-muted)]">
                  {expiryLabel}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--admin-border)] bg-[var(--admin-background)]/60 p-5 xl:border-l xl:border-t-0">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <Link
              href={buildPropertyHref(property)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--admin-text)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
            >
              <Eye className="h-4 w-4" />
              View
            </Link>
            <Link
              href={`/account/properties/${property._id}/edit`}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--admin-text)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
            <button
              type="button"
              onClick={() => onToggleStatus(property)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--admin-text)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
            >
              <EyeOff className="h-4 w-4" />
              {property.status === false ? "Activate" : "Deactivate"}
            </button>
          </div>

          <div className="mt-4 rounded-[1.35rem] border border-[var(--admin-border)] bg-white p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
              Promotion actions
            </p>
            <div className="mt-3 grid gap-3">
              <button
                type="button"
                disabled={!canFeature}
                onClick={() => onOpenPromotion(property, "featured")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--admin-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
              >
                <Sparkles className="h-4 w-4" />
                {isFeatured ? "Featured Active" : "Promote Featured"}
              </button>
              <button
                type="button"
                disabled={!canBoost}
                onClick={() => onOpenPromotion(property, "boost")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--admin-primary)] bg-white px-4 py-3 text-sm font-semibold text-[var(--admin-primary)] transition hover:bg-[var(--admin-primary)] hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-white"
              >
                <Rocket className="h-4 w-4" />
                {isBoosted ? "Boosted Active" : "Promote Boosted"}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onDelete(property)}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </PublicAccountPanel>
  );
}

export default function PublicMyPropertiesScreen() {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<PublicProperty[]>([]);
  const [drafts, setDrafts] = useState<DraftListing[]>([]);
  const [promotionModal, setPromotionModal] = useState<PromotionModalState>(null);
  const [promoting, setPromoting] = useState(false);

  const mergeListingAnalytics = (
    properties: PublicProperty[],
    dashboard?: DashboardStatsResponse,
  ) => {
    const analyticsMap = new Map((dashboard?.data || []).map((property) => [property._id, property]));
    return properties.map((property) => ({ ...analyticsMap.get(property._id), ...property }));
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [listingResponse, draftResponse, dashboardResponse] = await Promise.all([
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
          Array.isArray(listingResponse.data?.data) ? listingResponse.data.data : [],
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

  const emptyState = useMemo(() => listings.length === 0 && drafts.length === 0, [drafts.length, listings.length]);

  const handleDeleteListing = async (property: PublicProperty) => {
    if (!window.confirm("Delete this property permanently?")) return;
    try {
      await publicApiClient.delete(`/properties/${property._id}`);
      setListings((current) => current.filter((item) => item._id !== property._id));
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
        current.map((item) => (item._id === property._id ? { ...item, status: nextStatus } : item)),
      );
      toast.success(nextStatus ? "Property activated." : "Property deactivated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Status update failed.");
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    if (!window.confirm("Delete this draft?")) return;
    try {
      await publicApiClient.delete(`/properties/drafts/${draftId}`);
      setDrafts((current) => current.filter((draft) => draft._id !== draftId));
      toast.success("Draft deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Draft deletion failed.");
    }
  };

  const handlePromote = async () => {
    if (!promotionModal) return;
    setPromoting(true);
    try {
      const response = await publicApiClient.post(`/properties/${promotionModal.property._id}/promote`, {
        type: promotionModal.type,
      });
      const updatedProperty = response.data?.property || response.data?.data?.property || null;
      if (updatedProperty?._id) {
        setListings((current) =>
          current.map((property) =>
            property._id === updatedProperty._id ? { ...property, ...updatedProperty } : property,
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

      if (message.includes("No Featured Credits")) toast.error("No featured credits remaining.");
      else if (message.includes("No Boost Slots")) toast.error("No boost credits remaining.");
      else if (message.includes("approved")) toast.error("Only approved listings can be promoted.");
      else if (message.includes("Unauthorized") || message.includes("own"))
        toast.error("You can only promote your own eligible listings.");
      else toast.error(message);
    } finally {
      setPromoting(false);
    }
  };

  return (
    <PublicAccountShell
      title="My uploads"
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
          description="You haven’t published or saved any property listings yet."
          ctaHref="/upload-property"
          ctaLabel="Upload your first property"
          icon={Plus}
        />
      ) : (
        <div className="space-y-8">
          {listings.length > 0 ? (
            <section className="space-y-5">
              <PublicAccountPanel className="p-5 sm:p-6">
                <PublicAccountSectionHeading
                  eyebrow="Listings"
                  title="Published and pending listings"
                  description="Promotion prioritizes matching search results while still respecting user filters and moderation."
                  action={
                    <div className="inline-flex items-center gap-2 rounded-full bg-[var(--admin-surface)] px-4 py-2 text-sm font-semibold text-[var(--admin-muted)]">
                      <BarChart3 className="h-4 w-4 text-[var(--admin-primary)]" />
                      {listings.length} listings
                    </div>
                  }
                />
              </PublicAccountPanel>

              <div className="grid gap-5">
                {listings.map((property) => (
                  <PropertyManagementCard
                    key={property._id}
                    property={property}
                    onDelete={handleDeleteListing}
                    onToggleStatus={handleToggleStatus}
                    onOpenPromotion={(selectedProperty, type) =>
                      setPromotionModal({ property: selectedProperty, type })
                    }
                  />
                ))}
              </div>
            </section>
          ) : null}

          {drafts.length > 0 ? (
            <PublicAccountPanel className="p-5 sm:p-6">
              <PublicAccountSectionHeading
                eyebrow="Drafts"
                title="Saved drafts"
                description="Continue unfinished listings or remove drafts you no longer need."
                action={<ShieldCheck className="h-5 w-5 text-[var(--admin-primary)]" />}
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
                        {draft.location || draft.area || "Draft location not set yet"}
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
