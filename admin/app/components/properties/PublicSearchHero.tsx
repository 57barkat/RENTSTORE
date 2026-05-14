"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

import { useProperties } from "@/app/hooks/usePublicProperties";
import type {
  FurnishingType,
  HostelType,
  PropertyCategory,
  PropertySearchFilters,
  PropertySort,
  SizeUnit,
} from "@/app/lib/property-types";
import {
  DEFAULT_PROPERTY_IMAGE,
  getCategoryLabel,
} from "@/app/lib/property-utils";

interface PublicSearchHeroProps {
  category: PropertyCategory;
  filters: PropertySearchFilters;
  total: number;
  backgroundImage?: string;
}

const CATEGORY_TABS: Array<{ label: string; value: PropertyCategory }> = [
  { label: "All", value: "property" },
  { label: "Hostels", value: "hostel" },
  { label: "Apartments", value: "apartment" },
  { label: "Houses", value: "home" },
  { label: "Offices", value: "office" },
  { label: "Shops", value: "shop" },
];

const CITY_OPTIONS = [
  { label: "All cities", value: "" },
  { label: "Islamabad", value: "Islamabad" },
  { label: "Rawalpindi", value: "Rawalpindi" },
] as const;

const AMENITY_FILTERS = [
  { label: "WiFi", value: "wifi" },
  { label: "AC", value: "ac" },
  { label: "Kitchen", value: "kitchen" },
  { label: "Laundry", value: "laundry" },
  { label: "CCTV", value: "cctv" },
  { label: "Lift", value: "lift" },
  { label: "Gym", value: "gym" },
  { label: "Workspace", value: "workspace" },
] as const;

const SIZE_UNITS: SizeUnit[] = ["Marla", "Kanal", "Sq. Ft.", "Sq. Yd."];

const BUDGET_PRESETS = [
  { label: "Under Rs. 25k", minRent: "", maxRent: 25000 },
  { label: "Rs. 25k - 50k", minRent: 25000, maxRent: 50000 },
  { label: "Rs. 50k - 100k", minRent: 50000, maxRent: 100000 },
  { label: "Above Rs. 100k", minRent: 100000, maxRent: "" },
] as const;

const parseBudget = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : "";
};

const formatBudgetLabel = (minRent?: number | "", maxRent?: number | "") => {
  const min = typeof minRent === "number" && minRent > 0 ? minRent : null;
  const max = typeof maxRent === "number" && maxRent > 0 ? maxRent : null;

  if (!min && !max) return "Any budget";

  const formatter = new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0,
    notation: "compact",
  });

  if (min && max)
    return `Rs. ${formatter.format(min)} - ${formatter.format(max)}`;
  return min
    ? `From Rs. ${formatter.format(min)}`
    : `Up to Rs. ${formatter.format(max!)}`;
};

const getActiveFilterCount = (filters: PropertySearchFilters) =>
  [
    filters.category !== "property",
    filters.city,
    filters.location,
    filters.minRent,
    filters.maxRent,
    filters.bedrooms,
    filters.bathrooms,
    filters.minSize,
    filters.maxSize,
    filters.sizeUnit,
    filters.hostelType,
    filters.furnishing,
    filters.parking !== "" && filters.parking !== undefined,
    filters.familyFriendly === true,
    filters.sortBy && filters.sortBy !== "newest",
    ...(filters.amenities || []),
  ].filter(Boolean).length;

const makeChipLabel = (label: string, value?: string | number | boolean) =>
  value === undefined || value === "" || value === true
    ? label
    : `${label}: ${value}`;

