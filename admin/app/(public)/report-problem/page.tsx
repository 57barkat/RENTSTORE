import type { Metadata } from "next";
import Link from "next/link";

import { BRAND_NAME } from "@/app/lib/property-utils";
import { toAbsoluteUrl } from "@/app/lib/site-config";

export const metadata: Metadata = {
  title: `Report a Problem | ${BRAND_NAME}`,
  description:
    "Report suspicious listings, account issues, safety concerns, disputes, or platform problems to AnganStay.",
  alternates: {
    canonical: toAbsoluteUrl("/report-problem"),
  },
};

const reportOptions = [
  "Suspicious listing or fake property",
  "Wrong price, location, photos, or availability",
  "Suspicious owner, agent, or contact request",
  "Offensive, illegal, abusive, duplicate, or spam content",
  "Account, privacy, deletion, or support issue",
] as const;

export default function ReportProblemPage() {
  return (
    <main className="bg-[var(--admin-background)]">
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="rounded-[2rem] border border-[var(--admin-border)] bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--admin-primary)]">
            Trust and safety
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[var(--admin-text)] sm:text-5xl">
            Report a Problem
          </h1>
          <p className="mt-4 text-sm leading-7 text-[var(--admin-muted)] sm:text-base">
            For a specific property, use the Report Listing button on the
            listing page so the correct property ID is sent to our review queue.
            For other concerns, contact us by email.
          </p>

          <div className="mt-6 grid gap-3">
            {reportOptions.map((option) => (
              <div
                key={option}
                className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-background)] px-4 py-3 text-sm font-semibold text-[var(--admin-text)]"
              >
                {option}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[var(--admin-primary)] px-5 text-sm font-black text-white transition hover:opacity-95"
            >
              Browse listings
            </Link>
            <a
              href="mailto:contact@anganstay.com"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[var(--admin-border)] bg-white px-5 text-sm font-black text-[var(--admin-primary)] transition hover:border-[var(--admin-primary)]"
            >
              contact@anganstay.com
            </a>
          </div>

          <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm font-semibold leading-6 text-amber-800">
            AnganStay is a property listing platform only. Please verify rent,
            ownership, availability, documents, and payment terms before making
            any decision or payment.
          </p>
        </div>
      </section>
    </main>
  );
}
