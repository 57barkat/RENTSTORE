import Link from "next/link";
import {
  ArrowRight,
  Building2,
  ChevronDown,
  Facebook,
  Heart,
  HelpCircle,
  Home,
  Info,
  Instagram,
  Linkedin,
  LinkIcon,
  Mail,
  MapPin,
  Twitter,
} from "lucide-react";

import { PUBLIC_CATEGORY_LINKS } from "@/app/lib/route-constants";

const footerGroups = [
  {
    title: "Quick Links",
    icon: LinkIcon,
    links: [
      { href: "/", label: "Rent" },
      ...PUBLIC_CATEGORY_LINKS.map((item) => ({
        href: item.href,
        label: item.label,
      })),
      { href: "/upload-property", label: "List a Property" },
      { href: "/account/favorites", label: "Favorites" },
    ],
  },
  {
    title: "Listings",
    icon: Home,
    links: [
      { href: "/houses", label: "Houses" },
      { href: "/apartments", label: "Flats for Rent" },
      { href: "/houses", label: "Portions for Rent" },
      { href: "/hostels", label: "Rooms for Rent" },
      { href: "/commercial", label: "Commercial" },
      { href: "/popular-locations", label: "Popular Locations" },
    ],
  },
  {
    title: "Support",
    icon: HelpCircle,
    links: [
      { href: "/contact", label: "Help Center" },
      { href: "/safety", label: "Safety Tips" },
      { href: "/guides", label: "Guides & Tips" },
      { href: "/faq", label: "FAQ" },
      { href: "/report-problem", label: "Report a Problem" },
    ],
  },
  {
    title: "Company",
    icon: Building2,
    links: [
      { href: "/about", label: "About Us" },
      { href: "/how-it-works", label: "How it Works" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/contact", label: "Contact Us" },
    ],
  },
] as const;

const socialLinks = [
  { href: "#", label: "Facebook", icon: Facebook },
  { href: "#", label: "Instagram", icon: Instagram },
  { href: "#", label: "Twitter", icon: Twitter },
  { href: "#", label: "LinkedIn", icon: Linkedin },
] as const;

const bottomLinks = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/contact", label: "Contact" },
  { href: "/report-problem", label: "Report a Problem" },
] as const;

