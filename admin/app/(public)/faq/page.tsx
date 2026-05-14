import type { Metadata } from "next";
import Link from "next/link";

import { BRAND_NAME } from "@/app/lib/property-utils";
import { toAbsoluteUrl } from "@/app/lib/site-config";

export const metadata: Metadata = {
  title: `FAQ | ${BRAND_NAME}`,
  description:
    "Frequently asked questions about searching, listing, verification, safety, payments, reporting, and account support on AnganStay.",
  alternates: {
    canonical: toAbsoluteUrl("/faq"),
  },
};

const faqs = [
  {
    question: "Does AnganStay own or manage the properties?",
    answer:
      "No. AnganStay is a property listing and discovery platform. Rental agreements, visits, payments, and negotiations happen directly between users unless AnganStay explicitly states otherwise.",
  },
  {
    question: "What does a verified listing mean?",
    answer:
      "Verification means limited platform checks only. It does not guarantee ownership, legal title, condition, availability, safety, or transaction success.",
  },
  {
    question: "Should I pay before visiting a property?",
    answer:
      "Avoid paying token money, deposits, rent, or inspection fees before independently verifying the property, documents, owner or agent authority, and rental terms.",
  },
  {
    question: "How do I report a suspicious listing?",
    answer:
      "Use the Report Listing button on the property page when available, or use Report a Problem for account, privacy, safety, or general platform concerns.",
  },
  {
    question: "How do I list my property?",
    answer:
      "Create or log in to your account, open Upload Property, add accurate details and clear photos, then submit the listing for review where required.",
  },
] as const;

export default function FaqPage() {
  return (
    <main className="bg-[var(--admin-background)]">
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="rounded-[2rem] border border-[var(--admin-border)] bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--admin-primary)]">
            Help
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[var(--admin-text)] sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--admin-muted)] sm:text-base">
            Answers to common questions about searching, listing, verification,
            safety, payments, and account support.
          </p>
        </div>

        <div className="mt-6 grid gap-4">
          {faqs.map((faq) => (
            <section
              key={faq.question}
              className="rounded-[1.5rem] border border-[var(--admin-border)] bg-white p-5 shadow-sm sm:p-6"
            >
              <h2 className="text-xl font-black text-[var(--admin-text)]">
                {faq.question}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--admin-muted)]">
                {faq.answer}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-[var(--admin-border)] bg-white p-5 text-sm leading-7 text-[var(--admin-muted)] shadow-sm sm:p-6">
          Still need help? Contact{" "}
          <a
            href="mailto:contact@anganstay.com"
            className="font-bold text-[var(--admin-primary)]"
          >
            contact@anganstay.com
          </a>{" "}
          or visit{" "}
          <Link
            href="/contact"
            className="font-bold text-[var(--admin-primary)]"
          >
            Contact Us
          </Link>
          .
        </div>
      </section>
    </main>
  );
}
