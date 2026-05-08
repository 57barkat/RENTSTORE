"use client";

import { ChangeEvent, useState } from "react";
import { Loader2, Trash2, UploadCloud, UserCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";

import PublicAccountShell from "@/app/components/public/PublicAccountShell";
import { usePublicAuth } from "@/app/components/public/PublicAuthProvider";
import publicApiClient from "@/app/lib/public-api-client";

export default function PublicProfileScreen() {
  const { user, updateUser, logout } = usePublicAuth();
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  const handleProfileImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await publicApiClient.post("/user/profile-image", formData);
      updateUser({ profileImage: response.data?.profileImage || null });
      toast.success("Profile image updated.");
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
      toast.success("Profile image removed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed.");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <PublicAccountShell
      title="Profile"
      description="Your role, contact details, and profile image come from the live backend account. Text profile editing stays hidden until a public update endpoint exists."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-[2rem] border border-[var(--admin-border)] bg-white p-6 shadow-[0_16px_36px_-30px_var(--admin-shadow)]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface)]">
              {user?.profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserCircle2 className="h-12 w-12 text-[var(--admin-muted)]" />
              )}
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-black tracking-tight text-[var(--admin-text)]">
                {user?.name || "Account user"}
              </h2>
              <p className="mt-1 text-sm text-[var(--admin-muted)]">
                {user?.email || "No email available"}
              </p>
              <p className="mt-1 text-sm text-[var(--admin-muted)]">
                {user?.phone || "No phone available"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-[var(--admin-primary)]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--admin-primary)]">
                  {user?.role || "user"}
                </span>
                {user?.subscription ? (
                  <span className="rounded-full bg-[var(--admin-surface)] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--admin-muted)]">
                    {user.subscription}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-3 text-sm font-semibold text-[var(--admin-text)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              {uploading ? "Uploading..." : "Upload profile image"}
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
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--admin-danger)] transition hover:border-[var(--admin-danger)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {removing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Remove profile image
            </button>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-[2rem] border border-[var(--admin-border)] bg-white p-6 shadow-[0_16px_36px_-30px_var(--admin-shadow)]">
            <h3 className="text-lg font-bold text-[var(--admin-text)]">
              Account notes
            </h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--admin-muted)]">
              <li>Public web access is separate from admin access.</li>
              <li>Signup from this surface only supports user and agent roles.</li>
              <li>Profile text editing is intentionally hidden until a public update endpoint exists.</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex w-full items-center justify-center rounded-2xl border border-[var(--admin-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--admin-text)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
          >
            Logout
          </button>
        </aside>
      </div>
    </PublicAccountShell>
  );
}
