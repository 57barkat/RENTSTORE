"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ChevronRight,
  Clock3,
  Eye,
  Heart,
  ListChecks,
  Loader2,
  UploadCloud,
  UserCircle2,
  type LucideIcon,
} from "lucide-react";

import PublicAccountShell from "@/app/components/public/PublicAccountShell";
import {
  PublicAccountPanel,
  PublicAccountStatCard,
  PublicEmptyState,
  PublicMetricPill,
  PublicQuickActionCard,
} from "@/app/components/public/PublicAccountPieces";
import { usePublicAuth } from "@/app/components/public/PublicAuthProvider";
import type { DashboardStatsResponse } from "@/app/lib/public-account-types";
import publicApiClient from "@/app/lib/public-api-client";

type UploadStatus = {
  limit?: number;
  used?: number;
  remainingFree?: number;
  paidCredits?: number;
  canUpload?: boolean;
};

type DashboardState = {
  uploadStatus?: UploadStatus;
  dashboard?: DashboardStatsResponse;
  pendingTotal?: number;
};

type MobileActionRowProps = {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  primary?: boolean;
};

function MobileActionRow({
  href,
  icon: Icon,
  title,
  description,
  primary = false,
}: MobileActionRowProps) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-[1.25rem] border px-4 py-3.5 transition ${
        primary
          ? "border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white shadow-[0_18px_40px_-28px_var(--admin-primary)]"
          : "border-[var(--admin-border)] bg-white text-[var(--admin-text)] hover:border-[var(--admin-primary)]/40 hover:bg-[var(--admin-background)]"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
          primary
            ? "bg-white/15 text-white"
            : "bg-[var(--admin-surface)] text-[var(--admin-primary)]"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold">{title}</span>

        <span
          className={`mt-0.5 block text-xs leading-5 ${
            primary ? "text-white/80" : "text-[var(--admin-muted)]"
          }`}
        >
          {description}
        </span>
      </span>

      <ChevronRight
        className={`h-4 w-4 shrink-0 transition group-hover:translate-x-0.5 ${
          primary ? "text-white/90" : "text-[var(--admin-muted)]"
        }`}
      />
    </Link>
  );
}

function MobileStatTile({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: ReactNode;
  hint: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-[1.35rem] border border-[var(--admin-border)] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
            {label}
          </p>

          <p className="mt-3 text-3xl font-black tracking-tight text-[var(--admin-text)]">
            {value}
          </p>
        </div>

        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--admin-surface)] text-[var(--admin-primary)]">
          <Icon className="h-4 w-4" />
        </span>
      </div>

      <p className="mt-3 text-xs leading-5 text-[var(--admin-muted)]">{hint}</p>
    </div>
  );
}

function MobileCapacityCard({
  uploadStatus,
  role,
}: {
  uploadStatus?: UploadStatus;
  role?: string;
}) {
  const remainingFree = uploadStatus?.remainingFree ?? 0;
  const limit = uploadStatus?.limit ?? 0;
  const used = uploadStatus?.used ?? 0;
  const canUpload = uploadStatus?.canUpload !== false;

  return (
    <div className="rounded-[1.5rem] border border-[var(--admin-border)] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
            Upload capacity
          </p>

          <p className="mt-2 text-2xl font-black tracking-tight text-[var(--admin-text)]">
            {remainingFree} free slots left
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            canUpload
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {canUpload ? "Available" : "Full"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-[var(--admin-background)] px-3 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--admin-muted)]">
            Used
          </p>

          <p className="mt-1 text-base font-black text-[var(--admin-text)]">
            {used}
          </p>
        </div>

        <div className="rounded-2xl bg-[var(--admin-background)] px-3 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--admin-muted)]">
            Limit
          </p>

          <p className="mt-1 text-base font-black text-[var(--admin-text)]">
            {limit}
          </p>
        </div>
        {/* 
        <div className="rounded-2xl bg-[var(--admin-background)] px-3 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--admin-muted)]">
            Credits
          </p>

          <p className="mt-1 text-base font-black text-[var(--admin-text)]">
            {paidCredits}
          </p>
        </div> */}
      </div>

      <p className="mt-4 text-xs leading-5 text-[var(--admin-muted)]">
        Account role:{" "}
        <span className="font-bold text-[var(--admin-text)]">
          {role || "user"}
        </span>
        . Listings are reviewed before they go live, and visibility settings are
        managed automatically.
      </p>
    </div>
  );
}

