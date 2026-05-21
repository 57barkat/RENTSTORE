import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  Home,
  Layers3,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";

import type {
  PropertyCategory,
  SearchIntent,
} from "@/app/lib/property-types";

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
  label: string;
  icon: LucideIcon;
  accentIcon: LucideIcon;
  searchProfile: {
    intent: SearchIntent;
    propertyTypes: PropertyCategory[];
    tags: string[];
    futureFacets?: string[];
  };
}> = [
  {
    title: "Near university",
    copy: "Hostels, rooms, shared spaces, and small apartments around active student areas.",
    cta: "Explore student-friendly places",
    label: "Student path",
    icon: GraduationCap,
    accentIcon: Users,
    searchProfile: {
      intent: "near-university",
      propertyTypes: ["hostel", "apartment", "home"],
      tags: ["student-friendly", "rooms", "shared-spaces", "small-apartments"],
    },
  },
  {
    title: "Family-ready places",
    copy: "Browse portions, apartments, and houses suited for everyday living.",
    cta: "Explore family homes",
    label: "Family path",
    icon: Home,
    accentIcon: BadgeCheck,
    searchProfile: {
      intent: "family-ready",
      propertyTypes: ["apartment", "home"],
      tags: ["family-ready", "portions", "everyday-living"],
    },
  },
  {
    title: "Business spaces",
    copy: "Discover shops and offices in active commercial pockets.",
    cta: "Explore commercial spaces",
    label: "Business path",
    icon: BriefcaseBusiness,
    accentIcon: Store,
    searchProfile: {
      intent: "business-spaces",
      propertyTypes: ["shop", "office"],
      tags: ["commercial", "shops", "offices"],
      futureFacets: [
        "parking",
        "main-road",
        "frontage",
        "plaza",
        "washroom",
        "floor",
        "shutter",
        "furnished",
        "electricity-backup",
      ],
    },
  },
];

const trustItems: Array<{
  title: string;
  copy: string;
  icon: LucideIcon;
}> = [
  {
    title: "Less listing noise",
    copy: "We reduce duplicate, spammy, and low-quality posts before discovery.",
    icon: ShieldCheck,
  },
  {
    title: "Search the way people actually look",
    copy: "Find places by sector, university, landmark, budget, or property need.",
    icon: Search,
  },
  {
    title: "Built for real local use",
    copy: "From hostels and family homes to shops and offices in one focused experience.",
    icon: Building2,
  },
];

const buildIntentHref = (
  searchProfile: (typeof intentPaths)[number]["searchProfile"],
) => {
  const params = new URLSearchParams();

  params.set("city", "Islamabad");
  params.set("intent", searchProfile.intent);
  params.set("types", searchProfile.propertyTypes.join(","));
  params.set("tags", searchProfile.tags.join(","));

  if (searchProfile.intent === "family-ready") {
    params.set("familyFriendly", "true");
  }

  return `/property?${params.toString()}`;
};

export function IntentPathsSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-5 flex flex-col gap-2 sm:mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--admin-primary)]">
          Start with what matters
        </p>
        <h2 className="max-w-3xl text-2xl font-black tracking-tight text-[var(--admin-text)] sm:text-3xl">
          Start from the situation, then refine the listing results
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {intentPaths.map((item) => {
          const Icon = item.icon;
          const AccentIcon = item.accentIcon;
          const href = buildIntentHref(item.searchProfile);

          return (
            <Link
              key={item.title}
              href={href}
              className="group flex min-h-[230px] flex-col overflow-hidden rounded-lg border border-[var(--admin-border)] bg-white shadow-[0_18px_48px_-42px_var(--admin-shadow)] transition hover:-translate-y-0.5 hover:border-[color:color-mix(in_srgb,var(--admin-primary)_32%,var(--admin-border))] hover:shadow-[0_24px_60px_-45px_var(--admin-shadow)]"
            >
              <div className="flex items-start justify-between gap-4 border-b border-[var(--admin-border)] bg-[var(--admin-background)] px-5 py-4">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
                  <Icon className="h-5 w-5" />
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--admin-border)] bg-white px-3 py-1.5 text-[11px] font-bold text-[var(--admin-muted)]">
                  <AccentIcon className="h-3.5 w-3.5 text-[var(--admin-primary)]" />
                  {item.label}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-xl font-black text-[var(--admin-text)]">
                  {item.title}
                </h3>

                <p className="mt-3 flex-1 text-sm leading-7 text-[var(--admin-muted)]">
                  {item.copy}
                </p>

                <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-[var(--admin-primary-soft)] px-3.5 py-2 text-sm font-bold text-[var(--admin-primary)] transition group-hover:gap-3 group-hover:bg-[var(--admin-primary)] group-hover:text-white">
                  {item.cta}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
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
            Ranked from live listing activity today. More signals can plug in
            as search and inquiry data becomes available.
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
            <AreaDiscoveryCard
              key={`${item.area}-${item.href}`}
              item={item}
              index={index}
            />
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
          A cleaner way to find property
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
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="h-px flex-1 bg-[var(--admin-border)]" />
              </div>

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

      <p className="mt-5 text-xs text-[var(--admin-muted)]">
        Listing review covers quality and spam signals only.{" "}
        <Link
          href="/safety"
          className="font-bold text-[var(--admin-primary)] hover:underline"
        >
          Learn what this means
        </Link>
      </p>
    </section>
  );
}

