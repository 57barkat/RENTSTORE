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

  const showSizeFilters =
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
    <div className="admin-surface rounded-[2rem] p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--admin-text)]">
            Filters
          </p>
          <p className="text-sm text-[var(--admin-muted)]">
            {totalResults} indexed results
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetFilters();
            setMobileOpen(false);
          }}
          className="admin-button-secondary rounded-full px-4 py-2 text-sm font-medium"
        >
          Reset
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Title
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
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            City
          </label>
          <select
            value={filters.city || ""}
            onChange={(event) => updateFilters({ city: event.target.value })}
            className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
          >
            <option value="">All cities</option>
            <option value="Islamabad">Islamabad</option>
            <option value="Rawalpindi">Rawalpindi</option>
            <option value="Lahore">Lahore</option>
            <option value="Karachi">Karachi</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
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
            className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
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
              className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
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
              className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
            />
          </div>
        </div>

        {showSizeFilters && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
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
                  className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
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
                  className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
                />
              </div>
            </div>

            {/* Size Unit Selector */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
                Size unit
              </label>
              <select
                value={filters.sizeUnit || ""}
                onChange={(event) =>
                  updateFilters({
                    sizeUnit: event.target.value as SizeUnit,
                  })
                }
                className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
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
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
            Sort
          </label>
          <select
            value={filters.sortBy || "newest"}
            onChange={(event) =>
              updateFilters({
                sortBy: event.target.value as typeof filters.sortBy,
              })
            }
            className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
          >
            <option value="newest">Latest listings</option>
            <option value="popular">Most popular</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </div>

        {category === "hostel" && (
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
              Hostel type
            </label>
            <select
              value={filters.hostelType || ""}
              onChange={(event) =>
                updateFilters({
                  hostelType: event.target.value as typeof filters.hostelType,
                })
              }
              className="admin-input w-full rounded-2xl px-4 py-3 text-sm"
            >
              <option value="">All types</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
        )}

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
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
                      ? "bg-[var(--admin-primary)] text-[var(--admin-background)]"
                      : "border border-[var(--admin-border)] bg-[var(--admin-background)] text-[var(--admin-muted)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
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
        className="admin-button-primary mb-4 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-medium lg:hidden"
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
