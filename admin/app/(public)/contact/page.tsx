import type { Metadata } from "next";
import Link from "next/link";

import { BRAND_NAME } from "@/app/lib/property-utils";
import { toAbsoluteUrl } from "@/app/lib/site-config";

export const metadata: Metadata = {
  title: `Contact | ${BRAND_NAME}`,
  description:
    "Contact AnganStay for account, listing, privacy, reporting, or support questions.",
  alternates: {
    canonical: toAbsoluteUrl("/contact"),
  },
};

export default function ContactPage() {
  return (
    <main className="bg-[var(--admin-background)]">
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="rounded-[2rem] border border-[var(--admin-border)] bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--admin-primary)]">
            Contact
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[var(--admin-text)] sm:text-5xl">
            Contact AnganStay
          </h1>
          <p className="mt-4 text-sm leading-7 text-[var(--admin-muted)] sm:text-base">
            For account help, listing questions, privacy requests, suspicious
            activity, or general support, email us from the address connected to
            your AnganStay account.
          </p>

          <a
            href="mailto:contact@anganstay.com"
            className="mt-6 inline-flex rounded-2xl bg-[var(--admin-primary)] px-5 py-3 text-sm font-black text-white transition hover:opacity-95"
          >
            contact@anganstay.com
          </a>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm font-semibold leading-6 text-amber-800">
            Do not send token money, rent, deposits, or sensitive documents
            before independently verifying the property and the person you are
            dealing with.
          </div>

          <p className="mt-5 text-sm leading-7 text-[var(--admin-muted)]">
            To report a specific listing, open that listing and use the Report
            Listing button. For other issues, use{" "}
            <Link
              href="/report-problem"
              className="font-bold text-[var(--admin-primary)]"
            >
              Report a Problem
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
