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
        className="admin-input cursor-pointer appearance-none rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold"
      >
        <option value="newest">Latest Listings</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="popular">Most Popular</option>
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-3 text-[var(--admin-placeholder)]"
        size={16}
      />
    </div>
  );
}
