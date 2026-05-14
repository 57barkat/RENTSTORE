import type { Metadata } from "next";
import Link from "next/link";

import { BRAND_NAME } from "@/app/lib/property-utils";
import { toAbsoluteUrl } from "@/app/lib/site-config";

export const metadata: Metadata = {
  title: `Guides and Tips | ${BRAND_NAME}`,
  description:
    "Practical rental guides for searching, comparing, visiting, listing, and verifying rental properties on AnganStay.",
  alternates: {
    canonical: toAbsoluteUrl("/guides"),
  },
};

const guides = [
  {
    title: "Before you shortlist",
    body: "Compare total monthly cost, location, transport, utilities, security, maintenance, parking, furnishing, and house rules before arranging visits.",
  },
  {
    title: "During a visit",
    body: "Check water, electricity, ventilation, internet options, locks, appliances, building access, nearby facilities, and any damage already present.",
  },
  {
    title: "Before signing",
    body: "Confirm rent, deposit, notice period, maintenance responsibility, included bills, late fees, renewal terms, and inventory in writing.",
  },
  {
    title: "For listing owners",
    body: "Use recent photos, accurate rent, exact area, clear availability, real amenities, and responsive contact details to build trust with renters.",
  },
] as const;

export default function GuidesPage() {
  return (
    <main className="bg-[var(--admin-background)]">
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="rounded-[2rem] border border-[var(--admin-border)] bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--admin-primary)]">
            Guides
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[var(--admin-text)] sm:text-5xl">
            Guides and Tips
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--admin-muted)] sm:text-base">
            Use these quick rental guides to compare listings more carefully,
            prepare for property visits, and publish better property details.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {guides.map((guide) => (
            <section
              key={guide.title}
              className="rounded-[1.5rem] border border-[var(--admin-border)] bg-white p-5 shadow-sm sm:p-6"
            >
              <h2 className="text-xl font-black text-[var(--admin-text)]">
                {guide.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--admin-muted)]">
                {guide.body}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[var(--admin-primary)] px-5 text-sm font-black text-white transition hover:opacity-95"
          >
            Browse listings
          </Link>
          <Link
            href="/upload-property"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[var(--admin-border)] bg-white px-5 text-sm font-black text-[var(--admin-primary)] transition hover:border-[var(--admin-primary)]"
          >
            Add a listing
          </Link>
        </div>
      </section>
    </main>
  );
}
