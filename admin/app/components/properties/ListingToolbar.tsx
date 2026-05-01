"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";

import { useProperties } from "@/app/hooks/usePublicProperties";
import type { PropertyCategory, PropertySort } from "@/app/lib/property-types";

interface ListingToolbarProps {
  category: PropertyCategory;
  totalOnPage: number;
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
  totalOnPage,
  currentPage,
  totalPages,
}: ListingToolbarProps) {
  const { filters, updateFilters } = useProperties(category);

  return (
    <div className="flex flex-col gap-3 rounded-[1.75rem] border border-[var(--admin-border)] bg-white p-4 shadow-[0_16px_34px_-30px_var(--admin-shadow)] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--admin-card)] px-4 py-2 text-sm font-semibold text-[var(--admin-text)]">
          <SlidersHorizontal size={16} className="text-[var(--admin-primary)]" />
          {totalOnPage} Listings
        </span>
        <span className="text-sm text-[var(--admin-muted)]">
          Page {currentPage} of {Math.max(totalPages, 1)}
        </span>
      </div>

      <div className="relative w-full sm:max-w-[220px]">
        <select
          aria-label="Sort listings"
          value={filters.sortBy || "newest"}
          onChange={(event) =>
            updateFilters({
              sortBy: event.target.value as PropertySort,
            })
          }
          className="admin-input w-full appearance-none rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-3 pr-11 text-sm font-medium text-[var(--admin-text)] shadow-none transition focus:border-[var(--admin-primary)]"
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
  );
}
