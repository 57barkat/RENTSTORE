"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Building2,
  ChevronDown,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import type { PropertyCategory } from "@/app/lib/property-types";
import { DEFAULT_PROPERTY_IMAGE } from "@/app/lib/property-utils";

const DEFAULT_MARKET_CITY = "Islamabad";

const CATEGORY_OPTIONS: Array<{
  label: string;
  value: PropertyCategory;
  href: string;
}> = [
  { label: "All Properties", value: "property", href: "/property" },
  { label: "Hostels", value: "hostel", href: "/hostels" },
  { label: "Apartments", value: "apartment", href: "/apartments" },
  { label: "Houses", value: "home", href: "/houses" },
  { label: "Shops", value: "shop", href: "/shops" },
  { label: "Offices", value: "office", href: "/offices" },
];

const HERO_TRUST_ITEMS = [
  {
    title: "Verified Listings",
    description: "Platform-reviewed rental listings",
    icon: ShieldCheck,
  },
  {
    title: "Islamabad Focused",
    description: "Areas, sectors, and landmarks built around Islamabad",
    icon: MapPin,
  },
  {
    title: "Smart Filters",
    description: "Search by budget, property type, and amenities",
    icon: SlidersHorizontal,
  },
  {
    title: "Managed Marketplace",
    description: "Cleaner browsing with fewer low-quality listings",
    icon: Building2,
  },
];

const parsePositiveNumber = (value: string): number | "" => {
  const trimmed = value.trim();

  if (!trimmed) return "";

  const parsed = Number(trimmed);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : "";
};

const hasRangeError = (minValue: string, maxValue: string) => {
  const min = parsePositiveNumber(minValue);
  const max = parsePositiveNumber(maxValue);

  return typeof min === "number" && typeof max === "number" && min > max;
};