export default function PublicDashboardScreen() {
  const { user, isLoading: authLoading } = usePublicAuth();
  const [stats, setStats] = useState<DashboardState>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [uploadStatus, dashboard, pending] = await Promise.all([
          publicApiClient.get("/users/upload-status"),
          publicApiClient.get("/properties/dashboard-stats", {
            params: { page: 1, limit: 6 },
          }),
          publicApiClient.get("/properties/my-listings", {
            params: {
              page: 1,
              limit: 1,
              approvalStatus: "pending",
            },
          }),
        ]);

        if (cancelled) return;

        setStats({
          uploadStatus: uploadStatus.data,
          dashboard: dashboard.data,
          pendingTotal: pending.data?.total ?? 0,
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const isBusy = authLoading || loading;

  const dashboardStats = useMemo(
    () => [
      {
        label: "Total uploads",
        value: user?.totalProperties ?? 0,
        hint: "Listings created",
        icon: ListChecks,
      },
      {
        label: "Favorites",
        value: user?.totalFavorites ?? 0,
        hint: "Saved listings",
        icon: Heart,
      },
      {
        label: "Active listings",
        value: stats.dashboard?.totals?.activeListings ?? 0,
        hint: "Publicly visible",
        icon: Eye,
      },
      {
        label: "Pending review",
        value: stats.pendingTotal ?? 0,
        hint: "Awaiting approval",
        icon: Clock3,
      },
    ],
    [
      stats.dashboard?.totals?.activeListings,
      stats.pendingTotal,
      user?.totalFavorites,
      user?.totalProperties,
    ],
  );

  return (
    <PublicAccountShell
      title="Your account dashboard"
      description="Manage uploads, favorites, listing activity, and account capacity from one simple workspace."
    >
      {isBusy ? (
        <PublicAccountPanel className="flex min-h-[320px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--admin-primary)]" />
        </PublicAccountPanel>
      ) : (
        <div className="space-y-5 sm:space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:hidden">
            {dashboardStats.map((item) => (
              <MobileStatTile
                key={item.label}
                label={item.label}
                value={item.value}
                hint={item.hint}
                icon={item.icon}
              />
            ))}
          </div>

          <div className="hidden gap-4 sm:grid sm:grid-cols-2 2xl:grid-cols-4">
            <PublicAccountStatCard
              label="Total uploads"
              value={user?.totalProperties ?? 0}
              hint="Listings created under this account"
              icon={ListChecks}
            />

            <PublicAccountStatCard
              label="Favorites"
              value={user?.totalFavorites ?? 0}
              hint="Saved listings for later"
              icon={Heart}
            />

            <PublicAccountStatCard
              label="Active listings"
              value={stats.dashboard?.totals?.activeListings ?? 0}
              hint="Approved and publicly visible"
              icon={Eye}
            />

            <PublicAccountStatCard
              label="Pending review"
              value={stats.pendingTotal ?? 0}
              hint="Waiting for moderation"
              icon={Clock3}
            />
          </div>

          <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="lg:hidden">
              <div className="rounded-[1.5rem] border border-[var(--admin-border)] bg-white p-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
                    Quick actions
                  </p>

                  <h2 className="mt-2 text-xl font-black tracking-tight text-[var(--admin-text)]">
                    What do you want to do?
                  </h2>
                </div>

                <div className="mt-4 grid gap-3">
                  <MobileActionRow
                    href="/upload-property"
                    icon={UploadCloud}
                    title="Upload property"
                    description="Create a new listing"
                    primary
                  />

                  <MobileActionRow
                    href="/account/properties"
                    icon={ListChecks}
                    title="Manage uploads"
                    description="Edit, promote, activate, or delete listings"
                  />

                  <MobileActionRow
                    href="/account/favorites"
                    icon={Heart}
                    title="Open favorites"
                    description="Review saved properties"
                  />

                  <MobileActionRow
                    href="/account/profile"
                    icon={UserCircle2}
                    title="Profile and account"
                    description="Review your role and details"
                  />
                </div>
              </div>
            </div>

            <PublicAccountPanel className="hidden p-5 sm:p-6 lg:block">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
                    Overview
                  </p>

                  <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--admin-text)]">
                    Quick actions
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--admin-muted)]">
                    Jump into the tasks owners and agents use most, without
                    digging through separate screens.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <PublicQuickActionCard
                  href="/account/properties"
                  icon={ListChecks}
                  title="Manage uploads"
                  description="Edit, promote, activate, or clean up existing listings and drafts."
                />

                <PublicQuickActionCard
                  href="/account/favorites"
                  icon={Heart}
                  title="Open favorites"
                  description="Review and remove the properties you saved while browsing."
                />

                <PublicQuickActionCard
                  href="/account/profile"
                  icon={UserCircle2}
                  title="Profile and account"
                  description="Review your role, account details, and listing privileges."
                />
              </div>
            </PublicAccountPanel>

            <div className="lg:hidden">
              <MobileCapacityCard
                uploadStatus={stats.uploadStatus}
                role={user?.role}
              />
            </div>

            <div className="hidden space-y-4 lg:block">
              <PublicAccountPanel className="p-5 sm:p-6">
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
                      Capacity
                    </p>

                    <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--admin-text)]">
                      Upload summary
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[var(--admin-muted)]">
                      A compact look at what you can publish next.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <PublicMetricPill
                    label="Free slots left"
                    value={stats.uploadStatus?.remainingFree ?? 0}
                  />

                  <PublicMetricPill
                    label="Paid credits"
                    value={stats.uploadStatus?.paidCredits ?? 0}
                  />

                  <PublicMetricPill
                    label="Total limit"
                    value={stats.uploadStatus?.limit ?? 0}
                  />

                  <PublicMetricPill label="Role" value={user?.role || "user"} />
                </div>

                <div className="mt-5 rounded-[1.25rem] border border-[var(--admin-border)] bg-[var(--admin-background)] px-4 py-4">
                  <p className="text-sm font-semibold text-[var(--admin-text)]">
                    {stats.uploadStatus?.canUpload === false
                      ? "You’ve used your available upload capacity for now."
                      : "You still have room to publish more listings."}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[var(--admin-muted)]">
                    Listings are reviewed before they go live. Visibility and
                    promotion settings are managed automatically.
                  </p>
                </div>
              </PublicAccountPanel>
            </div>
          </div>
        </div>
      )}

      {!isBusy && !user ? (
        <PublicEmptyState
          title="Session unavailable"
          description="We couldn't load your account session. Please log in again to continue."
          ctaHref="/account/login"
          ctaLabel="Go to login"
          icon={UploadCloud}
        />
      ) : null}
    </PublicAccountShell>
  );
}
