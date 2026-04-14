/* eslint-disable */
"use client";

import React, { useState, useEffect } from "react";
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
  const params = useParams(); // Use this to get the current [category]

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [addressInput, setAddressInput] = useState(
    searchParams.get("addressQuery") || "",
  );

  // The category from the URL folder, e.g., /hostel -> category = "hostel"
  const currentCategory = (params.category as string) || "home";

  const updateFilter = (key: string, value: any) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    // 1. Handle Path Changes (for Category)
    if (key === "hostOption") {
      // If user clicks a category, we change the ACTUAL URL PATH
      // Example: from /home?city=Islamabad to /hostel?city=Islamabad
      const newPath = `/${value}`;
      router.push(`${newPath}?${newSearchParams.toString()}`);
      return;
    }

    // 2. Handle Search Parameter Changes (Standard filters)
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
        className="lg:hidden w-full flex items-center justify-between bg-blue-600 text-white p-4 rounded-xl mb-4 font-bold shadow-lg"
      >
        <span className="flex items-center gap-2">
          <FilterIcon size={18} /> Filters
        </span>
        {isMobileOpen ? <X size={18} /> : <span>Adjust</span>}
      </button>

      <div
        className={`${isMobileOpen ? "block" : "hidden"} lg:block space-y-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit sticky top-24`}
      >
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-800">Filters</h3>
          <button
            onClick={() => {
              router.push(`/${currentCategory}`); // Reset to base category path
              setAddressInput("");
            }}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Reset All
          </button>
        </div>

        {/* 3-Way Path Toggle */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
            Category
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {["hostel", "apartment", "home"].map((opt) => (
              <button
                key={opt}
                onClick={() => updateFilter("hostOption", opt)}
                className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${
                  currentCategory === opt
                    ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                    : "bg-gray-50 text-gray-500 border border-transparent"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* City & Address */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <MapPin size={12} /> City
            </label>
            <select
              onChange={(e) => updateFilter("city", e.target.value)}
              className="w-full p-4 rounded-xl border-none outline-none text-sm bg-gray-50 font-semibold"
              value={searchParams.get("city") || ""}
            >
              <option value="">Select City</option>
              <option value="Islamabad">Islamabad</option>
              <option value="Rawalpindi">Rawalpindi</option>
            </select>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-4 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search area..."
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              className="w-full pl-11 pr-4 py-4 rounded-xl border-none outline-none text-sm bg-gray-50 font-semibold"
            />
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <CreditCard size={12} /> Rent Range
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              onChange={(e) => updateFilter("minRent", e.target.value)}
              value={searchParams.get("minRent") || ""}
              className="w-1/2 p-3 rounded-xl bg-gray-50 text-sm font-semibold outline-none"
            />
            <input
              type="number"
              placeholder="Max"
              onChange={(e) => updateFilter("maxPrice", e.target.value)}
              value={searchParams.get("maxPrice") || ""}
              className="w-1/2 p-3 rounded-xl bg-gray-50 text-sm font-semibold outline-none"
            />
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <label className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-2">
            <Wind size={12} /> Amenities
          </label>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map((item) => (
              <button
                key={item}
                onClick={() => toggleMultiSelect("amenities", item)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                  searchParams.get("amenities")?.includes(item)
                    ? "bg-blue-100 text-blue-700 border-blue-200"
                    : "bg-gray-50 text-gray-400"
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