export function OwnerCTA() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div className="overflow-hidden rounded-lg border border-[var(--admin-border)] bg-white shadow-[0_24px_70px_-56px_var(--admin-shadow)]">
        <div className="grid gap-6 border-l-4 border-[var(--admin-primary)] bg-[linear-gradient(135deg,var(--admin-primary-soft),var(--admin-background),var(--admin-secondary-soft))] p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,auto)] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--admin-primary)] shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            For owners and managers
          </span>

          <h2 className="mt-4 text-2xl font-black tracking-tight text-[var(--admin-text)] sm:text-3xl">
            Have a place to list?
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--admin-muted)] sm:text-base">
            Reach people already searching by area, budget, and property need.
            List a hostel, room, apartment, house, shop, or office.
          </p>
        </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <div className="grid w-full gap-2 text-sm text-[var(--admin-muted)] sm:grid-cols-3 lg:w-[360px]">
              {["Area-led demand", "Direct property need", "Managed discovery"].map(
                (label) => (
                  <span
                    key={label}
                    className="rounded-lg border border-[var(--admin-border)] bg-white px-3 py-2 text-center text-xs font-bold"
                  >
                    {label}
                  </span>
                ),
              )}
            </div>

            <Link
              href="/upload-property"
              className="inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-full bg-[var(--admin-primary)] px-6 text-sm font-bold text-white shadow-[0_20px_42px_-26px_var(--admin-primary)] transition hover:-translate-y-0.5 hover:opacity-95"
            >
              Post Property
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function AreaDiscoveryCard({
  item,
  index,
}: {
  item: ActiveAreaCardItem;
  index: number;
}) {
  const visibleOnMobile = index < 4;

  return (
    <Link
      href={item.href}
      className={`group flex min-h-[230px] flex-col overflow-hidden rounded-lg border border-[var(--admin-border)] bg-white shadow-[0_18px_48px_-42px_var(--admin-shadow)] transition hover:-translate-y-0.5 hover:border-[color:color-mix(in_srgb,var(--admin-primary)_32%,var(--admin-border))] hover:shadow-[0_24px_60px_-45px_var(--admin-shadow)] ${
        visibleOnMobile ? "" : "hidden sm:flex"
      }`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-[var(--admin-border)] bg-[var(--admin-background)] px-5 py-4">
        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--admin-primary-soft)] px-3 py-1.5 text-xs font-bold text-[var(--admin-primary)]">
          <Activity className="h-3.5 w-3.5" />
          Live activity
        </span>
        <span className="text-xs font-bold text-[var(--admin-muted)]">
          #{index + 1}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-2xl font-black text-[var(--admin-text)] group-hover:text-[var(--admin-primary)]">
              {item.area}
            </h3>
            <p className="mt-1 text-sm font-bold text-[var(--admin-muted)]">
              {item.activeListingCount} active{" "}
              {item.activeListingCount === 1 ? "listing" : "listings"}
            </p>
          </div>

          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[var(--admin-border)] bg-white text-[var(--admin-primary)] shadow-sm">
            <MapPin className="h-5 w-5" />
          </span>
        </div>

        {item.contextLine ? (
          <p className="mt-4 text-sm leading-6 text-[var(--admin-muted)]">
            {item.contextLine}
          </p>
        ) : (
          <p className="mt-4 text-sm leading-6 text-[var(--admin-muted)]">
            Active rental inventory in this area.
          </p>
        )}

        {item.categoryHints.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {item.categoryHints.map((hint) => (
              <span
                key={hint}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--admin-border)] bg-[var(--admin-background)] px-3 py-1.5 text-xs font-bold text-[var(--admin-muted)]"
              >
                <Layers3 className="h-3 w-3 text-[var(--admin-primary)]" />
                {hint}
              </span>
            ))}
          </div>
        ) : null}

        <span className="mt-auto inline-flex w-fit items-center gap-2 pt-5 text-sm font-bold text-[var(--admin-primary)] transition group-hover:gap-3">
          Explore {item.area}
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
