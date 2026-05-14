import type { Metadata } from "next";
import Link from "next/link";

import { BRAND_NAME } from "@/app/lib/property-utils";
import { toAbsoluteUrl } from "@/app/lib/site-config";

export const metadata: Metadata = {
  title: `Safety Tips | ${BRAND_NAME}`,
  description:
    "Rental safety tips for verifying listings, owners, documents, visits, payments, and suspicious activity on AnganStay.",
  alternates: {
    canonical: toAbsoluteUrl("/safety"),
  },
};

const safetyTips = [
  {
    title: "Verify before paying",
    body: "Do not send token money, rent, deposits, or inspection fees before seeing the property and confirming the person has authority to rent it.",
  },
  {
    title: "Check documents",
    body: "Ask for ownership, authorization, CNIC, agency details where relevant, and rental agreement terms. Match names and property details carefully.",
  },
  {
    title: "Visit safely",
    body: "Visit during daylight where possible, tell someone where you are going, and avoid carrying unnecessary cash or sensitive documents.",
  },
  {
    title: "Watch for pressure",
    body: "Be careful if someone rushes payment, refuses verification, changes prices suddenly, or asks you to move the conversation to unsafe channels.",
  },
  {
    title: "Report suspicious listings",
    body: "Use the Report Listing button or Report a Problem page when photos, rent, location, identity, or payment requests look suspicious.",
  },
] as const;

export default function SafetyPage() {
  return (
    <main className="bg-[var(--admin-background)]">
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="rounded-[2rem] border border-[var(--admin-border)] bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--admin-primary)]">
            Trust and safety
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[var(--admin-text)] sm:text-5xl">
            Safety Tips
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--admin-muted)] sm:text-base">
            These tips can reduce rental risk, but users remain responsible for
            independently verifying every property, person, payment request, and
            agreement.
          </p>
        </div>

        <div className="mt-6 grid gap-4">
          {safetyTips.map((tip) => (
            <section
              key={tip.title}
              className="rounded-[1.5rem] border border-[var(--admin-border)] bg-white p-5 shadow-sm sm:p-6"
            >
              <h2 className="text-xl font-black text-[var(--admin-text)]">
                {tip.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--admin-muted)]">
                {tip.body}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-rose-200 bg-rose-50 p-5 text-sm font-semibold leading-7 text-rose-800 sm:p-6">
          If you believe you are in immediate danger, contact local emergency or
          law enforcement services first.
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/report-problem"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[var(--admin-primary)] px-5 text-sm font-black text-white transition hover:opacity-95"
          >
            Report a problem
          </Link>
          <Link
            href="/faq"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[var(--admin-border)] bg-white px-5 text-sm font-black text-[var(--admin-primary)] transition hover:border-[var(--admin-primary)]"
          >
            Read FAQ
          </Link>
        </div>
      </section>
    </main>
  );
}
