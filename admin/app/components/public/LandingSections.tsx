import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  Home,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export interface ActiveAreaCardItem {
  area: string;
  activeListingCount: number;
  href: string;
  contextLine?: string;
  categoryHints: string[];
}

const intentPaths: Array<{
  title: string;
  copy: string;
  cta: string;
  href: string;
  icon: LucideIcon;
}> = [
  {
    title: "Near university",
    copy: "Find hostels, rooms, and shared spaces around active student areas.",
    cta: "Explore student stays",
    href: "/hostels?city=Islamabad",
    icon: GraduationCap,
  },
  {
    title: "Family-ready places",
    copy: "Browse portions, apartments, and houses suited for everyday living.",
    cta: "Explore family homes",
    href: "/property?city=Islamabad&familyFriendly=true",
    icon: Home,
  },
  {
    title: "Business spaces",
    copy: "Discover shops and offices in active commercial pockets.",
    cta: "Explore commercial spaces",
    href: "/shops?city=Islamabad",
    icon: BriefcaseBusiness,
  },
];

const trustItems: Array<{
  title: string;
  copy: string;
  icon: LucideIcon;
}> = [
  {
    title: "Cleaner listings",
    copy: "We reduce spam and low-quality posts before they reach discovery.",
    icon: ShieldCheck,
  },
  {
    title: "Area-first search",
    copy: "Search by sector, university, landmark, or budget.",
    icon: Search,
  },
  {
    title: "Built around local property needs",
    copy: "Hostels, homes, shops, and offices in one focused experience.",
    icon: Building2,
  },
];

export function IntentPathsSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-5 flex flex-col gap-2 sm:mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--admin-primary)]">
          Start with what matters
        </p>
        <h2 className="max-w-3xl text-2xl font-black tracking-tight text-[var(--admin-text)] sm:text-3xl">
          Choose the path that matches your day
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {intentPaths.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.href}
              className="group flex min-h-[220px] flex-col rounded-lg border border-[var(--admin-border)] bg-white p-5 shadow-[0_18px_48px_-42px_var(--admin-shadow)] transition hover:-translate-y-0.5 hover:border-[color:color-mix(in_srgb,var(--admin-primary)_32%,var(--admin-border))] hover:shadow-[0_24px_60px_-45px_var(--admin-shadow)]"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
                <Icon className="h-5 w-5" />
              </span>

              <h3 className="mt-5 text-xl font-black text-[var(--admin-text)]">
                {item.title}
              </h3>

              <p className="mt-3 flex-1 text-sm leading-7 text-[var(--admin-muted)]">
                {item.copy}
              </p>

              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--admin-primary)] transition group-hover:gap-3">
                {item.cta}
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function ActiveAreasSection({
  items,
}: {
  items: ActiveAreaCardItem[];
}) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--admin-primary)]">
            Popular areas right now
          </p>
          <h2 className="mt-2 max-w-3xl text-2xl font-black tracking-tight text-[var(--admin-text)] sm:text-3xl">
            Active areas people are checking
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--admin-muted)]">
            A short view of live listing activity, kept intentionally compact.
          </p>
        </div>

        <Link
          href="/popular-locations"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--admin-border)] bg-white px-4 py-2.5 text-sm font-bold text-[var(--admin-primary)] shadow-sm transition hover:border-[var(--admin-primary)] hover:bg-[var(--admin-primary-soft)]"
        >
          View all active areas
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <Link
              key={`${item.area}-${item.href}`}
              href={item.href}
              className={`group rounded-lg border border-[var(--admin-border)] bg-white p-5 shadow-[0_18px_48px_-42px_var(--admin-shadow)] transition hover:-translate-y-0.5 hover:border-[color:color-mix(in_srgb,var(--admin-primary)_32%,var(--admin-border))] hover:shadow-[0_24px_60px_-45px_var(--admin-shadow)] ${
                index >= 4 ? "hidden sm:block" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="truncate text-xl font-black text-[var(--admin-text)] group-hover:text-[var(--admin-primary)]">
                    {item.area}
                  </h3>
                  <p className="mt-1 text-sm font-bold text-[var(--admin-muted)]">
                    {item.activeListingCount} active{" "}
                    {item.activeListingCount === 1 ? "listing" : "listings"}
                  </p>
                </div>

                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
                  <MapPin className="h-5 w-5" />
                </span>
              </div>

              {item.contextLine ? (
                <p className="mt-4 text-sm leading-6 text-[var(--admin-muted)]">
                  {item.contextLine}
                </p>
              ) : null}

              {item.categoryHints.length > 0 ? (
                <p className="mt-3 text-xs font-bold text-[var(--admin-primary)]">
                  {item.categoryHints.join(" | ")}
                </p>
              ) : null}

              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--admin-primary)] transition group-hover:gap-3">
                Explore {item.area}
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-[var(--admin-border)] bg-white px-5 py-8 text-sm leading-7 text-[var(--admin-muted)]">
          Area activity will appear here as more listings go live.
        </div>
      )}
    </section>
  );
}

export function TrustSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-5 sm:mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--admin-primary)]">
          Why AnganStay
        </p>
        <h2 className="mt-2 max-w-3xl text-2xl font-black tracking-tight text-[var(--admin-text)] sm:text-3xl">
          A cleaner way to start property search
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {trustItems.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.title}
              className="rounded-lg border border-[var(--admin-border)] bg-white p-5 shadow-[0_18px_48px_-42px_var(--admin-shadow)]"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
                <Icon className="h-5 w-5" />
              </span>

              <h3 className="mt-5 text-lg font-black text-[var(--admin-text)]">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-[var(--admin-muted)]">
                {item.copy}
              </p>
            </article>
          );
        })}
      </div>

      <p className="mt-4 text-xs leading-6 text-[var(--admin-muted)]">
        Platform-reviewed listings use limited checks for quality and obvious
        spam. Review ownership, condition, availability, price, and payment
        terms before committing.{" "}
        <Link
          href="/safety"
          className="font-bold text-[var(--admin-primary)] hover:underline"
        >
          Learn more
        </Link>
      </p>
    </section>
  );
}

export function OwnerCTA() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div className="grid gap-6 rounded-lg border border-[var(--admin-border)] bg-[linear-gradient(135deg,var(--admin-primary-soft),var(--admin-background),var(--admin-secondary-soft))] p-6 shadow-[0_24px_70px_-56px_var(--admin-shadow)] sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--admin-primary)] shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Owners and managers
          </span>

          <h2 className="mt-4 text-2xl font-black tracking-tight text-[var(--admin-text)] sm:text-3xl">
            Have a place to list?
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--admin-muted)] sm:text-base">
            Add your hostel, room, apartment, house, shop, or office to
            AnganStay.
          </p>
        </div>

        <Link
          href="/upload-property"
          className="inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-full bg-[var(--admin-primary)] px-6 text-sm font-bold text-white shadow-[0_20px_42px_-26px_var(--admin-primary)] transition hover:-translate-y-0.5 hover:opacity-95"
        >
          Post Property
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