export default function LandingHero() {
  const router = useRouter();
  const [category, setCategory] = useState<PropertyCategory>("property");
  const [locationInput, setLocationInput] = useState("");
  const [minRentInput, setMinRentInput] = useState("");
  const [maxRentInput, setMaxRentInput] = useState("");
  const rangeHasError = hasRangeError(minRentInput, maxRentInput);

  const handleSubmit = (event: { preventDefault(): void }) => {
    event.preventDefault();

    if (rangeHasError) return;

    const selectedCategory =
      CATEGORY_OPTIONS.find((option) => option.value === category) ||
      CATEGORY_OPTIONS[0];
    const params = new URLSearchParams();
    const minRent = parsePositiveNumber(minRentInput);
    const maxRent = parsePositiveNumber(maxRentInput);
    const location = locationInput.trim();

    params.set("city", DEFAULT_MARKET_CITY);

    if (location) {
      params.set("location", location);
    }

    if (typeof minRent === "number") {
      params.set("minRent", String(minRent));
    }

    if (typeof maxRent === "number") {
      params.set("maxRent", String(maxRent));
    }

    router.push(`${selectedCategory.href}?${params.toString()}`);
  };

  return (
    <section className="relative isolate overflow-hidden bg-[#07143f]">
      <div className="absolute inset-0">
        <Image
          src={DEFAULT_PROPERTY_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-42 [object-position:center_43%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(3,7,34,0.88)_0%,rgba(18,24,86,0.76)_42%,rgba(0,119,128,0.58)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_18%,rgba(52,211,153,0.18),transparent_34%),radial-gradient(circle_at_20%_82%,rgba(245,158,11,0.10),transparent_30%)]" />
        <div className="absolute inset-0 bg-black/12" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#07143f]/70 to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-[500px] max-w-[1500px] flex-col items-center px-4 pb-10 pt-8 text-center sm:min-h-[520px] sm:px-6 sm:pb-12 lg:min-h-[520px] lg:px-8 lg:pb-10 lg:pt-12">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/22 bg-white/10 px-3.5 py-1.5 text-[10px] uppercase tracking-[0.14em] text-white shadow-sm backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-[#34D399]" />
          Find Your Angan
        </span>

        <h1 className="mt-4 max-w-4xl text-[2.35rem] font-extrabold leading-[1.08] tracking-[-0.045em] text-white sm:text-[3.25rem] lg:text-[4.1rem]">
          Find your <span className="text-[#34D399]">Angan</span>
          <span className="block">in {DEFAULT_MARKET_CITY}</span>
        </h1>

        <p className="mt-4 max-w-3xl text-sm font-normal leading-6 text-white/86 sm:text-[18px] sm:leading-7">
          Cleaner rental discovery for hostels, family homes, shops, and offices
          across active Islamabad areas.
        </p>

        <div className="mt-6 hidden w-full max-w-5xl items-start justify-center gap-6 text-left md:grid md:grid-cols-4">
          {HERO_TRUST_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex min-w-0 items-start gap-2.5 text-white"
              >
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#34D399]">
                  <Icon className="h-4 w-4" />
                </span>

                <span className="min-w-0">
                  <span className="block text-[13px] font-bold leading-4 text-white">
                    {item.title}
                  </span>

                  <span className="mt-1 block text-[11px] font-normal leading-4 text-white/70">
                    {item.description}
                  </span>
                </span>
              </div>
            );
          })}
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 w-full max-w-[1120px] rounded-[1.5rem] border border-white bg-white p-2.5 text-left shadow-[0_36px_105px_-38px_rgba(2,6,23,0.86)] ring-1 ring-white/20"
        >
          <div className="grid gap-2 md:grid-cols-[minmax(170px,220px)_minmax(0,1fr)_minmax(240px,330px)_auto]">
            <label className="relative min-w-0">
              <span className="sr-only">Property category</span>
              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as PropertyCategory)
                }
                className="h-12 w-full appearance-none rounded-2xl border border-[var(--admin-border)] bg-white px-4 pr-10 text-sm font-semibold text-[var(--admin-text)] outline-none transition hover:border-[var(--admin-primary)] focus:border-[var(--admin-primary)] focus:ring-4 focus:ring-[var(--admin-primary)]/10"
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
            </label>

            <label className="flex min-h-12 min-w-0 items-center gap-3 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface,#fff)] px-4 transition focus-within:border-[var(--admin-primary)] focus-within:ring-4 focus-within:ring-[var(--admin-primary)]/10">
              <MapPin className="h-4 w-4 shrink-0 text-[var(--admin-primary)]" />
              <span className="hidden shrink-0 border-r border-[var(--admin-border)] pr-3 text-sm font-semibold text-[var(--admin-text)] sm:inline-flex">
                {DEFAULT_MARKET_CITY}
              </span>
              <input
                value={locationInput}
                onChange={(event) => setLocationInput(event.target.value)}
                placeholder="Search sector, university, or landmark"
                className="min-w-0 flex-1 bg-transparent text-sm text-[var(--admin-text)] outline-none placeholder:text-[var(--admin-muted)]"
              />
            </label>

            <div
              className={`grid min-h-12 min-w-0 grid-cols-2 rounded-2xl border bg-white transition focus-within:ring-4 ${
                rangeHasError
                  ? "border-red-500 focus-within:ring-red-500/10"
                  : "border-[var(--admin-border)] focus-within:border-[var(--admin-primary)] focus-within:ring-[var(--admin-primary)]/10"
              }`}
            >
              <input
                value={minRentInput}
                onChange={(event) => setMinRentInput(event.target.value)}
                inputMode="numeric"
                type="number"
                min={0}
                placeholder="Min price"
                aria-invalid={rangeHasError}
                aria-describedby={
                  rangeHasError ? "landing-price-range-error" : undefined
                }
                className={`min-w-0 rounded-l-2xl bg-transparent px-4 text-sm outline-none ${
                  rangeHasError
                    ? "text-red-700 placeholder:text-red-400"
                    : "text-[var(--admin-text)] placeholder:text-[var(--admin-muted)]"
                }`}
              />
              <input
                value={maxRentInput}
                onChange={(event) => setMaxRentInput(event.target.value)}
                inputMode="numeric"
                type="number"
                min={0}
                placeholder="Max price"
                aria-invalid={rangeHasError}
                aria-describedby={
                  rangeHasError ? "landing-price-range-error" : undefined
                }
                className={`min-w-0 rounded-r-2xl border-l bg-transparent px-4 text-sm outline-none ${
                  rangeHasError
                    ? "border-red-300 text-red-700 placeholder:text-red-400"
                    : "border-[var(--admin-border)] text-[var(--admin-text)] placeholder:text-[var(--admin-muted)]"
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={rangeHasError}
              className="inline-flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-2xl bg-[var(--admin-primary)] px-5 text-sm font-bold text-white shadow-[0_20px_38px_-22px_rgba(0,0,128,0.9)] transition hover:-translate-y-0.5 hover:bg-[#00006c] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50 sm:px-7"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>

          {rangeHasError && (
            <p
              id="landing-price-range-error"
              className="mt-2 px-2 text-xs font-medium text-red-600"
            >
              Enter a valid price range.
            </p>
          )}
        </form>

        <p className="mt-3 max-w-[1120px] text-center text-xs font-medium text-white/78">
          No broker spam. Platform-reviewed listings only.
        </p>
      </div>
    </section>
  );
}
