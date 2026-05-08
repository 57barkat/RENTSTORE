"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Heart,
  Home,
  Loader2,
  Plus,
  UploadCloud,
} from "lucide-react";

import PublicAccountShell from "@/app/components/public/PublicAccountShell";
import {
  PublicAccountPanel,
  PublicAccountSectionHeading,
  PublicAccountStatCard,
  PublicEmptyState,
  PublicMetricPill,
  PublicQuickActionCard,
} from "@/app/components/public/PublicAccountPieces";
import { usePublicAuth } from "@/app/components/public/PublicAuthProvider";
import type { DashboardStatsResponse } from "@/app/lib/public-account-types";
import publicApiClient from "@/app/lib/public-api-client";

export default function PublicDashboardScreen() {
  const { user, isLoading: authLoading } = usePublicAuth();
  const [stats, setStats] = useState<{
    uploadStatus?: {
      limit?: number;
      used?: number;
      remainingFree?: number;
      paidCredits?: number;
      canUpload?: boolean;
    };
    dashboard?: DashboardStatsResponse;
    pendingTotal?: number;
  }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

        setStats({
          uploadStatus: uploadStatus.data,
          dashboard: dashboard.data,
          pendingTotal: pending.data?.total ?? 0,
        });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const isBusy = authLoading || loading;

  return (
    <PublicAccountShell
      title="Your account dashboard"
      description="Keep track of uploads, listing health, and account capacity from one cleaner workspace built for fast daily management."
    >
      {isBusy ? (
        <PublicAccountPanel className="flex min-h-[320px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--admin-primary)]" />
        </PublicAccountPanel>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            <PublicAccountStatCard
              label="Total uploads"
              value={user?.totalProperties ?? 0}
              hint="Listings created under this account"
              icon={Home}
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
              icon={BarChart3}
            />
            <PublicAccountStatCard
              label="Pending review"
              value={stats.pendingTotal ?? 0}
              hint="Waiting for moderation"
              icon={UploadCloud}
            />
          </div>

          <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
            <PublicAccountPanel className="p-5 sm:p-6">
              <PublicAccountSectionHeading
                eyebrow="Overview"
                title="Quick actions"
                description="Jump into the tasks owners and agents use most, without digging through separate screens."
              />
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <PublicQuickActionCard
                  href="/upload-property"
                  icon={UploadCloud}
                  title="Upload property"
                  description="Create a new listing with the same backend flow used by the mobile app."
                />
                <PublicQuickActionCard
                  href="/account/properties"
                  icon={Home}
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
                  icon={Plus}
                  title="Profile and account"
                  description="Review your role, account details, and listing privileges."
                />
              </div>
            </PublicAccountPanel>

            <div className="space-y-4">
              <PublicAccountPanel className="p-5 sm:p-6">
                <PublicAccountSectionHeading
                  eyebrow="Capacity"
                  title="Upload summary"
                  description="A compact look at what you can publish next."
                  action={
                    <Link
                      href="/upload-property"
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--admin-primary)] px-4 py-2.5 text-sm font-semibold text-white"
                    >
                      <Plus className="h-4 w-4" />
                      New listing
                    </Link>
                  }
                />

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
                  <PublicMetricPill
                    label="Role"
                    value={user?.role || "user"}
                  />
                </div>

                <div className="mt-5 rounded-[1.25rem] border border-[var(--admin-border)] bg-[var(--admin-background)] px-4 py-4">
                  <p className="text-sm font-semibold text-[var(--admin-text)]">
                    {stats.uploadStatus?.canUpload === false
                      ? "You’ve used your available upload capacity for now."
                      : "You still have room to publish more listings."}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--admin-muted)]">
                    Moderation and promotion rules are still handled server-side after submission, just like the mobile flow.
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