export default function PublicFooter() {
  return (
    <footer className="bg-white">
      <div className="hidden border-t border-[var(--admin-border)] md:block">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[1.25fr_0.75fr_0.75fr_0.75fr_1.15fr]">
            <div>
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--admin-primary)] text-white shadow-[0_16px_30px_-20px_var(--admin-primary)]">
                  <Building2 size={22} />
                </span>

                <span>
                  <span className="block text-xl font-black leading-none text-[var(--admin-text)]">
                    AnganStay
                  </span>
                  <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
                    Verified Rentals
                  </span>
                </span>
              </Link>

              <p className="mt-5 max-w-sm text-sm leading-7 text-[var(--admin-muted)]">
                Islamabad&apos;s trusted platform for verified rental
                properties. Find your perfect angan with confidence.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {socialLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      aria-label={item.label}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--admin-border)] bg-white text-[var(--admin-muted)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
                    >
                      <Icon size={15} />
                    </Link>
                  );
                })}
              </div>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-[var(--admin-primary-soft)] px-3 py-2 text-xs font-semibold text-[var(--admin-primary)]">
                <MapPin size={14} />
                Islamabad, Pakistan
              </div>
            </div>

            {footerGroups
              .filter((group) => group.title !== "Listings")
              .map((group) => (
                <div key={group.title}>
                  <h2 className="text-sm font-black text-[var(--admin-text)]">
                    {group.title}
                  </h2>

                  <nav className="mt-4 grid gap-3">
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
              <h2 className="text-sm font-black text-[var(--admin-text)]">
                Newsletter
              </h2>

              <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--admin-muted)]">
                Get the latest listings and rental updates.
              </p>

              <form className="mt-4 flex overflow-hidden rounded-xl border border-[var(--admin-border)] bg-white shadow-sm">
                <label htmlFor="footer-email-desktop" className="sr-only">
                  Email address
                </label>

                <div className="relative min-w-0 flex-1">
                  <Mail
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-placeholder)]"
                  />

                  <input
                    id="footer-email-desktop"
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
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-[var(--admin-border)] bg-[#F8FAFC] p-4">
            <div className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--admin-primary)]">
                <Info size={18} />
              </span>

              <div>
                <h3 className="text-sm font-black text-[var(--admin-text)]">
                  Disclaimer
                </h3>

                <p className="mt-1 text-xs leading-6 text-[var(--admin-muted)]">
                  AnganStay is a property listing platform only. Users must
                  verify rent, ownership, availability, condition, documents,
                  and payment terms before making any decision.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-9 grid gap-4 border-t border-[var(--admin-border)] pt-6 text-xs text-[var(--admin-muted)] md:grid-cols-[1fr_auto_1fr] md:items-center">
            <p>&copy; 2026 AnganStay. All rights reserved.</p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 md:justify-center">
              {bottomLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-semibold hover:text-[var(--admin-primary)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <p className="flex items-center gap-1 md:justify-end">
              Made with{" "}
              <Heart size={13} className="fill-red-500 text-red-500" /> in
              Pakistan
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 md:hidden">
        <div className="mx-auto w-full max-w-[440px] overflow-hidden rounded-[1.5rem] border border-[var(--admin-border)] bg-white shadow-[0_24px_70px_-55px_rgba(15,23,42,0.35)]">
          <div className="p-6">
            <Link href="/" className="inline-flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--admin-primary)] text-white shadow-[0_16px_30px_-20px_var(--admin-primary)]">
                <Building2 size={27} />
              </span>

              <span>
                <span className="block text-2xl font-black leading-none text-[var(--admin-text)]">
                  AnganStay
                </span>
                <span className="mt-2 block text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--admin-muted)]">
                  Verified Rentals
                </span>
              </span>
            </Link>

            <p className="mt-6 text-base font-medium leading-8 text-[var(--admin-muted)]">
              Islamabad&apos;s trusted platform for verified rental properties.
              Find your next home with confidence.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {socialLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-label={item.label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--admin-border)] bg-white text-[var(--admin-muted)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
                  >
                    <Icon size={17} />
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-[var(--admin-border)] bg-[var(--admin-primary-soft)] px-4 py-3 text-sm font-black text-[var(--admin-primary)]">
              <MapPin size={18} />
              Islamabad, Pakistan
            </div>
          </div>

          <div className="border-t border-[var(--admin-border)]">
            {footerGroups.map((group) => {
              const Icon = group.icon;

              return (
                <details
                  key={group.title}
                  className="group border-b border-[var(--admin-border)]"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4">
                    <span className="flex items-center gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
                        <Icon size={19} />
                      </span>

                      <span className="text-base font-black text-[var(--admin-text)]">
                        {group.title}
                      </span>
                    </span>

                    <ChevronDown
                      size={19}
                      className="text-[var(--admin-muted)] transition group-open:rotate-180"
                    />
                  </summary>

                  <nav className="grid gap-3 px-20 pb-5">
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
                </details>
              );
            })}
          </div>

          <div className="p-6">
            <h2 className="text-xl font-black text-[var(--admin-text)]">
              Newsletter
            </h2>

            <p className="mt-3 text-base font-medium leading-7 text-[var(--admin-muted)]">
              Subscribe to get the latest updates, new listings, and helpful
              tips.
            </p>

            <form className="mt-5 flex overflow-hidden rounded-xl border border-[var(--admin-border)] bg-white shadow-sm">
              <label htmlFor="footer-email-mobile" className="sr-only">
                Email address
              </label>

              <div className="relative min-w-0 flex-1">
                <Mail
                  size={19}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--admin-placeholder)]"
                />

                <input
                  id="footer-email-mobile"
                  type="email"
                  placeholder="Enter your email"
                  className="h-14 w-full bg-transparent px-4 pl-12 text-base font-medium text-[var(--admin-text)] outline-none placeholder:text-[var(--admin-placeholder)]"
                />
              </div>

              <button
                type="submit"
                aria-label="Subscribe"
                className="flex h-14 w-16 items-center justify-center bg-[var(--admin-primary)] text-white transition hover:opacity-95"
              >
                <ArrowRight size={22} />
              </button>
            </form>

            <p className="mt-4 text-sm font-medium leading-6 text-[var(--admin-muted)]">
              We respect your privacy. Unsubscribe anytime.
            </p>

            <div className="mt-6 rounded-2xl border border-[var(--admin-border)] bg-[#F8FAFC] p-4">
              <div className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
                  <Info size={22} />
                </span>

                <div>
                  <h3 className="text-base font-black text-[var(--admin-text)]">
                    Disclaimer
                  </h3>

                  <p className="mt-2 text-sm font-medium leading-7 text-[var(--admin-muted)]">
                    AnganStay is a property listing platform only. Users must
                    verify rent, ownership, availability, condition, documents,
                    and payment terms before making any decision.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--admin-border)] px-6 py-6 text-center">
            <p className="text-sm font-medium text-[var(--admin-muted)]">
              &copy; 2026 AnganStay. All rights reserved.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-medium text-[var(--admin-muted)]">
              {bottomLinks.map((link, index) => (
                <span
                  key={link.href}
                  className="inline-flex items-center gap-4"
                >
                  <Link
                    href={link.href}
                    className="transition hover:text-[var(--admin-primary)]"
                  >
                    {link.label}
                  </Link>

                  {index < bottomLinks.length - 1 && (
                    <span className="text-[var(--admin-border)]">|</span>
                  )}
                </span>
              ))}
            </div>

            <p className="mt-4 flex items-center justify-center gap-1 text-sm font-medium text-[var(--admin-muted)]">
              Made with{" "}
              <Heart size={14} className="fill-red-500 text-red-500" /> in
              Pakistan
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
