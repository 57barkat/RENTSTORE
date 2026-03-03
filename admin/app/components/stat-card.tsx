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
    green: "bg-emerald-500/10 text-emerald-500",
    blue: "bg-blue-500/10 text-blue-500",
    orange: "bg-orange-500/10 text-orange-500",
    red: "bg-red-500/10 text-red-500",
    primary: "bg-primary/10 text-primary",
  };

  const isNegative = trend < 0;

  const trendClass = isNegative
    ? "bg-red-500/10 text-red-500"
    : "bg-emerald-500/10 text-emerald-500";

  const trendIcon = isNegative ? "↘" : "↗";

  return (
    <div className="bg-card p-6 rounded-[2.5rem] shadow-sm flex flex-col gap-4 border border-border transition-colors duration-300">
      <div className="flex justify-between items-center">
        <div
          className={`p-4 rounded-2xl ${colorMap[color] || colorMap.primary} transition-colors`}
        >
          {icon}
        </div>
        <button className="text-muted-foreground hover:text-foreground transition-colors p-2">
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
        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold tracking-wide">
          {title}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <h3 className="text-3xl font-bold text-foreground">
            {typeof value === "number" ? value.toLocaleString() : value}
          </h3>

          {trend !== 0 && (
            <span
              className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-0.5 ${trendClass}`}
            >
              {trendIcon} {Math.abs(trend)}%
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-2">
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-tighter opacity-80">
            {name}:
          </p>
          <span className="text-foreground text-[11px] font-bold">
            {typeof lastMonth === "number"
              ? lastMonth.toLocaleString()
              : lastMonth}
          </span>
        </div>
      </div>
    </div>
  );
}
