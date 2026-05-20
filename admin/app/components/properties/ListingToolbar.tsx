"use client";

import { ChevronDown } from "lucide-react";

import { useProperties } from "@/app/hooks/usePublicProperties";
import type { PropertyCategory, PropertySort } from "@/app/lib/property-types";

interface ListingToolbarProps {
  category: PropertyCategory;
  total: number;
  currentPage: number;
  totalPages: number;
}

const SORT_OPTIONS: Array<{ label: string; value: PropertySort }> = [
  { label: "Newest Listings", value: "newest" },
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
  const pageLabel = `Page ${currentPage} of ${Math.max(totalPages, 1)}`;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-[var(--admin-text)] sm:text-3xl">
          {total.toLocaleString("en-PK")} verified rentals in Islamabad
        </h2>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[var(--admin-muted)]">
          Explore trusted places across hostels, apartments, houses, shops, and
          offices.
          <span className="sr-only"> {pageLabel}</span>
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
      </div>
    </div>
  );
}
