"use client";

import { ChangeEvent, useMemo, useState } from "react";
import {
  BadgeCheck,
  Camera,
  Loader2,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { toast } from "react-hot-toast";

import PublicAccountShell from "@/app/components/public/PublicAccountShell";
import { usePublicAuth } from "@/app/components/public/PublicAuthProvider";
import publicApiClient from "@/app/lib/public-api-client";
import { managePlans } from "@/app/lib/manage-plans";

const getInitials = (name?: string | null, email?: string | null) => {
  const source = name?.trim() || email?.split("@")?.[0] || "Account User";

  return (
    source
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AU"
  );
};

export default function PublicProfileScreen() {
  const { user, updateUser, logout } = usePublicAuth();
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspending, setSuspending] = useState(false);
  const plan = managePlans(user?.subscription);
  const PlanIcon = plan.icon;
  const initials = useMemo(
    () => getInitials(user?.name, user?.email),
    [user?.email, user?.name],
  );

  const displayName = user?.name || "Account user";
  const displayEmail = user?.email || "No email added";
  const displayPhone = user?.phone || "No phone added";
  const displayRole = user?.role || "user";

  const handleProfileImageUpload = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await publicApiClient.post(
        "/user/profile-image",
        formData,
      );

      updateUser({ profileImage: response.data?.profileImage || null });
      toast.success("Profile photo updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleDeleteProfileImage = async () => {
    setRemoving(true);

    try {
      await publicApiClient.delete("/user/profile-image");
      updateUser({ profileImage: null });
      toast.success("Profile photo removed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed.");
    } finally {
      setRemoving(false);
    }
  };

  const downloadAccountData = async () => {
    const response = await publicApiClient.get("/users/me/export");
    const blob = new Blob([JSON.stringify(response.data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "anganstay-account-data.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleSuspendAccount = async (downloadFirst: boolean) => {
    setSuspending(true);

    try {
      if (downloadFirst) {
        await downloadAccountData();
      }

      await publicApiClient.delete("/users/delete");
      toast.success(
        "Your account deletion has been scheduled. Log in within 30 days to restore it.",
      );
      setShowSuspendModal(false);
      await logout();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete your account right now.",
      );
    } finally {
      setSuspending(false);
    }
  };

  return (
    <PublicAccountShell
      title="Profile settings"
      description="Manage your public account identity, profile photo, and account access details."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="overflow-hidden rounded-[2rem] border border-[var(--admin-border)] bg-white shadow-[0_24px_70px_-56px_var(--admin-shadow)]">
          <div className="border-b border-[var(--admin-border)] bg-[linear-gradient(135deg,rgba(56,86,255,0.08),rgba(255,255,255,1),rgba(16,185,129,0.06))] px-5 py-6 sm:px-7 sm:py-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative h-28 w-28 shrink-0">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_22px_55px_-38px_var(--admin-shadow)]">
                  {user?.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.profileImage}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-[var(--admin-primary-soft)] text-3xl font-black text-[var(--admin-primary)]">
                      {initials}
                    </span>
                  )}
                </div>

                <span className="absolute -bottom-2 -right-2 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white bg-[var(--admin-primary)] text-white shadow-[0_16px_30px_-20px_var(--admin-primary)]">
                  <Camera className="h-4 w-4" />
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[var(--admin-primary)] shadow-sm">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Public account
                  </span>

                  <span className="inline-flex rounded-full border border-[var(--admin-border)] bg-white/75 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--admin-muted)]">
                    {displayRole}
                  </span>
                </div>

                <h2 className="mt-4 truncate text-3xl font-black tracking-tight text-[var(--admin-text)]">
                  {displayName}
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--admin-muted)]">
                  This is the profile information connected to your AnganStay
                  account. Your photo helps hosts, agents, and support identify
                  your account more easily.
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 py-6 sm:px-7">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-[var(--admin-border)] bg-[var(--admin-background)] px-4 py-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--admin-primary)]">
                    <Mail className="h-5 w-5" />
                  </span>

                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--admin-muted)]">
                      Email address
                    </p>
                    <p className="mt-1 truncate text-sm font-bold text-[var(--admin-text)]">
                      {displayEmail}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-[var(--admin-border)] bg-[var(--admin-background)] px-4 py-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--admin-primary)]">
                    <Phone className="h-5 w-5" />
                  </span>

                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--admin-muted)]">
                      Phone number
                    </p>
                    <p className="mt-1 truncate text-sm font-bold text-[var(--admin-text)]">
                      {displayPhone}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[1.75rem] border border-[var(--admin-border)] bg-white p-4 shadow-[0_18px_45px_-40px_var(--admin-shadow)] sm:p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-black tracking-tight text-[var(--admin-text)]">
                    Profile photo
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--admin-muted)]">
                    Upload a clear photo for your public account. Supported
                    formats include JPG, PNG, WEBP, HEIC, and HEIF.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[var(--admin-primary)] px-4 py-3.5 text-sm font-bold text-white shadow-[0_18px_34px_-26px_var(--admin-primary)] transition hover:opacity-95">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UploadCloud className="h-4 w-4" />
                  )}
                  {uploading ? "Uploading..." : "Upload new photo"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                    className="hidden"
                    onChange={handleProfileImageUpload}
                  />
                </label>

                <button
                  type="button"
                  disabled={removing || !user?.profileImage}
                  onClick={() => void handleDeleteProfileImage()}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm font-bold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {removing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Remove photo
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-[2rem] border border-[var(--admin-border)] bg-white p-5 shadow-[0_24px_70px_-58px_var(--admin-shadow)]">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
              </span>

              <div>
                <h3 className="text-lg font-black text-[var(--admin-text)]">
                  Account status
                </h3>
                <p className="mt-1 text-sm leading-6 text-[var(--admin-muted)]">
                  Your account is connected to AnganStay&apos;s public rental
                  marketplace.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-[1.35rem] border border-[var(--admin-border)] bg-[var(--admin-background)] px-4 py-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--admin-primary)]">
                    <BadgeCheck className="h-4 w-4" />
                  </span>

                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--admin-muted)]">
                      Access type
                    </p>

                    <p className="mt-1 text-sm font-semibold capitalize text-[var(--admin-text)]">
                      {displayRole}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[var(--admin-muted)]">
                      Your current account access level.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.35rem] border border-[var(--admin-border)] bg-[var(--admin-background)] px-4 py-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--admin-primary)]">
                    <PlanIcon className="h-4 w-4" />
                  </span>

                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--admin-muted)]">
                      Plan
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[var(--admin-text)]">
                      {plan.label}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[var(--admin-muted)]">
                      {plan.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--admin-border)] bg-white p-5 shadow-[0_24px_70px_-58px_var(--admin-shadow)]">
            <h3 className="text-lg font-black text-[var(--admin-text)]">
              What you can manage
            </h3>

            <div className="mt-4 space-y-3">
              {[
                "Upload and manage your property listings.",
                "Save properties to your favorites.",
                "Update your profile photo anytime.",
                "Contact support for account or listing help.",
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--admin-primary)]" />
                  <p className="text-sm leading-6 text-[var(--admin-muted)]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-white px-4 py-3.5 text-sm font-bold text-[var(--admin-text)] transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>

          <button
            type="button"
            onClick={() => setShowSuspendModal(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm font-bold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </button>
        </aside>
      </div>

      {showSuspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] border border-[var(--admin-border)] bg-white p-6 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.6)]">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
                <Trash2 className="h-5 w-5" />
              </span>

              <div>
                <h3 className="text-xl font-black tracking-tight text-[var(--admin-text)]">
                  Delete account
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--admin-muted)]">
                  AnganStay will hide your account for 30 days before permanent
                  deletion. You can download your data before deleting your
                  account. Log in any time within the 30-day period to restore
                  your account and listings. After 30 days, your account and all
                  associated data will be permanently deleted.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <button
                type="button"
                disabled={suspending}
                onClick={() => void handleSuspendAccount(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--admin-primary)] px-4 py-3.5 text-sm font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {suspending && <Loader2 className="h-4 w-4 animate-spin" />}
                Download my data before deleting
              </button>

              <button
                type="button"
                disabled={suspending}
                onClick={() => void handleSuspendAccount(false)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Delete account only
              </button>

              <button
                type="button"
                disabled={suspending}
                onClick={() => setShowSuspendModal(false)}
                className="inline-flex items-center justify-center rounded-2xl border border-[var(--admin-border)] bg-white px-4 py-3.5 text-sm font-bold text-[var(--admin-text)] transition hover:bg-[var(--admin-background)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </PublicAccountShell>
  );
}
