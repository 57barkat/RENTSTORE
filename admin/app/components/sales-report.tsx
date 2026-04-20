"use client";
import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface PropertyTrendsProps {
  data: { name: string; uploads: number }[];
}

export default function PropertyTrends({ data }: PropertyTrendsProps) {
  const totalUploads = useMemo(
    () => data.reduce((acc, curr) => acc + (curr.uploads || 0), 0),
    [data],
  );

  return (
    <div className="admin-surface flex-1 rounded-[2.5rem] p-6 transition-all duration-300 hover:shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-[var(--admin-text)]">
              Property Uploads
            </h3>
            <span className="rounded-full bg-[var(--admin-primary-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--admin-primary)]">
              +{totalUploads} Total
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--admin-muted)]">
            Daily activity overview
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select className="admin-input appearance-none rounded-xl px-4 py-2 text-xs font-bold">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={1} />
                <stop
                  offset="100%"
                  stopColor="var(--primary)"
                  stopOpacity={0.4}
                />
              </linearGradient>

              <filter id="shadow" height="130%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                <feOffset dx="0" dy="2" result="offsetblur" />
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.1" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="var(--border)"
              opacity={0.4}
            />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--chart-text)",
                fontSize: 10,
                fontWeight: 600,
              }}
              dy={15}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--chart-text)",
                fontSize: 10,
                fontWeight: 600,
              }}
            />

            <Tooltip
              cursor={{ fill: "var(--primary)", opacity: 0.05 }}
              contentStyle={{
                backgroundColor: "var(--card-bg)",
                borderRadius: "1.25rem",
                border: "1px solid var(--border)",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                padding: "12px 16px",
              }}
              itemStyle={{
                color: "var(--primary)",
                fontWeight: "800",
                fontSize: "14px",
              }}
              labelStyle={{
                color: "var(--foreground)",
                marginBottom: "4px",
                fontSize: "11px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
              formatter={(
                value: string | number | (string | number)[] | undefined,
              ) => {
                if (typeof value === "undefined")
                  return ["0 Uploads", "Activity"];
                const displayValue = Array.isArray(value) ? value[0] : value;
                return [`${displayValue} Uploads`, "Activity"] as [
                  string,
                  string,
                ];
              }}
            />

            <Bar
              dataKey="uploads"
              fill="url(#barGradient)"
              radius={[8, 8, 8, 8]}
              barSize={28}
              animationDuration={1800}
              filter="url(#shadow)"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  className="hover:opacity-80 hover:brightness-110 transition-all duration-300 cursor-pointer"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