export default function PublicSearchHero({
  category,
  filters,
  total,
  backgroundImage,
}: PublicSearchHeroProps) {
  const { updateFilters, resetFilters } = useProperties(category);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const locationRef = useRef<HTMLInputElement>(null);
  const minRentRef = useRef<HTMLInputElement>(null);
  const maxRentRef = useRef<HTMLInputElement>(null);
  const advancedMinRentRef = useRef<HTMLInputElement>(null);
  const advancedMaxRentRef = useRef<HTMLInputElement>(null);
  const minSizeRef = useRef<HTMLInputElement>(null);
  const maxSizeRef = useRef<HTMLInputElement>(null);
  const activeFilterCount = getActiveFilterCount(filters);

  const heroLocation = useMemo(() => {
    if (filters.location && filters.city)
      return `${filters.location}, ${filters.city}`;
    if (filters.location) return filters.location;
    if (filters.city) {
      return filters.city.toLowerCase() === "islamabad"
        ? "Islamabad"
        : filters.city;
    }
    return "Islamabad";
  }, [filters.city, filters.location]);

  const selectedAmenities = filters.amenities || [];

  const handleResetFilters = () => {
    setFiltersOpen(false);
    resetFilters();
  };

  const applyPrimarySearch = () => {
    const nextLocation = locationRef.current?.value.trim() || "";

    updateFilters({
      location: nextLocation,
      city: filters.city,
      minRent: parseBudget(minRentRef.current?.value || ""),
      maxRent: parseBudget(maxRentRef.current?.value || ""),
    });
  };

  const applyAdvancedFilters = () => {
    updateFilters({
      minRent: parseBudget(advancedMinRentRef.current?.value || ""),
      maxRent: parseBudget(advancedMaxRentRef.current?.value || ""),
      minSize: parseBudget(minSizeRef.current?.value || ""),
      maxSize: parseBudget(maxSizeRef.current?.value || ""),
    });
    setFiltersOpen(false);
  };

  const toggleAmenity = (amenity: string) => {
    const selected = selectedAmenities.includes(amenity);
    updateFilters({
      amenities: selected
        ? selectedAmenities.filter((item) => item !== amenity)
        : [...selectedAmenities, amenity],
    });
  };

  const removeAmenity = (amenity: string) => {
    updateFilters({
      amenities: selectedAmenities.filter((item) => item !== amenity),
    });
  };

  const activeChips = [
    filters.category !== "property"
      ? {
          key: "category",
          label: getCategoryLabel(filters.category, true),
          onRemove: () => updateFilters({ category: "property" }),
        }
      : null,
    filters.location
      ? {
          key: "location",
          label: makeChipLabel("Area", filters.location),
          onRemove: () => updateFilters({ location: "" }),
        }
      : null,
    filters.city
      ? {
          key: "city",
          label: makeChipLabel("City", filters.city),
          onRemove: () => updateFilters({ city: "", location: "" }),
        }
      : null,
    filters.minRent || filters.maxRent
      ? {
          key: "budget",
          label: formatBudgetLabel(filters.minRent, filters.maxRent),
          onRemove: () => updateFilters({ minRent: "", maxRent: "" }),
        }
      : null,
    filters.bedrooms
      ? {
          key: "bedrooms",
          label: makeChipLabel("Bedrooms", filters.bedrooms),
          onRemove: () => updateFilters({ bedrooms: "" }),
        }
      : null,
    filters.bathrooms
      ? {
          key: "bathrooms",
          label: makeChipLabel("Bathrooms", filters.bathrooms),
          onRemove: () => updateFilters({ bathrooms: "" }),
        }
      : null,
    filters.hostelType
      ? {
          key: "hostelType",
          label: makeChipLabel("Hostel type", filters.hostelType),
          onRemove: () => updateFilters({ hostelType: "" }),
        }
      : null,
    filters.furnishing
      ? {
          key: "furnishing",
          label: makeChipLabel("Furnishing", filters.furnishing),
          onRemove: () => updateFilters({ furnishing: "" }),
        }
      : null,
    filters.parking === true
      ? {
          key: "parking",
          label: "Parking",
          onRemove: () => updateFilters({ parking: "" }),
        }
      : null,
    filters.familyFriendly === true
      ? {
          key: "familyFriendly",
          label: "Family friendly",
          onRemove: () => updateFilters({ familyFriendly: "" }),
        }
      : null,
    ...selectedAmenities.map((amenity) => ({
      key: `amenity-${amenity}`,
      label:
        AMENITY_FILTERS.find((item) => item.value === amenity)?.label ||
        amenity,
      onRemove: () => removeAmenity(amenity),
    })),
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    onRemove: () => void;
  }>;

  const advancedPanel = (
    <div className="space-y-5">
      <FilterGroup title="Budget">
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            ref={advancedMinRentRef}
            key={`advanced-min-${filters.minRent ?? "blank"}`}
            defaultValue={filters.minRent ? String(filters.minRent) : ""}
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Min price"
            className="admin-input h-11 rounded-xl px-3 text-sm"
          />
          <input
            ref={advancedMaxRentRef}
            key={`advanced-max-${filters.maxRent ?? "blank"}`}
            defaultValue={filters.maxRent ? String(filters.maxRent) : ""}
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Max price"
            className="admin-input h-11 rounded-xl px-3 text-sm"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {BUDGET_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() =>
                updateFilters({
                  minRent: preset.minRent,
                  maxRent: preset.maxRent,
                })
              }
              className="rounded-full border border-[var(--admin-border)] bg-white px-3 py-2 text-xs text-[var(--admin-muted)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </FilterGroup>

      <div className="grid gap-4 sm:grid-cols-2">
        <FilterGroup title="Bedrooms">
          <SegmentedOptions
            options={[1, 2, 3, 4].map((value) => ({
              label: `${value}`,
              active: filters.bedrooms === value,
              onClick: () =>
                updateFilters({
                  bedrooms: filters.bedrooms === value ? "" : value,
                }),
            }))}
          />
        </FilterGroup>

        <FilterGroup title="Bathrooms">
          <SegmentedOptions
            options={[1, 2, 3].map((value) => ({
              label: `${value}`,
              active: filters.bathrooms === value,
              onClick: () =>
                updateFilters({
                  bathrooms: filters.bathrooms === value ? "" : value,
                }),
            }))}
          />
        </FilterGroup>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FilterGroup title="Furnishing">
          <SelectControl
            value={filters.furnishing || ""}
            onChange={(value) =>
              updateFilters({
                furnishing: value as FurnishingType | "",
              })
            }
            options={[
              ["", "Any furnishing"],
              ["furnished", "Furnished"],
              ["semi-furnished", "Semi-furnished"],
              ["unfurnished", "Unfurnished"],
            ]}
          />
        </FilterGroup>

        <FilterGroup title="Hostel type">
          <SelectControl
            value={filters.hostelType || ""}
            onChange={(value) =>
              updateFilters({
                hostelType: value as HostelType | "",
              })
            }
            options={[
              ["", "All hostel types"],
              ["male", "Male"],
              ["female", "Female"],
              ["mixed", "Mixed"],
            ]}
          />
        </FilterGroup>
      </div>

      <FilterGroup title="Size">
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_150px]">
          <input
            ref={minSizeRef}
            key={`min-size-${filters.minSize ?? "blank"}`}
            defaultValue={filters.minSize ? String(filters.minSize) : ""}
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Min size"
            className="admin-input h-11 rounded-xl px-3 text-sm"
          />
          <input
            ref={maxSizeRef}
            key={`max-size-${filters.maxSize ?? "blank"}`}
            defaultValue={filters.maxSize ? String(filters.maxSize) : ""}
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Max size"
            className="admin-input h-11 rounded-xl px-3 text-sm"
          />
          <SelectControl
            value={filters.sizeUnit || ""}
            onChange={(value) =>
              updateFilters({
                sizeUnit: value as SizeUnit | "",
              })
            }
            options={[
              ["", "Any unit"],
              ...SIZE_UNITS.map((unit) => [unit, unit] as [string, string]),
            ]}
          />
        </div>
      </FilterGroup>

      <div className="grid gap-4 sm:grid-cols-2">
        <FilterGroup title="Parking">
          <SegmentedOptions
            options={[
              {
                label: "Any",
                active: filters.parking === "" || filters.parking === undefined,
                onClick: () => updateFilters({ parking: "" }),
              },
              {
                label: "Parking available",
                active: filters.parking === true,
                onClick: () => updateFilters({ parking: true }),
              },
            ]}
          />
        </FilterGroup>

        <FilterGroup title="Family friendly">
          <SegmentedOptions
            options={[
              {
                label: "Any",
                active:
                  filters.familyFriendly === "" ||
                  filters.familyFriendly === undefined,
                onClick: () => updateFilters({ familyFriendly: "" }),
              },
              {
                label: "Family friendly",
                active: filters.familyFriendly === true,
                onClick: () => updateFilters({ familyFriendly: true }),
              },
            ]}
          />
        </FilterGroup>
      </div>

      <FilterGroup title="Amenities">
        <div className="flex flex-wrap gap-2">
          {AMENITY_FILTERS.map((item) => {
            const active = selectedAmenities.includes(item.value);
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => toggleAmenity(item.value)}
                aria-pressed={active}
                className={`rounded-full border px-4 py-2 text-xs transition ${
                  active
                    ? "border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white"
                    : "border-[var(--admin-border)] bg-white text-[var(--admin-text)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup title="Sort">
        <SelectControl
          value={filters.sortBy || "newest"}
          onChange={(value) =>
            updateFilters({
              sortBy: value as PropertySort,
            })
          }
          options={[
            ["newest", "Latest listings"],
            ["popular", "Most popular"],
            ["price_asc", "Price: low to high"],
            ["price_desc", "Price: high to low"],
          ]}
        />
      </FilterGroup>
    </div>
  );

  return (
    <>
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
        </div>

        <div className="relative mx-auto flex min-h-[360px] max-w-[1500px] flex-col items-center px-4 pb-24 pt-10 text-center sm:px-6 lg:px-8 lg:pt-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] uppercase text-white shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
            Verified property discovery
          </span>

          <h1 className="mt-5 max-w-4xl text-[2.2rem] leading-[1.08] text-white sm:text-5xl lg:text-6xl">
            Find your perfect stay in {heroLocation}.
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/90 sm:text-base">
            Browse {total.toLocaleString("en-PK")} verified listings with live
            pricing, photos, and location-aware filters.
            <span className="mt-2 block text-sm text-white/85">
              AnganStay is currently focused on Islamabad. More cities are
              coming soon.
            </span>
          </p>
        </div>
      </section>

      <section
        className="sticky z-40 -mt-16 border-b border-[var(--admin-border)] bg-white/92 px-4 py-3 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.38)] backdrop-blur-xl sm:px-6 lg:px-8"
        style={{ top: "calc(var(--public-header-height, 0px))" }}
      >
        <div className="mx-auto max-w-[1500px]">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              applyPrimarySearch();
            }}
            className="rounded-[1.25rem] border border-[var(--admin-border)] bg-white p-2 shadow-sm"
          >
            <div className="grid gap-2 lg:grid-cols-[minmax(180px,220px)_minmax(260px,1fr)_minmax(220px,0.7fr)_auto_auto]">
              <label className="relative hidden lg:block">
                <span className="sr-only">Property category</span>
                <select
                  value={filters.category}
                  onChange={(event) =>
                    updateFilters({
                      category: event.target.value as PropertyCategory,
                      hostelType:
                        event.target.value === "hostel"
                          ? filters.hostelType
                          : "",
                    })
                  }
                  className="admin-input h-12 w-full appearance-none rounded-2xl px-4 pr-9 text-sm"
                >
                  {CATEGORY_TABS.map((tab) => (
                    <option key={tab.value} value={tab.value}>
                      {tab.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
              </label>

              <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-[var(--admin-border)] bg-white px-4 transition focus-within:border-[var(--admin-primary)] focus-within:ring-4 focus-within:ring-[var(--admin-primary)]/10">
                <MapPin className="h-4 w-4 shrink-0 text-[var(--admin-primary)]" />
                <span className="relative shrink-0 border-r border-[var(--admin-border)] pr-3">
                  <span className="sr-only">City</span>
                  <select
                    value={filters.city || ""}
                    onChange={(event) =>
                      updateFilters({
                        city: event.target.value,
                        location: "",
                      })
                    }
                    className="w-[104px] appearance-none bg-transparent pr-5 text-sm text-[var(--admin-text)] outline-none sm:w-[118px]"
                  >
                    {CITY_OPTIONS.map((city) => (
                      <option
                        key={city.value || "all-cities"}
                        value={city.value}
                      >
                        {city.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--admin-muted)]" />
                </span>
                <input
                  ref={locationRef}
                  key={`${filters.city || ""}-${filters.location || ""}`}
                  defaultValue={filters.location || ""}
                  placeholder="Sector, area, or landmark"
                  className="min-w-0 flex-1 bg-transparent text-sm text-[var(--admin-text)] outline-none placeholder:text-[var(--admin-muted)]"
                />
              </label>

              <div className="hidden min-h-12 grid-cols-2 items-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-white px-4 md:grid">
                <input
                  ref={minRentRef}
                  key={`hero-min-${filters.minRent ?? "blank"}`}
                  defaultValue={filters.minRent ? String(filters.minRent) : ""}
                  inputMode="numeric"
                  type="number"
                  min={0}
                  placeholder="Min price"
                  className="min-w-0 bg-transparent text-sm text-[var(--admin-text)] outline-none placeholder:text-[var(--admin-muted)]"
                />
                <input
                  ref={maxRentRef}
                  key={`hero-max-${filters.maxRent ?? "blank"}`}
                  defaultValue={filters.maxRent ? String(filters.maxRent) : ""}
                  inputMode="numeric"
                  type="number"
                  min={0}
                  placeholder="Max price"
                  className="min-w-0 border-l border-[var(--admin-border)] bg-transparent pl-3 text-sm text-[var(--admin-text)] outline-none placeholder:text-[var(--admin-muted)]"
                />
              </div>

              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-white px-4 text-sm text-[var(--admin-text)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-[var(--admin-primary)] px-2 py-0.5 text-xs text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--admin-primary)] px-5 text-sm text-white shadow-[0_16px_30px_-24px_var(--admin-primary)] transition hover:opacity-95"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>

            <div className="mt-2 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {CATEGORY_TABS.map((tab) => {
                const active = filters.category === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => updateFilters({ category: tab.value })}
                    className={`shrink-0 rounded-full border px-4 py-2 text-xs transition ${
                      active
                        ? "border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white"
                        : "border-[var(--admin-border)] bg-white text-[var(--admin-text)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </form>

          {activeChips.length > 0 && (
            <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.onRemove}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--admin-border)] bg-white px-3 py-2 text-xs text-[var(--admin-muted)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
                >
                  {chip.label}
                  <X className="h-3.5 w-3.5" />
                </button>
              ))}
              <button
                type="button"
                onClick={handleResetFilters}
                className="shrink-0 rounded-full px-3 py-2 text-xs text-[var(--admin-primary)] transition hover:bg-[var(--admin-primary-soft)]"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </section>

      {filtersOpen && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/45 px-0 backdrop-blur-sm sm:items-center sm:px-4">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setFiltersOpen(false)}
            className="absolute inset-0"
          />

          <div className="relative max-h-[88vh] w-full overflow-hidden rounded-t-[1.75rem] bg-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.7)] transition sm:max-w-3xl sm:rounded-[1.75rem]">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--admin-border)] px-5 py-4">
              <div>
                <h2 className="text-lg text-[var(--admin-text)]">
                  More filters
                </h2>
                <p className="mt-1 text-sm text-[var(--admin-muted)]">
                  Refine listings without leaving the search page.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--admin-background)] text-[var(--admin-muted)] transition hover:text-[var(--admin-text)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[calc(88vh-142px)] overflow-y-auto px-5 py-5">
              {advancedPanel}
            </div>

            <div className="sticky bottom-0 grid gap-3 border-t border-[var(--admin-border)] bg-white px-5 py-4 sm:grid-cols-[1fr_1fr]">
              <button
                type="button"
                onClick={handleResetFilters}
                className="min-h-12 rounded-2xl border border-[var(--admin-border)] bg-white px-5 text-sm text-[var(--admin-text)] transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={applyAdvancedFilters}
                className="min-h-12 rounded-2xl bg-[var(--admin-primary)] px-5 text-sm text-white transition hover:opacity-95"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--admin-muted)]">
        {title}
      </h3>
      {children}
    </section>
  );
}

function SegmentedOptions({
  options,
}: {
  options: Array<{ label: string; active: boolean; onClick: () => void }>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          onClick={option.onClick}
          className={`min-h-10 rounded-xl border px-4 text-sm transition ${
            option.active
              ? "border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white"
              : "border-[var(--admin-border)] bg-white text-[var(--admin-text)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function SelectControl({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">Select filter</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="admin-input h-11 w-full appearance-none rounded-xl px-3 pr-9 text-sm"
      >
        {options.map(([optionValue, label]) => (
          <option key={optionValue || label} value={optionValue}>
            {label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
    </label>
  );
}
