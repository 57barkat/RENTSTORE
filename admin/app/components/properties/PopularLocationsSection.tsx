import Link from "next/link";

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

  return (
    <section className="rounded-[2rem] border border-[var(--admin-border)] bg-[color:color-mix(in_srgb,var(--admin-background)_88%,transparent)] p-6 shadow-sm backdrop-blur">
      <div className="mb-5">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--admin-primary)]">
          Popular Locations
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--admin-text)]">
          {title}
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/${item.slug}`}
            className="group rounded-[1.5rem] border border-[var(--admin-border)] bg-[var(--admin-background)] px-5 py-4 transition hover:border-[var(--admin-primary)] hover:shadow-md"
          >
            <p className="text-sm font-medium text-[var(--admin-text)] group-hover:text-[var(--admin-primary)]">
              {itemLabelPrefix} in {item.area} ({item.count})
            </p>
            <p className="mt-2 text-xs text-[var(--admin-muted)]">
              View {browseLabel} in {item.area}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
