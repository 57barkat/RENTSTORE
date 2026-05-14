import type { Metadata } from "next";
import Link from "next/link";

import { BRAND_NAME } from "@/app/lib/property-utils";
import { toAbsoluteUrl } from "@/app/lib/site-config";

export const metadata: Metadata = {
  title: `How it Works | ${BRAND_NAME}`,
  description:
    "See how AnganStay helps users search rentals, review listing details, contact listing owners, and publish properties.",
  alternates: {
    canonical: toAbsoluteUrl("/how-it-works"),
  },
};

const renterSteps = [
  "Search by city, area, category, rent, size, rooms, amenities, and listing type.",
  "Review photos, rent, location details, availability signals, and verification notes.",
  "Contact the owner or agent, then verify documents, identity, and property condition before any payment.",
] as const;

const ownerSteps = [
  "Create an account and add accurate property details, clear photos, rent, location, and contact information.",
  "Submit the listing for platform review where required.",
  "Keep availability, pricing, and contact details updated so renters do not waste time.",
] as const;

function StepList({ title, steps }: { title: string; steps: readonly string[] }) {
  return (
    <section className="rounded-[1.5rem] border border-[var(--admin-border)] bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-black text-[var(--admin-text)]">{title}</h2>
      <div className="mt-4 grid gap-3">
        {steps.map((step, index) => (
          <div key={step} className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--admin-primary-soft)] text-xs font-black text-[var(--admin-primary)]">
              {index + 1}
            </span>
            <p className="text-sm leading-7 text-[var(--admin-muted)]">
              {step}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HowItWorksPage() {
  return (
    <main className="bg-[var(--admin-background)]">
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="rounded-[2rem] border border-[var(--admin-border)] bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--admin-primary)]">
            Process
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[var(--admin-text)] sm:text-5xl">
            How AnganStay Works
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--admin-muted)] sm:text-base">
            AnganStay connects property seekers with rental listings and gives
            listing owners a structured way to publish property information.
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <StepList title="For renters" steps={renterSteps} />
          <StepList title="For owners and agents" steps={ownerSteps} />
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-[var(--admin-border)] bg-white p-5 text-sm leading-7 text-[var(--admin-muted)] shadow-sm sm:p-6">
          Payments, deposits, token money, commissions, and rental agreements
          are handled directly between users unless AnganStay explicitly states
          otherwise in writing.
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[var(--admin-primary)] px-5 text-sm font-black text-white transition hover:opacity-95"
          >
            Start searching
          </Link>
          <Link
            href="/safety"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[var(--admin-border)] bg-white px-5 text-sm font-black text-[var(--admin-primary)] transition hover:border-[var(--admin-primary)]"
          >
            Read safety tips
          </Link>
        </div>
      </section>
    </main>
  );
}
