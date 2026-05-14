"use client";

import Link from "next/link";

import { useReportedProperties } from "@/app/components/public/ReportedPropertiesProvider";

interface ReportedPropertyGateProps {
  propertyId: string;
  children: React.ReactNode;
}

export default function ReportedPropertyGate({
  propertyId,
  children,
}: ReportedPropertyGateProps) {
  const { isPropertyHidden } = useReportedProperties();

  if (!isPropertyHidden(propertyId)) {
    return children;
  }

  return (
    <main className="min-h-screen bg-[var(--admin-background)]">
      <section className="mx-auto flex min-h-[60vh] max-w-3xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full rounded-[2rem] border border-[var(--admin-border)] bg-white p-6 text-center shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--admin-primary)]">
            Reported listing
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[var(--admin-text)]">
            This property is hidden for you
          </h1>
          <p className="mt-4 text-sm leading-7 text-[var(--admin-muted)]">
            You reported this listing, so AnganStay hides it from your account.
            If you just submitted the report, use the Undo Report option before
            the timer expires to make it visible again.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-[var(--admin-primary)] px-5 text-sm font-black text-white transition hover:opacity-95"
          >
            Browse other listings
          </Link>
        </div>
      </section>
    </main>
  );
}
