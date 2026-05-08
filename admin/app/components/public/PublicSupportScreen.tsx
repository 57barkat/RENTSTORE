"use client";

import Link from "next/link";
import {
  Headphones,
  HelpCircle,
  LockKeyhole,
  Megaphone,
  MessageCircle,
  UploadCloud,
} from "lucide-react";

import PublicAccountShell from "@/app/components/public/PublicAccountShell";
import {
  PublicAccountPanel,
  PublicAccountSectionHeading,
} from "@/app/components/public/PublicAccountPieces";

const supportOptions = [
  {
    title: "Listing help",
    description: "Get help with listing details, visibility, moderation, or edits.",
    icon: HelpCircle,
  },
  {
    title: "Upload issue",
    description: "Resolve photo, draft, validation, or submission problems.",
    icon: UploadCloud,
  },
  {
    title: "Account access",
    description: "Recover access or fix sign-in and verification issues.",
    icon: LockKeyhole,
  },
  {
    title: "Promotion or visibility",
    description: "Ask about featured, boosted, or search visibility behavior.",
    icon: Megaphone,
  },
  {
    title: "General question",
    description: "Contact support for anything else about your AnganStay account.",
    icon: MessageCircle,
  },
];

export default function PublicSupportScreen() {
  return (
    <PublicAccountShell
      title="24/7 Support"
      description="Need help? Our support team can help with listings, uploads, account access, verification, and promotions."
    >
      <PublicAccountPanel className="p-5 sm:p-6">
        <PublicAccountSectionHeading
          eyebrow="Support"
          title="How can we help?"
          description="Choose the area that best matches your issue. For now, support requests open through email while the in-app flow is being prepared."
          action={
            <Link
              href="mailto:support@anganstay.com"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--admin-primary)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_-24px_var(--admin-primary)] transition hover:opacity-95"
            >
              <Headphones className="h-4 w-4" />
              Contact support
            </Link>
          }
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {supportOptions.map((option) => {
            const Icon = option.icon;

            return (
              <div
                key={option.title}
                className="rounded-[1.35rem] border border-[var(--admin-border)] bg-[var(--admin-background)] p-4"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="mt-4 text-base font-black text-[var(--admin-text)]">
                  {option.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--admin-muted)]">
                  {option.description}
                </p>
              </div>
            );
          })}
        </div>
      </PublicAccountPanel>
    </PublicAccountShell>
  );
}
