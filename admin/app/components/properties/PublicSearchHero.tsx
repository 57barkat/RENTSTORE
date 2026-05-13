"use client";

import Image from "next/image";
import { useMemo, useRef } from "react";
import { MapPin, Search, SlidersHorizontal, Sparkles } from "lucide-react";

import { useProperties } from "@/app/hooks/usePublicProperties";
import type {
  PropertyCategory,
  PropertySearchFilters,
} from "@/app/lib/property-types";
import { DEFAULT_PROPERTY_IMAGE } from "@/app/lib/property-utils";

interface PublicSearchHeroProps {
  category: PropertyCategory;
  filters: PropertySearchFilters;
  total: number;
  backgroundImage?: string;
}

const CATEGORY_TABS: Array<{ label: string; value: PropertyCategory }> = [
  { label: "Hostel", value: "hostel" },
  { label: "Apartment", value: "apartment" },
  { label: "House", value: "home" },
  { label: "Office", value: "office" },
  { label: "Shop", value: "shop" },
];

const QUICK_FILTERS = [
  { label: "Wifi Included", amenity: "WiFi" },
  { label: "AC Rooms", amenity: "AC" },
  { label: "Furnished", amenity: "Furnished" },
  { label: "Family Friendly", amenity: "Family Friendly" },
  { label: "Parking Space", amenity: "Parking" },
] as const;

const parseBudget = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : "";
};

const formatBudgetLabel = (minRent?: number | "", maxRent?: number | "") => {
  const min = typeof minRent === "number" && minRent > 0 ? minRent : null;
  const max = typeof maxRent === "number" && maxRent > 0 ? maxRent : null;

  if (!min && !max) {
    return "Any budget";
  }

  const formatter = new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0,
    notation: "compact",
  });

  if (min && max) {
    return `Rs. ${formatter.format(min)} - ${formatter.format(max)}`;
  }

  return min ? `From Rs. ${formatter.format(min)}` : `Up to Rs. ${formatter.format(max!)}`;
};

