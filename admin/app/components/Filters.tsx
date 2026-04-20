/* eslint-disable */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import {
  Search,
  MapPin,
  CreditCard,
  Wind,
  Filter as FilterIcon,
  X,
} from "lucide-react";

const AMENITIES = ["WiFi", "AC", "Laundry", "Parking", "Gym"];

export default function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [addressInput, setAddressInput] = useState(
    searchParams.get("addressQuery") || "",
  );

  const currentCategory = (params.category as string) || "home";

  const updateFilter = (key: string, value: any) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    if (key === "hostOption") {
      router.push(`/${value}?${newSearchParams.toString()}`);
      return;
    }

    if (value && value.length > 0) {
      if (Array.isArray(value)) {
        newSearchParams.set(key, value.join(","));
      } else {
        newSearchParams.set(key, value.toString());
      }
    } else {
      newSearchParams.delete(key);
    }

    newSearchParams.set("page", "1");
    router.push(`?${newSearchParams.toString()}`);
  };

  const toggleMultiSelect = (key: string, item: string) => {
    const current = searchParams.get(key)?.split(",") || [];
    const updated = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];

    updateFilter(key, updated.length > 0 ? updated : null);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (addressInput !== (searchParams.get("addressQuery") || "")) {
        updateFilter("addressQuery", addressInput);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [addressInput]);

  return (
    <div className="w-full lg:w-80">
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="admin-button-primary mb-4 flex w-full items-center justify-between rounded-xl p-4 font-bold lg:hidden"
      >
        <span className="flex items-center gap-2">
          <FilterIcon size={18} /> Filters
        </span>
        {isMobileOpen ? <X size={18} /> : <span>Adjust</span>}
      </button>

      <div
        className={`${isMobileOpen ? "block" : "hidden"} admin-surface sticky top-24 h-fit space-y-8 rounded-2xl p-6 lg:block`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[var(--admin-text)]">Filters</h3>
          <button
            onClick={() => {
              router.push(`/${currentCategory}`);
              setAddressInput("");
            }}
            className="text-xs font-semibold text-[var(--admin-primary)] hover:underline"
          >
            Reset All
          </button>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-wider text-[var(--admin-placeholder)]">
            Category
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {["hostel", "apartment", "home"].map((opt) => (
              <button
                key={opt}
                onClick={() => updateFilter("hostOption", opt)}
                className={`rounded-xl py-3 text-[10px] font-black uppercase transition-all ${
                  currentCategory === opt
                    ? "bg-[var(--admin-primary)] text-[var(--admin-background)] shadow-md shadow-[rgba(0,0,128,0.16)]"
                    : "border border-transparent bg-[var(--admin-card)] text-[var(--admin-muted)]"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[var(--admin-placeholder)]">
              <MapPin size={12} /> City
            </label>
            <select
              onChange={(e) => updateFilter("city", e.target.value)}
              className="admin-input w-full rounded-xl p-4 text-sm font-semibold"
              value={searchParams.get("city") || ""}
            >
              <option value="">Select City</option>
              <option value="Islamabad">Islamabad</option>
              <option value="Rawalpindi">Rawalpindi</option>
            </select>
          </div>

          <div className="relative">
            <Search
              className="absolute left-4 top-4 text-[var(--admin-placeholder)]"
              size={16}
            />
            <input
              type="text"
              placeholder="Search area..."
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              className="admin-input w-full rounded-xl py-4 pl-11 pr-4 text-sm font-semibold"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[var(--admin-placeholder)]">
            <CreditCard size={12} /> Rent Range
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              onChange={(e) => updateFilter("minRent", e.target.value)}
              value={searchParams.get("minRent") || ""}
              className="admin-input w-1/2 rounded-xl p-3 text-sm font-semibold"
            />
            <input
              type="number"
              placeholder="Max"
              onChange={(e) => updateFilter("maxPrice", e.target.value)}
              value={searchParams.get("maxPrice") || ""}
              className="admin-input w-1/2 rounded-xl p-3 text-sm font-semibold"
            />
          </div>
        </div>

        <div className="space-y-3 border-t border-[var(--admin-border)] pt-4">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase text-[var(--admin-placeholder)]">
            <Wind size={12} /> Amenities
          </label>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map((item) => (
              <button
                key={item}
                onClick={() => toggleMultiSelect("amenities", item)}
                className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase transition-all ${
                  searchParams.get("amenities")?.includes(item)
                    ? "border border-[var(--admin-primary-strong)] bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]"
                    : "bg-[var(--admin-card)] text-[var(--admin-placeholder)]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
