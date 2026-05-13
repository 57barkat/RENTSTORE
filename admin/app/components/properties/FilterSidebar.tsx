"use client";

import { memo, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";

import { useProperties } from "@/app/hooks/usePublicProperties";
import type { PropertyCategory, SizeUnit } from "@/app/lib/property-types";

interface FilterSidebarProps {
  category: PropertyCategory;
  totalResults: number;
}

const AMENITIES = ["WiFi", "AC", "Furnished", "Family Friendly", "Parking"];
const SIZE_UNITS = ["Marla", "Kanal", "Sq. Ft.", "Sq. Yd."] as const;
const CATEGORY_OPTIONS: Array<{
  label: string;
  value: PropertyCategory;
}> = [
  { label: "All categories", value: "property" },
  { label: "Houses", value: "home" },
  { label: "Apartments", value: "apartment" },
  { label: "Hostels", value: "hostel" },
  { label: "Shops", value: "shop" },
  { label: "Offices", value: "office" },
];

const FilterSidebarComponent = ({
  category,
  totalResults,
}: FilterSidebarProps) => {
  const { filters, updateFilters, resetFilters } = useProperties(category);
  const [mobileOpen, setMobileOpen] = useState(false);
  const minRentRef = useRef<HTMLInputElement>(null);
  const maxRentRef = useRef<HTMLInputElement>(null);
  const minSizeRef = useRef<HTMLInputElement>(null);
  const maxSizeRef = useRef<HTMLInputElement>(null);

  const showSizeFilters =
    category === "property" ||
    category === "home" ||
    category === "apartment" ||
    category === "shop" ||
    category === "office";

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileOpen]);

  const parseDraftNumber = (rawValue: string) => {
    const trimmed = rawValue.trim();
    return trimmed ? Number(trimmed) : "";
  };

  const applyRangeFilters = () => {
    updateFilters({
      minRent: parseDraftNumber(minRentRef.current?.value || ""),
      maxRent: parseDraftNumber(maxRentRef.current?.value || ""),
      minSize: parseDraftNumber(minSizeRef.current?.value || ""),
      maxSize: parseDraftNumber(maxSizeRef.current?.value || ""),
    });
  };

  const handleRangeKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    applyRangeFilters();
  };

  const sidebarContent = (
    <div className="rounded-[1.35rem] border border-[var(--admin-border)] bg-white p-4 shadow-[0_18px_44px_-36px_rgba(0,31,143,0.35)]">
      <div className="mb-5 flex items-center justify-between gap-4 border-b border-[var(--admin-border)] pb-4">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
            <SlidersHorizontal className="h-4 w-4" />
          </span>
          <p className="text-sm font-black text-[var(--admin-text)]">
            Filters
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetFilters();
            setMobileOpen(false);
          }}
          className="rounded-full px-3 py-2 text-xs font-black text-[var(--admin-primary)] transition hover:bg-[var(--admin-primary-soft)]"
        >
          Reset All
        </button>
      </div>

      <div className="space-y-5">
        <section>
          <label className="mb-2 block text-xs font-black text-[var(--admin-text)]">
            Location
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
            <input
              key={filters.location || "blank-location"}
              defaultValue={filters.location || ""}
              onBlur={(event) =>
                updateFilters({ location: event.currentTarget.value.trim() })
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  updateFilters({
                    location: (
                      event.currentTarget as HTMLInputElement
                    ).value.trim(),
                  });
                }
              }}
              placeholder="Search city or area"
              className="admin-input h-11 w-full rounded-xl pl-10 pr-3 text-sm"
            />
          </div>
          <div className="relative mt-2">
            <select
              value={filters.city || ""}
              onChange={(event) => updateFilters({ city: event.target.value })}
              className="admin-input h-11 w-full appearance-none rounded-xl px-3 pr-9 text-sm"
            >
              <option value="">All cities</option>
              <option value="Islamabad">Islamabad</option>
              <option value="Rawalpindi">Rawalpindi</option>
              <option value="Lahore">Lahore</option>
              <option value="Karachi">Karachi</option>
            </select>
            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--admin-muted)]"
            />
          </div>
        </section>

        <section>
          <p className="mb-2 block text-xs font-black text-[var(--admin-text)]">
            Property Type
          </p>
          <div className="grid gap-2">
            {CATEGORY_OPTIONS.map((option) => {
              const active = filters.category === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    updateFilters({
                      category: option.value,
                    })
                  }
                  className="flex min-h-8 items-center justify-between gap-3 rounded-lg text-left text-sm font-semibold text-[var(--admin-text)] transition hover:text-[var(--admin-primary)]"
                >
                  <span className="inline-flex items-center gap-2">
                    <span
                      className={`inline-flex h-4 w-4 items-center justify-center rounded border ${
                        active
                          ? "border-[var(--admin-primary)] bg-[var(--admin-primary)]"
                          : "border-[var(--admin-border)] bg-white"
                      }`}
                    >
                      {active ? (
                        <span className="h-1.5 w-1.5 rounded-sm bg-white" />
                      ) : null}
                    </span>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <label className="mb-2 block text-xs font-black text-[var(--admin-text)]">
            Keyword
          </label>
          <input
            key={filters.title || "blank-title"}
            defaultValue={filters.title || ""}
            onBlur={(event) =>
              updateFilters({ title: event.currentTarget.value.trim() })
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                updateFilters({
                  title: (event.currentTarget as HTMLInputElement).value.trim(),
                });
              }
            }}
            placeholder="Family home, executive office..."
            className="admin-input h-11 w-full rounded-xl px-3 text-sm"
          />
        </section>

        <section>
          <p className="mb-2 block text-xs font-black text-[var(--admin-text)]">
            Price Range (PKR)
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <input
              ref={minRentRef}
              type="number"
              min={0}
              inputMode="numeric"
              key={`min-${filters.minRent ?? "blank"}`}
              defaultValue={
                filters.minRent === "" || filters.minRent === undefined
                  ? ""
                  : String(filters.minRent)
              }
              onKeyDown={handleRangeKeyDown}
              placeholder="Min"
              className="admin-input h-11 w-full rounded-xl px-3 text-sm"
            />
          </div>
          <div>
            <input
              ref={maxRentRef}
              type="number"
              min={0}
              inputMode="numeric"
              key={`max-${filters.maxRent ?? "blank"}`}
              defaultValue={
                filters.maxRent === "" || filters.maxRent === undefined
                  ? ""
                  : String(filters.maxRent)
              }
              onKeyDown={handleRangeKeyDown}
              placeholder="Max"
              className="admin-input h-11 w-full rounded-xl px-3 text-sm"
            />
          </div>
        </div>
        </section>

        <section>
          <p className="mb-2 block text-xs font-black text-[var(--admin-text)]">
            Bedrooms
          </p>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((value) => {
              const active = filters.bedrooms === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    updateFilters({ bedrooms: active ? "" : value })
                  }
                  className={`rounded-xl border px-3 py-2 text-xs font-black transition ${
                    active
                      ? "border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white"
                      : "border-[var(--admin-border)] bg-white text-[var(--admin-muted)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <p className="mb-2 block text-xs font-black text-[var(--admin-text)]">
            Bathrooms
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((value) => {
              const active = filters.bathrooms === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    updateFilters({ bathrooms: active ? "" : value })
                  }
                  className={`rounded-xl border px-3 py-2 text-xs font-black transition ${
                    active
                      ? "border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white"
                      : "border-[var(--admin-border)] bg-white text-[var(--admin-muted)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </section>

        {showSizeFilters && (
          <section>
            <p className="mb-2 block text-xs font-black text-[var(--admin-text)]">
              Size
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <input
                  ref={minSizeRef}
                  type="number"
                  min={0}
                  inputMode="numeric"
                  key={`min-size-${filters.minSize ?? "blank"}`}
                  defaultValue={
                    filters.minSize === "" || filters.minSize === undefined
                      ? ""
                      : String(filters.minSize)
                  }
                  onKeyDown={handleRangeKeyDown}
                  placeholder="Min"
                  className="admin-input h-11 w-full rounded-xl px-3 text-sm"
                />
              </div>
              <div>
                <input
                  ref={maxSizeRef}
                  type="number"
                  min={0}
                  inputMode="numeric"
                  key={`max-size-${filters.maxSize ?? "blank"}`}
                  defaultValue={
                    filters.maxSize === "" || filters.maxSize === undefined
                      ? ""
                      : String(filters.maxSize)
                  }
                  onKeyDown={handleRangeKeyDown}
                  placeholder="Max"
                  className="admin-input h-11 w-full rounded-xl px-3 text-sm"
                />
              </div>
            </div>

            <div className="relative mt-2">
              <select
                value={filters.sizeUnit || ""}
                onChange={(event) =>
                  updateFilters({
                    sizeUnit: event.target.value as SizeUnit,
                  })
                }
                className="admin-input h-11 w-full appearance-none rounded-xl px-3 pr-9 text-sm"
              >
                <option value="">All units</option>
                {SIZE_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--admin-muted)]"
              />
            </div>
          </section>
        )}

        <button
          type="button"
          onClick={applyRangeFilters}
          className="w-full rounded-xl bg-[var(--admin-primary)] px-4 py-3 text-sm font-black text-white shadow-[0_16px_30px_-24px_var(--admin-primary)] transition hover:opacity-95"
        >
          Apply filters
        </button>

        <section>
          <label className="mb-2 block text-xs font-black text-[var(--admin-text)]">
            Sort
          </label>
          <div className="relative">
            <select
              value={filters.sortBy || "newest"}
              onChange={(event) =>
                updateFilters({
                  sortBy: event.target.value as typeof filters.sortBy,
                })
              }
              className="admin-input h-11 w-full appearance-none rounded-xl px-3 pr-9 text-sm"
            >
              <option value="newest">Latest listings</option>
              <option value="popular">Most popular</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--admin-muted)]"
            />
          </div>
        </section>

        {category === "hostel" && (
          <section>
            <label className="mb-2 block text-xs font-black text-[var(--admin-text)]">
              Hostel type
            </label>
            <div className="relative">
              <select
                value={filters.hostelType || ""}
                onChange={(event) =>
                  updateFilters({
                    hostelType: event.target.value as typeof filters.hostelType,
                  })
                }
                className="admin-input h-11 w-full appearance-none rounded-xl px-3 pr-9 text-sm"
              >
                <option value="">All types</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="mixed">Mixed</option>
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--admin-muted)]"
              />
            </div>
          </section>
        )}

        <section>
          <p className="mb-2 block text-xs font-black text-[var(--admin-text)]">
            Amenities
          </p>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map((amenity) => {
              const selected = filters.amenities?.includes(amenity);
              const nextAmenities = selected
                ? (filters.amenities || []).filter((item) => item !== amenity)
                : [...(filters.amenities || []), amenity];

              return (
                <button
                  key={amenity}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => updateFilters({ amenities: nextAmenities })}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    selected
                      ? "bg-[var(--admin-primary)] text-white"
                      : "border border-[var(--admin-border)] bg-white text-[var(--admin-muted)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
                  }`}
                >
                  {amenity}
                </button>
              );
            })}
          </div>
        </section>

        <p className="rounded-xl bg-[var(--admin-primary-soft)] px-3 py-2 text-xs font-bold text-[var(--admin-primary)]">
          {totalResults.toLocaleString("en-PK")} matching results
        </p>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--admin-primary)] px-5 py-3 text-sm font-black text-white shadow-[0_16px_30px_-24px_var(--admin-primary)] lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Open filters
      </button>

      <div className="hidden lg:block">{sidebarContent}</div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-[rgba(15,23,42,0.48)] backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 right-0 w-full max-w-md overflow-y-auto bg-[var(--admin-background)] p-5">
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="admin-button-secondary rounded-full px-4 py-2 text-sm font-medium"
              >
                Close
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

const FilterSidebar = memo(FilterSidebarComponent);
FilterSidebar.displayName = "FilterSidebar";

export default FilterSidebar;
