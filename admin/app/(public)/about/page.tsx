import type { Metadata } from "next";
import Link from "next/link";

import { BRAND_NAME } from "@/app/lib/property-utils";
import { toAbsoluteUrl } from "@/app/lib/site-config";

export const metadata: Metadata = {
  title: `About Us | ${BRAND_NAME}`,
  description:
    "Learn about AnganStay, a rental property discovery platform focused on verified listings, safer search, and clearer rental decisions.",
  alternates: {
    canonical: toAbsoluteUrl("/about"),
  },
};

const values = [
  {
    title: "Clear listings",
    body: "We organize rental information so people can compare rent, location, photos, amenities, and contact details without digging through messy posts.",
  },
  {
    title: "Verification signals",
    body: "Verification badges and moderation checks help users understand which listings have passed limited platform review, while still encouraging independent verification.",
  },
  {
    title: "Local focus",
    body: "AnganStay is currently focused on Islamabad and Rawalpindi so the search experience, locations, and rental categories can stay practical and relevant.",
  },
] as const;

export default function AboutPage() {
  return (
    <main className="bg-[var(--admin-background)]">
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="rounded-[2rem] border border-[var(--admin-border)] bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--admin-primary)]">
            About
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[var(--admin-text)] sm:text-5xl">
            About AnganStay
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--admin-muted)] sm:text-base">
            AnganStay helps renters, owners, and agents publish and discover
            rental listings with structured information, useful search filters,
            and platform moderation.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {values.map((item) => (
            <section
              key={item.title}
              className="rounded-[1.5rem] border border-[var(--admin-border)] bg-white p-5 shadow-sm sm:p-6"
            >
              <h2 className="text-lg font-black text-[var(--admin-text)]">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--admin-muted)]">
                {item.body}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-sm font-semibold leading-7 text-amber-800 sm:p-6">
          AnganStay is a listing platform only. Users should independently
          verify ownership, documents, rent, availability, condition, and payment
          terms before making any rental decision.
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[var(--admin-primary)] px-5 text-sm font-black text-white transition hover:opacity-95"
          >
            Browse rentals
          </Link>
          <Link
            href="/upload-property"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[var(--admin-border)] bg-white px-5 text-sm font-black text-[var(--admin-primary)] transition hover:border-[var(--admin-primary)]"
          >
            List a property
          </Link>
        </div>
      </section>
    </main>
  );
}