export default function PublicSearchHero({
  category,
  filters,
  total,
  backgroundImage,
}: PublicSearchHeroProps) {
  const { updateFilters } = useProperties(category);
  const locationRef = useRef<HTMLInputElement>(null);
  const minRentRef = useRef<HTMLInputElement>(null);
  const maxRentRef = useRef<HTMLInputElement>(null);

  const heroLocation = useMemo(() => {
    if (filters.location && filters.city) {
      return `${filters.location}, ${filters.city}`;
    }

    if (filters.location) {
      return filters.location;
    }

    if (filters.city) {
      return filters.city.toLowerCase() === "islamabad"
        ? "Islamabad sectors"
        : filters.city;
    }

    return "Islamabad and Rawalpindi";
  }, [filters.city, filters.location]);

  const selectedAmenities = filters.amenities || [];

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextLocation = locationRef.current?.value.trim() || "";

    updateFilters({
      location: nextLocation,
      city: filters.city,
      minRent: parseBudget(minRentRef.current?.value || ""),
      maxRent: parseBudget(maxRentRef.current?.value || ""),
    });
  };

  const toggleAmenity = (amenity: string) => {
    const selected = selectedAmenities.includes(amenity);
    updateFilters({
      amenities: selected
        ? selectedAmenities.filter((item) => item !== amenity)
        : [...selectedAmenities, amenity],
    });
  };

  const lowBudgetActive = filters.maxRent === 50000;

  return (
    <section className="relative isolate overflow-hidden bg-[#001f8f]">
      <div className="absolute inset-0">
        <Image
          src={backgroundImage || DEFAULT_PROPERTY_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,#001a9b_0%,rgba(0,45,178,0.88)_42%,rgba(0,167,145,0.86)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.2),transparent_28%),radial-gradient(circle_at_80%_18%,rgba(45,212,191,0.28),transparent_30%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[470px] max-w-[1500px] flex-col items-center px-4 pb-12 pt-10 text-center sm:px-6 lg:px-8 lg:pb-16 lg:pt-14">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase text-white shadow-sm backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
          Verified property discovery
        </span>

        <h1 className="mt-5 max-w-4xl text-[2.4rem] font-black leading-[1.05] text-white sm:text-6xl lg:text-7xl">
          Find your perfect{" "}
          <span className="font-black italic text-emerald-300">stay</span> in{" "}
          {heroLocation}.
        </h1>

        <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-white/90 sm:text-lg">
          Browse {total.toLocaleString("en-PK")} verified listings with live
          pricing, real property photos, and location-aware filters.
          <span className="mt-2 block text-sm text-white/85">
            AnganStay is currently focused on Islamabad and Rawalpindi. More
            cities are coming soon.
          </span>
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 w-full max-w-5xl rounded-[1.75rem] border border-white/35 bg-white p-4 text-left shadow-[0_28px_90px_-42px_rgba(0,0,0,0.45)] sm:p-5 lg:rounded-[2rem]"
        >
          <div className="grid gap-2 sm:grid-cols-5">
            {CATEGORY_TABS.map((tab) => {
              const active = filters.category === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => updateFilters({ category: tab.value })}
                  className={`min-h-12 rounded-2xl px-4 text-sm font-black transition ${
                    active
                      ? "bg-[var(--admin-primary)] text-white shadow-[0_16px_30px_-22px_var(--admin-primary)]"
                      : "text-[var(--admin-text)] hover:bg-[var(--admin-primary-soft)] hover:text-[var(--admin-primary)]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.95fr)_180px]">
            <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-[var(--admin-border)] bg-white px-4 transition focus-within:border-[var(--admin-primary)] focus-within:ring-4 focus-within:ring-[var(--admin-primary)]/10">
              <MapPin className="h-5 w-5 shrink-0 text-[var(--admin-primary)]" />
              <input
                ref={locationRef}
                key={`${filters.city || ""}-${filters.location || ""}`}
                defaultValue={filters.location || filters.city || ""}
                placeholder="Sector, area, or landmark"
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[var(--admin-text)] outline-none placeholder:text-[var(--admin-muted)]"
              />
            </label>

            <div className="grid min-h-14 grid-cols-[auto_1fr_1fr] items-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-white px-4">
              <SlidersHorizontal className="h-5 w-5 shrink-0 text-[var(--admin-primary)]" />
              <input
                ref={minRentRef}
                key={`hero-min-${filters.minRent ?? "blank"}`}
                defaultValue={
                  filters.minRent === "" || filters.minRent === undefined
                    ? ""
                    : String(filters.minRent)
                }
                inputMode="numeric"
                type="number"
                min={0}
                placeholder="Min"
                className="min-w-0 bg-transparent text-sm font-semibold text-[var(--admin-text)] outline-none placeholder:text-[var(--admin-muted)]"
              />
              <input
                ref={maxRentRef}
                key={`hero-max-${filters.maxRent ?? "blank"}`}
                defaultValue={
                  filters.maxRent === "" || filters.maxRent === undefined
                    ? ""
                    : String(filters.maxRent)
                }
                inputMode="numeric"
                type="number"
                min={0}
                placeholder="Max"
                className="min-w-0 border-l border-[var(--admin-border)] bg-transparent pl-3 text-sm font-semibold text-[var(--admin-text)] outline-none placeholder:text-[var(--admin-muted)]"
              />
            </div>

            <button
              type="submit"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[var(--admin-primary)] px-6 text-sm font-black text-white shadow-[0_18px_34px_-24px_var(--admin-primary)] transition hover:-translate-y-0.5 hover:opacity-95"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {QUICK_FILTERS.map((item) => {
              const active = selectedAmenities.includes(item.amenity);
              return (
                <button
                  key={item.amenity}
                  type="button"
                  onClick={() => toggleAmenity(item.amenity)}
                  aria-pressed={active}
                  className={`rounded-full border px-4 py-2.5 text-xs font-black transition ${
                    active
                      ? "border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white"
                      : "border-[var(--admin-border)] bg-white text-[var(--admin-text)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() =>
                updateFilters({
                  maxRent: lowBudgetActive ? "" : 50000,
                })
              }
              aria-pressed={lowBudgetActive}
              className={`rounded-full border px-4 py-2.5 text-xs font-black transition ${
                lowBudgetActive
                  ? "border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white"
                  : "border-[var(--admin-border)] bg-white text-[var(--admin-text)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
              }`}
            >
              Low Budget
            </button>

            <span className="ml-auto hidden items-center rounded-full bg-[var(--admin-primary-soft)] px-4 py-2.5 text-xs font-black text-[var(--admin-primary)] lg:inline-flex">
              Budget: {formatBudgetLabel(filters.minRent, filters.maxRent)}
            </span>
          </div>
        </form>
      </div>
    </section>
  );
}
