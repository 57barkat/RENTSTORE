import type { Metadata } from "next";
import Link from "next/link";

import { BRAND_NAME } from "@/app/lib/property-utils";
import { toAbsoluteUrl } from "@/app/lib/site-config";

export const metadata: Metadata = {
  title: `Terms of Service | ${BRAND_NAME}`,
  description:
    "Read the AnganStay Terms of Service for property listing, discovery, reporting, verification, and user safety rules.",
  alternates: {
    canonical: toAbsoluteUrl("/terms"),
  },
};

const termSections = [
  {
    title: "1. What AnganStay Does",
    body: [
      "AnganStay is a property listing and discovery platform. We help users browse, publish, and manage rental property listings.",
      "AnganStay is not a party to rental agreements between users.",
      "Unless explicitly stated in writing, AnganStay is not a landlord, tenant, broker, real estate agency, escrow provider, legal advisor, payment processor, or property owner.",
    ],
  },
  {
    title: "2. Independent Verification",
    body: [
      "Users must independently verify property ownership, condition, rent, documents, location, owner or agent identity, and availability.",
      "AnganStay does not guarantee rental availability, property condition, owner identity, legal title, location accuracy, rent amount, safety, suitability, or deal completion.",
      "Verification badges mean limited platform checks only. They do not guarantee ownership, legal title, condition, availability, user character, or transaction safety.",
    ],
  },
  {
    title: "3. Listing Owner Responsibilities",
    body: [
      "Listing owners are responsible for listing accuracy, legality, availability, photos, rent, contact details, and authorization to advertise the property.",
      "Users must not upload stolen images, false property details, fake contact information, misleading prices, or listings they are not authorized to publish.",
      "Fake, misleading, illegal, duplicate, abusive, offensive, stolen-image, or spam listings can be removed.",
    ],
  },
  {
    title: "4. Platform Moderation",
    body: [
      "AnganStay may review, reject, edit, hide, or remove listings.",
      "AnganStay may restrict access or suspend accounts when listings, reports, user behavior, or platform safety concerns justify action.",
      "Users can report listings, users, suspicious activity, and disputes.",
    ],
  },
  {
    title: "5. Payments and Agreements",
    body: [
      "Payments, deposits, token money, rent, commissions, inspection fees, and rental agreements are handled directly between users unless AnganStay explicitly states otherwise.",
      "Users should not send token money, deposits, rent, or sensitive documents before verifying the property and the person they are dealing with.",
      "AnganStay is not responsible for payments or agreements made directly between users.",
    ],
  },
  {
    title: "6. Visits and Offline Safety",
    body: [
      "Users are responsible for their own safety during property visits and offline meetings.",
      "Meet in safe locations, verify identity and authority, inspect documents, and avoid sharing sensitive documents before you are confident the property and person are legitimate.",
    ],
  },
  {
    title: "7. Governing Law and Contact",
    body: [
      "These Terms are governed by the laws of Pakistan.",
      "For questions about these Terms, contact AnganStay at contact@anganstay.com.",
    ],
  },
] as const;

export default function TermsPage() {
  return (
    <main className="bg-[var(--admin-background)]">
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="rounded-[2rem] border border-[var(--admin-border)] bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--admin-primary)]">
            Legal
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[var(--admin-text)] sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--admin-muted)] sm:text-base">
            These Terms explain how AnganStay works as a property listing and
            discovery platform, what users are responsible for, and how reports
            and moderation may be handled.
          </p>
          <p className="mt-3 text-sm font-semibold text-[var(--admin-muted)]">
            Effective date: May 13, 2026
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {termSections.map((section) => (
            <section
              key={section.title}
              className="rounded-[1.5rem] border border-[var(--admin-border)] bg-white p-5 shadow-sm sm:p-6"
            >
              <h2 className="text-xl font-black text-[var(--admin-text)]">
                {section.title}
              </h2>
              <div className="mt-4 space-y-3">
                {section.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-sm leading-7 text-[var(--admin-muted)]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-[var(--admin-border)] bg-white p-5 text-sm leading-7 text-[var(--admin-muted)] shadow-sm sm:p-6">
          Need help or want to report suspicious activity? Contact{" "}
          <a
            href="mailto:contact@anganstay.com"
            className="font-bold text-[var(--admin-primary)]"
          >
            contact@anganstay.com
          </a>{" "}
          or use the{" "}
          <Link
            href="/report-problem"
            className="font-bold text-[var(--admin-primary)]"
          >
            Report a Problem
          </Link>{" "}
          page.
        </div>
      </section>
    </main>
  );
}
