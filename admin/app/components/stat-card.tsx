"use client";

interface StatCardProps {
  title: string;
  value: string | number;
  trend: number;
  lastMonth: string | number;
  icon: React.ReactNode;
  color: string;
}

export default function StatCard({
  title,
  value,
  trend,
  lastMonth,
  icon,
  color,
}: StatCardProps) {
  const colorMap: Record<string, string> = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    orange: "bg-orange-100 text-orange-600",
    red: "bg-red-100 text-red-600",
  };

  const isNegative = trend < 0;
  const trendBg = isNegative
    ? "bg-red-50 text-red-600"
    : "bg-green-50 text-green-600";
  const trendIcon = isNegative ? "↘" : "↗";

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm flex flex-col gap-4 border border-gray-100">
      <div className="flex justify-between items-center">
        <div className={`p-3 rounded-full ${colorMap[color] || colorMap.blue}`}>
          {icon}
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          •••
        </button>
      </div>

      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <div className="flex items-center gap-3 mt-1">
          <h3 className="text-3xl font-bold text-gray-900">
            {typeof value === "number" ? value.toLocaleString() : value}
          </h3>

          {trend !== 0 && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${trendBg}`}
            >
              {trendIcon} {Math.abs(trend)}%
            </span>
          )}
        </div>
        <p className="text-gray-400 text-[10px] mt-1 font-medium">
          {typeof lastMonth === "number"
            ? `Last month: ${lastMonth}`
            : lastMonth}
        </p>
      </div>
    </div>
  );
}
