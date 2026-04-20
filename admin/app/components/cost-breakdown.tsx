"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface ContentStatusProps {
  overview: {
    users: { total: number };
    properties: { total: number };
    pendingProperties: number;
    blockedUsers: number;
  };
}

export default function ContentStatus({ overview }: ContentStatusProps) {
  const chartData = [
    {
      name: "Approved",
      value: overview.properties.total - overview.pendingProperties,
      color: "var(--admin-success)",
    },
    {
      name: "Pending",
      value: overview.pendingProperties,
      color: "var(--admin-warning)",
    },
    { name: "Blocked", value: overview.blockedUsers, color: "var(--admin-error)" },
  ];

  return (
    <div className="admin-surface w-full rounded-[2.5rem] p-6 transition-colors duration-300 lg:w-1/3">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-[var(--admin-text)]">Content Status</h3>
        <span className="rounded-full bg-[var(--admin-primary-soft)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--admin-primary)]">
          Live
        </span>
      </div>

      <div className="h-64 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={75}
              outerRadius={95}
              paddingAngle={8}
              dataKey="value"
              animationBegin={0}
              animationDuration={1500}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="var(--card-bg)"
                  strokeWidth={2}
                  className="hover:opacity-80 transition-opacity duration-300 outline-none"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card-bg)",
                borderRadius: "1.25rem",
                border: "1px solid var(--border)",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              }}
              itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
              formatter={(
                value: string | number | (string | number)[] | undefined,
              ) => {
                const displayValue = Array.isArray(value) ? value[0] : value;
                return [displayValue ?? 0, "Amount"] as [
                  number | string,
                  string,
                ];
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl font-black text-[var(--admin-text)]">
            {overview.properties.total}
          </span>
          <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[var(--admin-muted)]">
            Total Listings
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {chartData.map((item) => (
          <div
            key={item.name}
            className="group flex items-center justify-between rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-background)] p-3 px-4 transition-all hover:border-[var(--admin-primary-strong)]"
          >
            <div className="flex items-center gap-3">
              <div
                className="h-3 w-3 rounded-full shadow-sm transition-transform group-hover:scale-110"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-semibold text-[var(--admin-muted)]">
                {item.name}
              </span>
            </div>
            <span className="text-sm font-black text-[var(--admin-text)]">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
