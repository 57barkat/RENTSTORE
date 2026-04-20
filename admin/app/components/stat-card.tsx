"use client";

interface StatCardProps {
  title: string;
  value: string | number;
  trend: number;
  lastMonth: string | number;
  icon: React.ReactNode;
  color: string;
  name?: string;
}

export default function StatCard({
  title,
  value,
  trend,
  lastMonth,
  icon,
  name,
  color,
}: StatCardProps) {
  const colorMap: Record<string, string> = {
    green: "bg-[var(--admin-secondary-soft)] text-[var(--admin-secondary)]",
    blue: "bg-[var(--admin-info-soft)] text-[var(--admin-info)]",
    orange: "bg-[var(--admin-warning-soft)] text-[var(--admin-warning)]",
    red: "bg-[var(--admin-error-soft)] text-[var(--admin-error)]",
    primary: "bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]",
  };

  const isNegative = trend < 0;
  const trendClass = isNegative
    ? "bg-[var(--admin-error-soft)] text-[var(--admin-error)]"
    : "bg-[var(--admin-success-soft)] text-[var(--admin-success)]";
  const trendLabel = isNegative ? "Down" : "Up";

  return (
    <div className="admin-surface flex flex-col gap-4 rounded-[2.5rem] p-6">
      <div className="flex items-center justify-between">
        <div
          className={`rounded-2xl p-4 transition-colors ${colorMap[color] || colorMap.primary}`}
        >
          {icon}
        </div>
        <button className="p-2 text-[var(--admin-muted)] transition-colors hover:text-[var(--admin-text)]">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </button>
      </div>

      <div>
        <p className="text-sm font-semibold tracking-wide text-[var(--admin-muted)]">
          {title}
        </p>
        <div className="mt-2 flex items-center gap-3">
          <h3 className="text-3xl font-bold text-[var(--admin-text)]">
            {typeof value === "number" ? value.toLocaleString() : value}
          </h3>

          {trend !== 0 && (
            <span
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-extrabold ${trendClass}`}
            >
              {trendLabel} {Math.abs(trend)}%
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-1.5">
          <p className="text-[11px] font-bold uppercase tracking-tighter text-[var(--admin-placeholder)] opacity-80">
            {name}:
          </p>
          <span className="text-[11px] font-bold text-[var(--admin-text)]">
            {typeof lastMonth === "number"
              ? lastMonth.toLocaleString()
              : lastMonth}
          </span>
        </div>
      </div>
    </div>
  );
}
