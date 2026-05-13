import Link from "next/link";
import { Building2, Home, Hotel, Store, Warehouse } from "lucide-react";

import type { PropertyCategory } from "@/app/lib/property-types";
import { getCanonicalCategorySegment } from "@/app/lib/property-utils";

interface BrowseByCategorySectionProps {
  counts: Partial<Record<PropertyCategory, number>>;
}

const CATEGORY_ITEMS: Array<{
  category: PropertyCategory;
  label: string;
  icon: typeof Building2;
}> = [
  { category: "hostel", label: "Hostels", icon: Hotel },
  { category: "apartment", label: "Apartments", icon: Building2 },
  { category: "home", label: "Houses", icon: Home },
  { category: "office", label: "Offices", icon: Warehouse },
  { category: "shop", label: "Shops", icon: Store },
];

export default function BrowseByCategorySection({
  counts,
}: BrowseByCategorySectionProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-black text-[var(--admin-text)]">
          Browse by Category
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--admin-muted)]">
          Jump into the property type you want using live marketplace routes.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {CATEGORY_ITEMS.map((item) => {
          const Icon = item.icon;
          const count = counts[item.category] || 0;

          return (
            <Link
              key={item.category}
              href={`/${getCanonicalCategorySegment(item.category)}`}
              className="group rounded-[1.2rem] border border-[var(--admin-border)] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--admin-primary)] hover:shadow-[0_18px_38px_-30px_var(--admin-shadow)]"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary)] transition group-hover:bg-[var(--admin-primary)] group-hover:text-white">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-sm font-black text-[var(--admin-text)]">
                {item.label}
              </h3>
              {count > 0 ? (
                <p className="mt-1 text-xs font-semibold text-[var(--admin-muted)]">
                  {count} shown on this page
                </p>
              ) : (
                <p className="mt-1 text-xs font-semibold text-[var(--admin-muted)]">
                  Browse listings
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
