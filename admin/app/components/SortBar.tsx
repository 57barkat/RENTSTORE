"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

export function SortBar() {
  const router = useRouter();
  const params = useSearchParams();

  const updateSort = (value: string) => {
    const query = new URLSearchParams(params.toString());
    query.set("sortBy", value);
    router.push(`?${query.toString()}`);
  };

  return (
    <div className="relative inline-block">
      <select
        value={params.get("sortBy") || "newest"}
        onChange={(e) => updateSort(e.target.value)}
        className="appearance-none bg-white border border-gray-200 px-4 py-2.5 pr-10 rounded-xl text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-gray-50 transition-all shadow-sm"
      >
        <option value="newest">Latest Listings</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="popular">Most Popular</option>
      </select>
      <ChevronDown
        className="absolute right-3 top-3 text-gray-400 pointer-events-none"
        size={16}
      />
    </div>
  );
}
