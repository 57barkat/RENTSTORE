import Link from "next/link";
import { ArrowRight, MapPin, TrendingUp } from "lucide-react";

import type { PopularLocationSummary } from "@/app/lib/property-types";

interface PopularLocationsSectionProps {
  title: string;
  itemLabelPrefix: string;
  browseLabel: string;
  items: PopularLocationSummary[];
}

export default function PopularLocationsSection({
  title,
  itemLabelPrefix,
  browseLabel,
  items,
}: PopularLocationsSectionProps) {
  if (items.length === 0) {
    return null;
  }

  const totalListings = items.reduce((total, item) => total + item.count, 0);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-[var(--admin-border)] bg-white shadow-[0_24px_70px_-56px_var(--admin-shadow)]">
      <div className="border-b border-[var(--admin-border)] bg-[linear-gradient(135deg,rgba(56,86,255,0.07),rgba(255,255,255,1),rgba(16,185,129,0.06))] px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-white/85 px-3 py-1.5 text-[10px] font-black uppercase text-[var(--admin-primary)] shadow-sm">
              <TrendingUp className="h-3.5 w-3.5" />
              Trending Areas
            </span>

            <h2 className="mt-3 text-2xl font-black text-[var(--admin-text)] sm:text-3xl">
              {title}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--admin-muted)]">
              Explore nearby areas with active listings and jump straight to
              live results.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--admin-border)] bg-white px-4 py-2 text-xs font-bold text-[var(--admin-muted)] shadow-sm">
            <MapPin className="h-4 w-4 text-[var(--admin-primary)]" />
            {totalListings} listings
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/${item.slug}`}
            className="group rounded-[1.5rem] border border-[var(--admin-border)] bg-[var(--admin-background)] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--admin-primary)] hover:bg-white hover:shadow-[0_20px_50px_-42px_var(--admin-shadow)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-[var(--admin-text)] group-hover:text-[var(--admin-primary)]">
                  {item.area}
                </p>

                <p className="mt-1 text-xs leading-5 text-[var(--admin-muted)]">
                  {itemLabelPrefix} in {item.area}
                </p>
              </div>

              <span className="inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full bg-white px-2 text-xs font-black text-[var(--admin-primary)] shadow-sm">
                {item.count}
              </span>
            </div>

            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[var(--admin-primary)] opacity-80 transition group-hover:gap-2 group-hover:opacity-100">
              View {browseLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
