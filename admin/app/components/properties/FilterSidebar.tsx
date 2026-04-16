"use client";

import { memo, useEffect, useState } from "react";

import { useProperties } from "@/app/hooks/usePublicProperties";
import type { PropertyCategory, SizeUnit } from "@/app/lib/property-types";

interface FilterSidebarProps {
  category: PropertyCategory;
  totalResults: number;
}

const AMENITIES = ["WiFi", "AC", "Parking", "Laundry", "Gym"];
const SIZE_UNITS = ["Marla", "Kanal", "Sq. Ft."] as const;

const FilterSidebarComponent = ({
  category,
  totalResults,
}: FilterSidebarProps) => {
  const { filters, updateFilters, resetFilters } = useProperties(category);
  const [mobileOpen, setMobileOpen] = useState(false);

  const showSizeFilters = category === "home" || category === "apartment";

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileOpen]);

  const commitPriceFilter = (key: "minRent" | "maxRent", rawValue: string) => {
    const trimmed = rawValue.trim();
    updateFilters({
      [key]: trimmed ? Number(trimmed) : "",
    });
  };

  const commitSizeFilter = (key: "minSize" | "maxSize", rawValue: string) => {
    const trimmed = rawValue.trim();
    updateFilters({
      [key]: trimmed ? Number(trimmed) : "",
    });
  };

  const sidebarContent = (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-950">Filters</p>
          <p className="text-sm text-slate-500">
            {totalResults} indexed results
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetFilters();
            setMobileOpen(false);
          }}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-200 hover:text-sky-700"
        >
          Reset
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            City
          </label>
          <select
            value={filters.city || ""}
            onChange={(event) => updateFilters({ city: event.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
          >
            <option value="">All cities</option>
            <option value="Islamabad">Islamabad</option>
            <option value="Rawalpindi">Rawalpindi</option>
            <option value="Lahore">Lahore</option>
            <option value="Karachi">Karachi</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Location
          </label>
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
            placeholder="DHA 2, Bahria, F-11..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Min rent
            </label>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              key={`min-${filters.minRent ?? "blank"}`}
              defaultValue={
                filters.minRent === "" || filters.minRent === undefined
                  ? ""
                  : String(filters.minRent)
              }
              onBlur={(event) =>
                commitPriceFilter("minRent", event.currentTarget.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  commitPriceFilter(
                    "minRent",
                    (event.currentTarget as HTMLInputElement).value,
                  );
                  (event.currentTarget as HTMLInputElement).blur();
                }
              }}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Max rent
            </label>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              key={`max-${filters.maxRent ?? "blank"}`}
              defaultValue={
                filters.maxRent === "" || filters.maxRent === undefined
                  ? ""
                  : String(filters.maxRent)
              }
              onBlur={(event) =>
                commitPriceFilter("maxRent", event.currentTarget.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  commitPriceFilter(
                    "maxRent",
                    (event.currentTarget as HTMLInputElement).value,
                  );
                  (event.currentTarget as HTMLInputElement).blur();
                }
              }}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
            />
          </div>
        </div>

        {showSizeFilters && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Min size
                </label>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  key={`min-size-${filters.minSize ?? "blank"}`}
                  defaultValue={
                    filters.minSize === "" || filters.minSize === undefined
                      ? ""
                      : String(filters.minSize)
                  }
                  onBlur={(event) =>
                    commitSizeFilter("minSize", event.currentTarget.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      commitSizeFilter(
                        "minSize",
                        (event.currentTarget as HTMLInputElement).value,
                      );
                      (event.currentTarget as HTMLInputElement).blur();
                    }
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Max size
                </label>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  key={`max-size-${filters.maxSize ?? "blank"}`}
                  defaultValue={
                    filters.maxSize === "" || filters.maxSize === undefined
                      ? ""
                      : String(filters.maxSize)
                  }
                  onBlur={(event) =>
                    commitSizeFilter("maxSize", event.currentTarget.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      commitSizeFilter(
                        "maxSize",
                        (event.currentTarget as HTMLInputElement).value,
                      );
                      (event.currentTarget as HTMLInputElement).blur();
                    }
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
                />
              </div>
            </div>

            {/* Size Unit Selector */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Size unit
              </label>
              <select
                value={filters.sizeUnit || ""}
                onChange={(event) =>
                  updateFilters({
                    sizeUnit: event.target.value as SizeUnit,
                  })
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
              >
                <option value="">All units</option>
                {SIZE_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Sort */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Sort
          </label>
          <select
            value={filters.sortBy || "newest"}
            onChange={(event) =>
              updateFilters({
                sortBy: event.target.value as typeof filters.sortBy,
              })
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
          >
            <option value="newest">Latest listings</option>
            <option value="popular">Most popular</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </div>

        {category === "hostel" && (
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Hostel type
            </label>
            <select
              value={filters.hostelType || ""}
              onChange={(event) =>
                updateFilters({
                  hostelType: event.target.value as typeof filters.hostelType,
                })
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
            >
              <option value="">All types</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
        )}

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Amenities
          </label>
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
                      ? "bg-slate-950 text-white"
                      : "border border-slate-200 bg-slate-50 text-slate-700 hover:border-sky-200 hover:text-sky-700"
                  }`}
                >
                  {amenity}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="mb-4 inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-slate-300/40 lg:hidden"
      >
        Open filters
      </button>

      <div className="hidden lg:block">{sidebarContent}</div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 right-0 w-full max-w-md overflow-y-auto bg-slate-50 p-5">
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
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
