"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { usePublicAuth } from "@/app/components/public/PublicAuthProvider";

export default function PublicListingTrustBanner({
  total,
}: {
  total: number;
}) {
  const { isAuthenticated, isLoading } = usePublicAuth();
  const href = isAuthenticated
    ? "/upload-property"
    : "/account/login?redirect=%2Fupload-property";

  return (
    <section className="rounded-[1.5rem] border border-[#cbd7ff] bg-[linear-gradient(90deg,#f5f7ff,#ffffff,#eefdf9)] px-5 py-4 shadow-[0_18px_45px_-38px_rgba(0,31,143,0.45)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--admin-primary)] shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-base font-black text-[var(--admin-text)]">
              Verified listing checks
            </h2>
            <p className="mt-1 text-sm leading-6 text-[var(--admin-muted)]">
              Every visible listing is approved before discovery. Verification
              means limited platform checks only and does not guarantee
              ownership, condition, availability, or transaction safety. {total}{" "}
              live results are connected to AnganStay inventory.
            </p>
          </div>
        </div>

        <Link
          href={href}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--admin-border)] bg-white px-5 text-sm font-black text-[var(--admin-primary)] shadow-sm transition hover:border-[var(--admin-primary)] hover:bg-[var(--admin-primary)] hover:text-white"
        >
          {isLoading
            ? "List Your Property"
            : isAuthenticated
              ? "List Your Property"
              : "Sign in to List"}
        </Link>
      </div>
    </section>
  );
}
