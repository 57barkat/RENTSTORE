import type { Metadata } from "next";

import { BRAND_NAME } from "@/app/lib/property-utils";
import { toAbsoluteUrl } from "@/app/lib/site-config";

export const metadata: Metadata = {
  title: `Privacy Policy | ${BRAND_NAME}`,
  description:
    "Learn how AnganStay collects, uses, protects, retains, and deletes account and listing data.",
  alternates: {
    canonical: toAbsoluteUrl("/privacy"),
  },
};

const privacySections = [
  {
    title: "Information We Collect",
    body: "We collect account details, contact details, verification status, profile information, listing content, property photos, reports, favorites, and account activity needed to operate AnganStay.",
  },
  {
    title: "How We Use Information",
    body: "We use information to create and secure accounts, publish and manage listings, support search, maps, messaging, favorites, moderation, support requests, and abuse reports.",
  },
  {
    title: "Security",
    body: "Passwords are stored using secure hashing. Sensitive data is protected using appropriate technical and organizational safeguards.",
  },
  {
    title: "Cookies",
    body: "We use functional cookies to maintain login sessions and user preferences. We currently do not use third-party tracking cookies. If this changes, we will update this policy.",
  },
  {
    title: "Advertising and Promotions",
    body: "We may display promoted listings or advertising in the future. If we do, we will update this policy and explain what data is used.",
  },
  {
    title: "Data Retention",
    body: "We retain account and listing data while your account is active. Deleted listings may be retained temporarily for security, fraud prevention, dispute handling, or legal compliance.",
  },
  {
    title: "Deletion Requests",
    body: "To request account or data deletion, contact us at contact@anganstay.com from your registered email.",
  },
  {
    title: "Contact",
    body: "For privacy questions, contact AnganStay at contact@anganstay.com.",
  },
] as const;

export default function PrivacyPage() {
  return (
    <main className="bg-[var(--admin-background)]">
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="rounded-[2rem] border border-[var(--admin-border)] bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--admin-primary)]">
            Privacy
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[var(--admin-text)] sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--admin-muted)] sm:text-base">
            This policy explains the main categories of data AnganStay uses to
            run accounts, listings, reporting, moderation, and support.
          </p>
          <p className="mt-3 text-sm font-semibold text-[var(--admin-muted)]">
            Effective date: May 13, 2026
          </p>
        </div>

        <div className="mt-6 grid gap-4">
          {privacySections.map((section) => (
            <section
              key={section.title}
              className="rounded-[1.5rem] border border-[var(--admin-border)] bg-white p-5 shadow-sm sm:p-6"
            >
              <h2 className="text-xl font-black text-[var(--admin-text)]">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--admin-muted)]">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
