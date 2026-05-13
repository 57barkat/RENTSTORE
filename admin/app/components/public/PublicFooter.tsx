import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Facebook,
  Heart,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  ShieldCheck,
  Twitter,
} from "lucide-react";

import { PUBLIC_CATEGORY_LINKS } from "@/app/lib/route-constants";

const footerGroups = [
  {
    title: "Quick Links",
    links: [
      { href: "/", label: "Rent" },
      ...PUBLIC_CATEGORY_LINKS.map((item) => ({
        href: item.href,
        label: item.label,
      })),
      { href: "/list-property", label: "List a Property" },
      { href: "/favorites", label: "Favorites" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/how-it-works", label: "How it Works" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/contact", label: "Contact Us" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/contact", label: "Help Center" },
      { href: "/safety", label: "Safety Tips" },
      { href: "/guides", label: "Guides & Tips" },
      { href: "/faq", label: "FAQ" },
      { href: "/report-problem", label: "Report a Problem" },
    ],
  },
] as const;

export default function PublicFooter() {
  return (
    <footer className="border-t border-[var(--admin-border)] bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 py-12 lg:grid-cols-[1.25fr_0.75fr_0.75fr_0.75fr_1.2fr]">
          <div className="space-y-5">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--admin-primary)] text-white shadow-[0_18px_35px_-22px_var(--admin-primary)]">
                <Building2 size={22} />
              </span>

              <span>
                <span className="block text-xl font-black leading-none tracking-tight text-[var(--admin-text)]">
                  AnganStay
                </span>
                <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
                  Verified Rentals
                </span>
              </span>
            </Link>

            <p className="max-w-sm text-sm leading-7 text-[var(--admin-muted)]">
              Pakistan&apos;s trusted platform for verified rental properties.
              Find your perfect stay with confidence.
            </p>

            <div className="flex flex-wrap gap-2">
              <Link
                href="#"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--admin-border)] bg-white text-[var(--admin-muted)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
              >
                <Facebook size={15} />
              </Link>

              <Link
                href="#"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--admin-border)] bg-white text-[var(--admin-muted)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
              >
                <Instagram size={15} />
              </Link>

              <Link
                href="#"
                aria-label="Twitter"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--admin-border)] bg-white text-[var(--admin-muted)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
              >
                <Twitter size={15} />
              </Link>

              <Link
                href="#"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--admin-border)] bg-white text-[var(--admin-muted)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
              >
                <Linkedin size={15} />
              </Link>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-[var(--admin-primary-soft)] px-3 py-2 text-xs font-semibold text-[var(--admin-primary)]">
              <MapPin size={14} />
              Islamabad & Rawalpindi now
            </div>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h2 className="mb-4 text-sm font-black text-[var(--admin-text)]">
                {group.title}
              </h2>

              <nav className="grid gap-3">
                {group.links.map((link) => (
                  <Link
                    key={`${group.title}-${link.href}-${link.label}`}
                    href={link.href}
                    className="w-fit text-sm font-medium text-[var(--admin-muted)] transition hover:text-[var(--admin-primary)]"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}

          <div>
            <h2 className="mb-4 text-sm font-black text-[var(--admin-text)]">
              Newsletter
            </h2>

            <p className="mb-4 max-w-sm text-sm leading-7 text-[var(--admin-muted)]">
              Get the latest listings and rental updates.
            </p>

            <form className="flex overflow-hidden rounded-xl border border-[var(--admin-border)] bg-white shadow-sm">
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>

              <div className="relative min-w-0 flex-1">
                <Mail
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-placeholder)]"
                />

                <input
                  id="footer-email"
                  type="email"
                  placeholder="Enter your email"
                  className="h-12 w-full bg-transparent px-3 pl-9 text-sm text-[var(--admin-text)] outline-none placeholder:text-[var(--admin-placeholder)]"
                />
              </div>

              <button
                type="submit"
                aria-label="Subscribe"
                className="flex h-12 w-12 items-center justify-center bg-[var(--admin-primary)] text-white transition hover:opacity-95"
              >
                <ArrowRight size={18} />
              </button>
            </form>

            <p className="mt-3 text-xs leading-5 text-[var(--admin-muted)]">
              We respect your privacy. Unsubscribe anytime.
            </p>

            <div className="mt-5 rounded-2xl border border-[var(--admin-border)] bg-[#F8FAFC] p-4">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
                  <ShieldCheck size={20} />
                </div>

                <p className="text-xs leading-6 text-[var(--admin-muted)]">
                  AnganStay is a property listing platform only. Users must
                  verify rent, ownership, availability, condition, documents,
                  and payment terms before making any decision.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 border-t border-[var(--admin-border)] py-6 text-xs text-[var(--admin-muted)] md:grid-cols-[1fr_auto_1fr] md:items-center">
          <p>&copy; 2026 AnganStay. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 md:justify-center">
            <Link
              href="/terms"
              className="font-semibold transition hover:text-[var(--admin-primary)]"
            >
              Terms
            </Link>

            <Link
              href="/privacy"
              className="font-semibold transition hover:text-[var(--admin-primary)]"
            >
              Privacy
            </Link>

            <Link
              href="/contact"
              className="font-semibold transition hover:text-[var(--admin-primary)]"
            >
              Contact
            </Link>

            <Link
              href="/report-problem"
              className="font-semibold transition hover:text-[var(--admin-primary)]"
            >
              Report a Problem
            </Link>
          </div>

          <p className="flex items-center gap-1 md:justify-end">
            Made with <Heart size={13} className="fill-red-500 text-red-500" />{" "}
            in Pakistan
          </p>
        </div>
      </div>
    </footer>
  );
}
