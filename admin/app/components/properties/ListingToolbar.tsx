"use client";

import { ChevronDown, Grid2X2, Map } from "lucide-react";

import { useProperties } from "@/app/hooks/usePublicProperties";
import type { PropertyCategory, PropertySort } from "@/app/lib/property-types";

interface ListingToolbarProps {
  category: PropertyCategory;
  total: number;
  currentPage: number;
  totalPages: number;
}

const SORT_OPTIONS: Array<{ label: string; value: PropertySort }> = [
  { label: "Newest First", value: "newest" },
  { label: "Most Popular", value: "popular" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

export default function ListingToolbar({
  category,
  total,
  currentPage,
  totalPages,
}: ListingToolbarProps) {
  const { filters, updateFilters } = useProperties(category);
  const locationLabel =
    [filters.location, filters.city].filter(Boolean).join(", ") ||
    "Islamabad and Rawalpindi";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-3xl font-black text-[var(--admin-text)]">
          {total.toLocaleString("en-PK")} Properties
        </h2>
        <p className="mt-1 text-sm font-semibold text-[var(--admin-muted)]">
          in {locationLabel} - Page {currentPage} of {Math.max(totalPages, 1)}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-[210px]">
          <select
            aria-label="Sort listings"
            value={filters.sortBy || "newest"}
            onChange={(event) =>
              updateFilters({
                sortBy: event.target.value as PropertySort,
              })
            }
            className="admin-input h-12 w-full appearance-none rounded-2xl border border-[var(--admin-border)] bg-white px-4 pr-11 text-sm font-bold text-[var(--admin-text)] shadow-sm transition focus:border-[var(--admin-primary)]"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--admin-muted)]"
          />
        </div>

        <div className="inline-flex rounded-2xl border border-[var(--admin-border)] bg-white p-1 shadow-sm">
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--admin-primary)] px-3 text-xs font-black text-white"
            aria-pressed="true"
          >
            <Grid2X2 className="h-4 w-4" />
            Grid
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-black text-[var(--admin-muted)]"
            aria-pressed="false"
          >
            <Map className="h-4 w-4" />
            Map
          </button>
        </div>
      </div>
    </div>
  );
}
